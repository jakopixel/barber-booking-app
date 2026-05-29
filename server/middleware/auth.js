import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';

export const verifyJWT = async (req, res, next) => {
  try {
    const t = req.headers.authorization?.split(' ')[1];
    if (!t) return res.status(401).json({ error: 'Unauthorized' });
    const p = jwt.verify(t, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: p.id }, include: { barber: { include: { shop: true } }, ownedShops: true } });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    next();
  } catch (e) { res.status(401).json({ error: 'Unauthorized' }); }
};

export const requireRole = roles => (req, res, next) => [].concat(roles).includes(req.user?.role) ? next() : res.status(403).json({ error: 'Forbidden' });
