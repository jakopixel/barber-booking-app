import express from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { loadBarber, requireActiveSubscription } from '../middleware/subscription.js';

const r = express.Router();

r.get('/barbers/:barberId/services', async (req, res) => {
  const barber = await prisma.barber.findFirst({ where: { id: req.params.barberId, subscriptionStatus: 'active' } });
  if (!barber) return res.status(404).json({ error: 'Not found' });
  res.json(await prisma.service.findMany({ where: { barberId: barber.id } }));
});

r.post('/services', requireAuth, requireRole('barber'), loadBarber, requireActiveSubscription, async (req, res) => {
  try {
    const b = z.object({ name: z.string().min(2), duration: z.number().int().positive(), price: z.number().nonnegative(), description: z.string().optional() }).parse(req.body);
    const srv = await prisma.service.create({ data: { ...b, barberId: req.barber.id } });
    res.json(srv);
  } catch (e) { console.error(e); res.status(400).json({ error: e.message }); }
});

export default r;
