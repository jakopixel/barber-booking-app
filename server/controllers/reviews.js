import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { verifyJWT, requireRole } from '../middleware/auth.js';

const r = express.Router();

r.post('/reviews', verifyJWT, requireRole(['client']), async (req, res) => {
  try {
    const { appointmentId, rating, comment } = z.object({ appointmentId: z.coerce.number().int(), rating: z.coerce.number().int().min(1).max(5), comment: z.string().optional() }).parse(req.body);
    const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appt || appt.clientId !== req.user.id || appt.status !== 'completed') return res.status(403).json({ error: 'Prenotazione non valida' });
    const rv = await prisma.review.create({ data: { appointmentId, clientId: req.user.id, barberId: appt.barberId, rating, comment } });
    const avg = await prisma.review.aggregate({ where: { barberId: appt.barberId }, _avg: { rating: true } });
    await prisma.barber.update({ where: { id: appt.barberId }, data: { rating: avg._avg.rating || 0 } });
    res.json(rv);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

r.get('/barbers/:barberId/reviews', async (req, res) => {
  try {
    const items = await prisma.review.findMany({ where: { barberId: +req.params.barberId }, include: { client: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
    res.json(items);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default r;
