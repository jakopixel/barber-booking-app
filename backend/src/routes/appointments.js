import express from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const r = express.Router();
const day = d => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const next = d => { const x = new Date(d); x.setDate(x.getDate() + 1); x.setHours(0,0,0,0); return x; };
const overlap = (a, b, c, d) => a < d && c < b;

r.get('/', requireAuth, async (req, res) => {
  const where = req.user.role === 'barber' ? { barber: { userId: req.user.id } } : { clientId: req.user.id };
  const { date, barberId, status } = req.query;
  if (date) where.dateTime = { gte: day(date), lt: next(date) };
  if (barberId) where.barberId = barberId;
  if (status) where.status = status;
  res.json(await prisma.appointment.findMany({ where, include: { service: true, barber: true, review: true }, orderBy: { dateTime: 'asc' } }));
});

r.post('/', requireAuth, async (req, res) => {
  try {
    const b = z.object({ barberId: z.string(), serviceId: z.string(), dateTime: z.string() }).parse(req.body);
    const [barber, service] = await Promise.all([
      prisma.barber.findFirst({ where: { id: b.barberId, subscriptionStatus: 'active' } }),
      prisma.service.findFirst({ where: { id: b.serviceId, barberId: b.barberId } })
    ]);
    if (!barber) return res.status(403).json({ error: 'Questo barbiere non è disponibile al momento' });
    if (!service) return res.status(404).json({ error: 'Servizio non trovato' });
    const start = new Date(b.dateTime), end = new Date(start.getTime() + service.duration * 60000);
    const busy = await prisma.appointment.findMany({ where: { barberId: b.barberId, status: { in: ['pending', 'confirmed'] }, dateTime: { gte: day(start), lt: next(start) } } });
    if (busy.some(a => overlap(+a.dateTime, +new Date(+a.dateTime + a.duration * 60000), +start, +end))) return res.status(409).json({ error: 'Slot non disponibile' });
    const appt = await prisma.appointment.create({ data: { clientId: req.user.id, barberId: b.barberId, serviceId: b.serviceId, dateTime: start, duration: service.duration, price: service.price } });
    res.json(appt);
  } catch (e) { console.error(e); res.status(400).json({ error: e.message }); }
});

r.patch('/:id/status', requireAuth, async (req, res) => {
  const { status } = z.object({ status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']) }).parse(req.body);
  const a = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!a) return res.status(404).json({ error: 'Not found' });
  if (req.user.role === 'client' && a.clientId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  if (req.user.role === 'barber') {
    const bar = await prisma.barber.findFirst({ where: { userId: req.user.id } });
    if (!bar || a.barberId !== bar.id) return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(await prisma.appointment.update({ where: { id: a.id }, data: { status } }));
});

r.delete('/:id', requireAuth, async (req, res) => {
  const a = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!a) return res.status(404).json({ error: 'Not found' });
  if (req.user.role === 'client' && a.clientId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await prisma.appointment.update({ where: { id: a.id }, data: { status: 'cancelled' } });
  res.json({ ok: true });
});

export default r;

