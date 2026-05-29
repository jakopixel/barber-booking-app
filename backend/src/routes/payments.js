import express from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const r = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

r.post('/create-intent', requireAuth, async (req, res) => {
  try {
    const { appointmentId, amount } = z.object({ appointmentId: z.string(), amount: z.number().positive() }).parse(req.body);
    const pi = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), currency: 'eur',
      metadata: { appointmentId, userId: req.user.id }
    });
    res.json({ clientSecret: pi.client_secret });
  } catch (e) { console.error(e); res.status(400).json({ error: e.message }); }
});

export const paymentWebhook = async (req, res) => {
  try {
    const evt = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    const pi = evt.data.object;
    if (evt.type === 'payment_intent.succeeded') await prisma.appointment.updateMany({ where: { id: pi.metadata.appointmentId }, data: { paymentStatus: 'paid' } });
    if (evt.type === 'payment_intent.payment_failed') await prisma.appointment.updateMany({ where: { id: pi.metadata.appointmentId }, data: { paymentStatus: 'failed' } });
    res.json({ received: true });
  } catch (e) { console.error(e); res.status(400).send(`Webhook Error: ${e.message}`); }
};

export default r;

