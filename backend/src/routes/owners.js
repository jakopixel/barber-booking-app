import express from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const r = express.Router();

r.get('/dashboard', requireAuth, requireRole('owner'), async (req, res) => {
  const activeBarbers = await prisma.barber.count({ where: { subscriptionStatus: 'active', shop: { ownerId: req.user.id } } });
  const shops = await prisma.shop.findMany({ where: { ownerId: req.user.id }, include: { barbers: true } });
  res.json({ activeBarbers, revenue: activeBarbers * 15, shops });
});

export default r;

