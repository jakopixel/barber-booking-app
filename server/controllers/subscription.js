import express from 'express';
import { prisma } from '../utils/prisma.js';
import { stripe } from '../utils/stripe.js';
import { verifyJWT, requireRole } from '../middleware/auth.js';
import { requireActiveSubscription } from '../middleware/subscription.js';

const r = express.Router();
const notify = (email, msg) => console.log('notify', email, msg);

const checkout = async (req, res) => {
  try {
    const bar = await prisma.barber.findUnique({ where: { userId: req.user.id }, include: { user: true } });
    if (!bar) return res.status(404).json({ error: 'Barber not found' });
    const cid = bar.stripeCustomerId || (await stripe.customers.create({ email: bar.user.email, metadata: { barberId: String(bar.id) } })).id;
    if (!bar.stripeCustomerId) await prisma.barber.update({ where: { id: bar.id }, data: { stripeCustomerId: cid } });
    const s = await stripe.checkout.sessions.create({ mode: 'subscription', customer: cid, line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }], subscription_data: { trial_period_days: 7, metadata: { barberId: String(bar.id) } }, success_url: process.env.CLIENT_URL, cancel_url: process.env.CLIENT_URL });
    res.json({ url: s.url, sessionId: s.id });
  } catch (e) { res.status(400).json({ error: e.message }); }
};

r.post('/create-checkout', verifyJWT, requireRole(['barber']), checkout);
r.post('/create-checkest', verifyJWT, requireRole(['barber']), checkout);

r.post('/create-customer-portal', verifyJWT, requireRole(['barber']), async (req, res) => {
  try {
    const bar = await prisma.barber.findUnique({ where: { userId: req.user.id } });
    if (!bar) return res.status(404).json({ error: 'Barber not found' });
    if (!bar.stripeCustomerId) {
      const u = await prisma.user.findUnique({ where: { id: req.user.id } });
      const c = await stripe.customers.create({ email: u.email, metadata: { barberId: String(bar.id) } });
      await prisma.barber.update({ where: { id: bar.id }, data: { stripeCustomerId: c.id } });
      bar.stripeCustomerId = c.id;
    }
    const s = await stripe.billingPortal.sessions.create({ customer: bar.stripeCustomerId, return_url: process.env.CLIENT_URL });
    res.json({ url: s.url });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

r.get('/my-subscription', verifyJWT, requireRole(['barber']), async (req, res) => {
  try {
    const bar = await prisma.barber.findUnique({ where: { userId: req.user.id }, include: { subscriptions: { orderBy: { id: 'desc' }, take: 1 } } });
    if (!bar) return res.status(404).json({ error: 'Barber not found' });
    res.json({ subscriptionStatus: bar?.subscriptionStatus || 'inactive', endDate: bar?.subscriptionEndDate || null, plan: bar?.subscriptions?.[0]?.plan || 'monthly' });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export const webhook = async (req, res) => {
  try {
    const evt = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    const sub = evt.data.object;
    const bar = await prisma.barber.findFirst({ where: { OR: [{ stripeCustomerId: sub.customer }, { stripeSubscriptionId: sub.id }] }, include: { user: true } });
    if (!bar) return res.json({ ok: true });
    if (evt.type === 'customer.subscription.updated') {
      const active = sub.status === 'active';
      await prisma.barber.update({ where: { id: bar.id }, data: { subscriptionStatus: active ? 'active' : 'inactive', subscriptionEndDate: active ? new Date(Date.now() + 30 * 864e5) : bar.subscriptionEndDate, stripeSubscriptionId: sub.id } });
      await prisma.subscription.upsert({ where: { barberId: bar.id }, create: { barberId: bar.id, plan: 'monthly', startDate: new Date(), endDate: new Date(Date.now() + 30 * 864e5), amount: 15, status: active ? 'active' : 'expired', stripeSubscriptionId: sub.id }, update: { endDate: new Date(Date.now() + 30 * 864e5), status: active ? 'active' : 'expired', stripeSubscriptionId: sub.id } });
    }
    if (evt.type === 'customer.subscription.deleted') await prisma.barber.update({ where: { id: bar.id }, data: { subscriptionStatus: 'inactive' } });
    if (evt.type === 'invoice.payment_failed' || evt.type === 'payment_intent.payment_failed') notify(bar.user.email, `Abbonamento scaduto, rinnova per riattivare il tuo profilo`);
    res.sendStatus(200);
  } catch (e) { res.status(400).send(`Webhook Error: ${e.message}`); }
};

export default r;
