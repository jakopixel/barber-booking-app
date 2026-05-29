import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import express from 'express';

const r = express.Router();
const s = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(['client', 'barber', 'owner']).default('client'),
  shopName: z.string().optional(),
  specialty: z.string().optional(),
  bio: z.string().optional()
});
const safe = u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, createdAt: u.createdAt, barber: u.barber, ownedShops: u.ownedShops });

r.post('/register', async (req, res) => {
  try {
    const b = s.parse(req.body);
    const password = await bcrypt.hash(b.password, 10);
    const user = await prisma.user.create({ data: { ...b, password } });
    if (b.role === 'barber') await prisma.barber.create({
      data: {
        userId: user.id, shopName: b.shopName || b.name, specialty: b.specialty || 'Taglio',
        bio: b.bio || '', subscriptionStatus: 'active', subscriptionEndDate: new Date(Date.now() + 7 * 86400000)
      }
    });
    const full = await prisma.user.findUnique({ where: { id: user.id }, include: { barber: true, ownedShops: true } });
    const token = jwt.sign({ id: full.id, email: full.email, role: full.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: safe(full) });
  } catch (e) { console.error(e); res.status(400).json({ error: e.message }); }
});

r.post('/login', async (req, res) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email }, include: { barber: true, ownedShops: true } });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Credenziali errate' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: safe(user) });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

r.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { barber: true, ownedShops: true } });
  res.json(safe(user));
});

export default r;
