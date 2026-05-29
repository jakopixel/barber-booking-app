import express from 'express';
import { prisma } from '../prisma.js';
import { km } from '../utils/haversine.js';

const r = express.Router();

r.get('/nearby', async (req, res) => {
  const { lat, lng, radius = 10 } = req.query;
  const items = await prisma.shop.findMany({ include: { barbers: true } });
  const out = items.map(s => ({ ...s, distanceKm: lat && lng && s.lat != null && s.lng != null ? km(+lat, +lng, s.lat, s.lng) : null }))
    .filter(s => s.distanceKm == null || s.distanceKm <= +radius)
    .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
  res.json(out);
});

r.get('/:id', async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { id: req.params.id }, include: { barbers: { include: { services: true } } } });
  if (!shop) return res.status(404).json({ error: 'Not found' });
  res.json(shop);
});

export default r;

