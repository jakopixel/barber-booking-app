import express from 'express';
import { prisma } from '../utils/prisma.js';
import { verifyJWT, requireRole } from '../middleware/auth.js';

const r = express.Router();

r.get('/dashboard', verifyJWT, requireRole(['owner']), async (req, res) => {
  try {
    const shops = await prisma.shop.findMany({ where: { ownerId: req.user.id }, include: { barbers: true } });
    const activeBarbers = shops.flatMap(s => s.barbers).filter(b => b.subscriptionStatus === 'active').length;
    const monthly = [80, 120, 150, 180, 210, 250].map(n => n + activeBarbers * 15);
    res.json({ shops, activeBarbers, revenue: activeBarbers * 15, monthly });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default r;
