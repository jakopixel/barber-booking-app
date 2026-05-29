import express from 'express';
import Stripe from 'stripe';
import { prisma } from '../prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { loadBarber, requireActiveSubscription } from '../middleware/subscription.js';

const r = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

r.post('/create-checkout', requireAuth, requireRole('barber'), loadBarber, async (req, res) => {
  try {
    const barber = req.barber;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const customer = barber.stripeCustomerId || (await stripe.customers.create({ email: user.email, metadata: { barberId: barber.id } })).id;
    if (!barber.stripeCustomerId) await prisma.barber.update({ where: { id: barber.id }, data: { stripeCustomerId: customer } });
    const trial = !barber.stripeSubscriptionId ? { trial_period_days: 7 } : {};
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      subscription_data: { ...trial, metadata: { barberId: barber.id } },
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/subscription`
    });
    res.json({ url: session.url });
  } catch (e) { console.error(e); res.status(400).json({ error: e.message }); }
});

r.post('/create-customer-portal', requireAuth, requireRole('barber'), loadBarber, async (req, res) => {
  try {
    const session = await stripe.billingPortal.sessions.create({ customer: req.barber.stripeCustomerId, return_url: `${process.env.CLIENT_URL}/subscription` });
    res.json({ url: session.url });
  } catch (e) { console.error(e); res.status(400).json({ error: e.message }); }
});

r.get('/my-subscription', requireAuth, requireRole('barber'), loadBarber, async (req, res) => {
  const sub = await prisma.subscription.findFirst({ where: { barberId: req.barber.id }, orderBy: { createdAt: 'desc' } });
  res.json({ barber: req.barber, subscription: sub });
});

export const subscriptionWebhook = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const evt = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    const sub = evt.data.object;
    const customerId = sub.customer;
    const barber = await prisma.barber.findFirst({ where: { OR: [{ stripeSubscriptionId: sub.id }, { stripeCustomerId: customerId }] } });
    if (!barber) return res.json({ ok: true });
    if (['customer.subscription.created', 'customer.subscription.updated'].includes(evt.type)) {
      const end = new Date((sub.current_period_end || sub.trial_end || Date.now() / 1000) * 1000);
      await prisma.$transaction([
        prisma.barber.update({ where: { id: barber.id }, data: { subscriptionStatus: 'active', subscriptionEndDate: end, stripeSubscriptionId: sub.id } }),
        prisma.subscription.upsert({
          where: { stripeSubscriptionId: sub.id },
          create: { barberId: barber.id, plan: 'monthly', startDate: new Date((sub.current_period_start || Date.now() / 1000) * 1000), endDate: end, amount: 15, status: 'active', stripeSubscriptionId: sub.id },
          update: { endDate: end, status: 'active', amount: 15 }
        })
      ]);
    }
    if (evt.type === 'customer.subscription.deleted') await prisma.$transaction([
      prisma.barber.update({ where: { id: barber.id }, data: { subscriptionStatus: 'inactive' } }),
      prisma.subscription.updateMany({ where: { barberId: barber.id, stripeSubscriptionId: sub.id }, data: { status: 'cancelled' } })
    ]);
    if (evt.type === 'invoice.payment_failed') await prisma.$transaction([
      prisma.barber.update({ where: { id: barber.id }, data: { subscriptionStatus: 'inactive' } }),
      prisma.subscription.updateMany({ where: { barberId: barber.id, stripeSubscriptionId: sub.subscription || sub.id }, data: { status: 'expired' } })
    ]);
    res.json({ received: true });
  } catch (e) { console.error(e); res.status(400).send(`Webhook Error: ${e.message}`); }
};

export default r;
