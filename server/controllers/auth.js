import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { verifyJWT } from '../middleware/auth.js';

const r = express.Router();
const s = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6), phone: z.string().optional(), role: z.enum(['client', 'barber', 'owner']).default('client'), shopName: z.string().optional(), bio: z.string().optional(), specialty: z.string().optional() });
const safe = u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, createdAt: u.createdAt, barber: u.barber, ownedShops: u.ownedShops || [] });

r.post('/register', async (req, res) => {
  try {
    const b = s.parse(req.body), password = await bcrypt.hash(b.password, 10);
    const user = await prisma.user.create({ data: { name: b.name, email: b.email, password, phone: b.phone, role: b.role } });
    if (b.role === 'barber') await prisma.barber.create({ data: { userId: user.id, shopName: b.shopName || b.name, bio: b.bio || '', specialty: b.specialty || 'Taglio', subscriptionStatus: 'active', subscriptionEndDate: new Date(Date.now() + 7 * 864e5) } });
    const full = await prisma.user.findUnique({ where: { id: user.id }, include: { barber: { include: { shop: true } }, ownedShops: true } });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: safe(full) });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

r.post('/login', async (req, res) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email }, include: { barber: { include: { shop: true } }, ownedShops: true } });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Credenziali errate' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: safe(user) });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

r.get('/me', verifyJWT, async (req, res) => res.json(safe(req.user)));

export default r;
