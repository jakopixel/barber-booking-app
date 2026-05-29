import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { verifyJWT, requireRole } from '../middleware/auth.js';

const r = express.Router();
const s = z.object({ name: z.string().min(2), address: z.string().min(2), phone: z.string().min(5), lat: z.coerce.number().optional(), lng: z.coerce.number().optional(), openingHours: z.string().optional(), photo: z.string().optional(), description: z.string().optional() });

r.post('/', verifyJWT, requireRole(['barber', 'owner']), async (req, res) => {
  try {
    const body = s.parse(req.body), shop = await prisma.shop.create({ data: { ...body, ownerId: req.user.id } });
    if (req.user.role === 'barber') await prisma.barber.updateMany({ where: { userId: req.user.id }, data: { shopId: shop.id, shopName: body.name } });
    res.status(201).json(shop);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

r.get('/my-shop', verifyJWT, requireRole(['barber']), async (req, res) => {
  try {
    const shop = await prisma.shop.findFirst({ where: { ownerId: req.user.id }, include: { barbers: { include: { user: true } } } });
    if (!shop) return res.status(404).json({ error: 'Not found' });
    res.json(shop);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

r.patch('/:id', verifyJWT, requireRole(['owner']), async (req, res) => {
  try {
    const body = s.partial().parse(req.body), shop = await prisma.shop.findFirst({ where: { id: +req.params.id, ownerId: req.user.id } });
    if (!shop) return res.status(404).json({ error: 'Not found' });
    res.json(await prisma.shop.update({ where: { id: shop.id }, data: body }));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

r.get('/:id', async (req, res) => {
  try {
    const shop = await prisma.shop.findUnique({ where: { id: +req.params.id }, include: { barbers: { include: { user: true, reviews: true } } } });
    if (!shop) return res.status(404).json({ error: 'Not found' });
    res.json(shop);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default r;
