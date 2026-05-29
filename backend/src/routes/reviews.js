import express from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const r = express.Router();

r.post('/reviews', requireAuth, async (req, res) => {
  try {
    const b = z.object({ appointmentId: z.string(), rating: z.number().int().min(1).max(5), comment: z.string().optional() }).parse(req.body);
    const a = await prisma.appointment.findFirst({ where: { id: b.appointmentId, clientId: req.user.id, status: 'completed' } });
    if (!a) return res.status(403).json({ error: 'Prenotazione non valida' });
    res.json(await prisma.review.upsert({
      where: { appointmentId: a.id },
      create: { ...b, appointmentId: a.id },
      update: { rating: b.rating, comment: b.comment }
    }));
  } catch (e) { console.error(e); res.status(400).json({ error: e.message }); }
});

r.get('/barbers/:barberId/reviews', async (req, res) => {
  res.json(await prisma.review.findMany({
    where: { appointment: { barberId: req.params.barberId } },
    orderBy: { createdAt: 'desc' }
  }));
});

export default r;
