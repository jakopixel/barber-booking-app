import { prisma } from '../utils/prisma.js';

export const requireActiveSubscription = async (req, res, next) => {
  try {
    const bar = await prisma.barber.findUnique({ where: { userId: req.user.id } });
    if (!bar || bar.subscriptionStatus !== 'active') return res.status(403).json({ error: 'Abbonamento richiesto' });
    req.barber = bar;
    next();
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
};

