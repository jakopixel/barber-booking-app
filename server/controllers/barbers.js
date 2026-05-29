import express from 'express';
import { prisma } from '../utils/prisma.js';

const r = express.Router();
const km = (a, b, c, d) => { const R = 6371, x = p => p * Math.PI / 180, p = x(c - a), q = x(d - b), s = Math.sin(p / 2) ** 2 + Math.cos(x(a)) * Math.cos(x(c)) * Math.sin(q / 2) ** 2; return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)); };

const list = async (req, res) => {
  try {
    const { search = '', lat, lng, radius = 50, minRating, specialty, page = 1 } = req.query, take = 20, skip = (page - 1) * take;
    const where = { subscriptionStatus: 'active' };
    if (search) where.OR = [{ shopName: { contains: search, mode: 'insensitive' } }, { bio: { contains: search, mode: 'insensitive' } }, { specialty: { contains: search, mode: 'insensitive' } }, { user: { name: { contains: search, mode: 'insensitive' } } }];
    if (minRating) where.rating = { gte: +minRating };
    if (specialty) where.specialty = { contains: specialty, mode: 'insensitive' };
    const items = await prisma.barber.findMany({ where, include: { user: true, services: true, reviews: { include: { client: { select: { name: true } } } } } });
    let out = items.map(b => ({ ...b, distance: lat && lng && b.lat != null && b.lng != null ? km(+lat, +lng, b.lat, b.lng) : null }));
    if (lat && lng) out = out.filter(b => b.distance != null && b.distance <= +radius).sort((a, b) => a.distance - b.distance);
    const total = out.length;
    res.json({ items: out.slice(skip, skip + take), total, page: +page, hasMore: skip + take < total });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
};

r.get('/', list);
r.get('/search', list);
r.get('/:id', async (req, res) => {
  try {
    const bar = await prisma.barber.findUnique({ where: { id: +req.params.id }, include: { user: true, services: true, reviews: { include: { client: { select: { name: true } } } } } });
    if (!bar || bar.subscriptionStatus !== 'active') return res.status(404).json({ error: 'Not found' });
    res.json(bar);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

export default r;
