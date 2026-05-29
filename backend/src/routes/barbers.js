import express from 'express';
import { prisma } from '../prisma.js';
import { km } from '../utils/haversine.js';

const r = express.Router();
const n = v => (v === undefined || v === '' ? undefined : +v);
const pick = b => ({ id: b.id, shopName: b.shopName, bio: b.bio, photo: b.photo, rating: b.rating, specialty: b.specialty, subscriptionStatus: b.subscriptionStatus, subscriptionEndDate: b.subscriptionEndDate, distanceKm: b.distanceKm, shop: b.shop, user: b.user });

async function list(req, res) {
  try {
    const { q = '', lat, lng, radius = 50, minRating, specialty, page = 1, limit = 20 } = req.query;
    const where = { subscriptionStatus: 'active' };
    if (q.trim()) where.OR = [
      { shopName: { contains: q, mode: 'insensitive' } },
      { bio: { contains: q, mode: 'insensitive' } },
      { specialty: { contains: q, mode: 'insensitive' } },
      { user: { name: { contains: q, mode: 'insensitive' } } },
      { shop: { address: { contains: q, mode: 'insensitive' } } }
    ];
    if (minRating) where.rating = { gte: n(minRating) };
    const specs = String(specialty || '').split(',').map(s => s.trim()).filter(Boolean);
    if (specs.length) where.AND = [...(where.AND || []), { OR: specs.map(x => ({ specialty: { contains: x, mode: 'insensitive' } })) }];
    const items = await prisma.barber.findMany({ where, include: { user: true, shop: true }, orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }] });
    let out = items.map(b => ({ ...b, distanceKm: lat && lng && b.shop?.lat != null && b.shop?.lng != null ? km(+lat, +lng, b.shop.lat, b.shop.lng) : null }));
    if (lat && lng) out = out.filter(b => b.distanceKm == null || b.distanceKm <= +radius).sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    const total = out.length, s = (page - 1) * limit, e = s + +limit;
    res.json({ items: out.slice(s, e).map(pick), total, page: +page, limit: +limit, hasMore: e < total });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
}

r.get('/', list);
r.get('/search', list);
r.get('/:id', async (req, res) => {
  const bar = await prisma.barber.findFirst({
    where: { id: req.params.id, subscriptionStatus: 'active' },
    include: { user: true, shop: true, services: true, reviews: { include: { appointment: true }, orderBy: { createdAt: 'desc' } } }
  });
  if (!bar) return res.status(404).json({ error: 'Not found' });
  res.json(bar);
});

export default r;
