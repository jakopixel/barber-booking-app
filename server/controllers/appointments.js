import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { verifyJWT, requireRole } from '../middleware/auth.js';

const r = express.Router();
const overlap = (a1, a2, b1, b2) => a1 < b2 && b1 < a2;

r.get('/', verifyJWT, async (req, res) => {
  try {
    const { date, barberId, status } = req.query;
    const where = req.user.role === 'client' ? { clientId: req.user.id } : req.user.role === 'barber' ? { barber: { userId: req.user.id } } : {};
    if (barberId) where.barberId = +barberId;
    if (status) where.status = status;
    if (date) where.dateTime = { gte: new Date(date), lt: new Date(new Date(date).getTime() + 864e5) };
    const items = await prisma.appointment.findMany({ where, include: { barber: { include: { user: true } }, service: true, client: true }, orderBy: { dateTime: 'asc' } });
    res.json(items);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

r.post('/', verifyJWT, requireRole(['client']), async (req, res) => {
  try {
    const { barberId, serviceId, dateTime } = z.object({ barberId: z.coerce.number().int(), serviceId: z.coerce.number().int(), dateTime: z.string() }).parse(req.body);
    const [bar, srv] = await Promise.all([prisma.barber.findUnique({ where: { id: barberId } }), prisma.service.findUnique({ where: { id: serviceId } })]);
    if (!bar || bar.subscriptionStatus !== 'active') return res.status(403).json({ error: 'Questo barbiere non è disponibile al momento' });
    if (!srv || srv.barberId !== bar.id) return res.status(400).json({ error: 'Servizio non valido' });
    const start = new Date(dateTime), end = new Date(start.getTime() + srv.duration * 6e4);
    const busy = await prisma.appointment.findMany({ where: { barberId, status: { in: ['pending', 'confirmed'] } } });
    if (busy.some(a => overlap(+a.dateTime, +new Date(+a.dateTime + a.duration * 6e4), +start, +end))) return res.status(409).json({ error: 'Slot non disponibile' });
    const appt = await prisma.appointment.create({ data: { clientId: req.user.id, barberId, serviceId, dateTime: start, duration: srv.duration, price: srv.price } });
    res.json(appt);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

r.patch('/:id/status', verifyJWT, requireRole(['barber']), async (req, res) => {
  try {
    const { status } = z.object({ status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']) }).parse(req.body);
    const bar = await prisma.barber.findUnique({ where: { userId: req.user.id } });
    const appt = await prisma.appointment.findUnique({ where: { id: +req.params.id } });
    if (!bar || !appt || appt.barberId !== bar.id) return res.status(404).json({ error: 'Not found' });
    res.json(await prisma.appointment.update({ where: { id: appt.id }, data: { status } }));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

r.delete('/:id', verifyJWT, async (req, res) => {
  try {
    const appt = await prisma.appointment.findUnique({ where: { id: +req.params.id } });
    const bar = req.user.role === 'barber' ? await prisma.barber.findUnique({ where: { userId: req.user.id } }) : null;
    if (!appt || (req.user.role === 'barber' && appt.barberId !== bar?.id && req.user.role !== 'owner')) return res.status(403).json({ error: 'Forbidden' });
    await prisma.appointment.update({ where: { id: appt.id }, data: { status: 'cancelled' } });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default r;
