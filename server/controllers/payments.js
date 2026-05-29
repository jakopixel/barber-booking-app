import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { stripe } from '../utils/stripe.js';
import { verifyJWT, requireRole } from '../middleware/auth.js';

const r = express.Router();

r.post('/create-intent', verifyJWT, requireRole(['client']), async (req, res) => {
  try {
    const { appointmentId, amount } = z.object({ appointmentId: z.coerce.number().int(), amount: z.coerce.number().positive() }).parse(req.body);
    const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appt || appt.clientId !== req.user.id) return res.status(404).json({ error: 'Not found' });
    const pi = await stripe.paymentIntents.create({ amount: Math.round(amount * 100), currency: 'eur', metadata: { appointmentId: String(appointmentId) } });
    res.json({ clientSecret: pi.client_secret });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export const webhook = async (req, res) => {
  try {
    const evt = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    const pi = evt.data.object, id = +pi.metadata.appointmentId;
    if (evt.type === 'payment_intent.succeeded') await prisma.appointment.update({ where: { id }, data: { paymentStatus: 'paid' } });
    if (evt.type === 'payment_intent.payment_failed') await prisma.appointment.update({ where: { id }, data: { paymentStatus: 'failed' } });
    res.sendStatus(200);
  } catch (e) { res.status(400).send(`Webhook Error: ${e.message}`); }
};

export default r;
