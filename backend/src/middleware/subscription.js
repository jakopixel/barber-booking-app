import { prisma } from '../prisma.js';
export const loadBarber = async (req, res, next) => {
  const userId = req.user?.id, barberId = req.body?.barberId || req.params?.barberId || req.params?.id;
  const barber = await prisma.barber.findFirst({ where: userId ? { userId } : { id: barberId } });
  if (!barber) return res.status(404).json({ error: 'Barber not found' });
  if (barber.subscriptionStatus === 'active' && barber.subscriptionEndDate && barber.subscriptionEndDate < new Date()) {
    await prisma.barber.update({ where: { id: barber.id }, data: { subscriptionStatus: 'inactive' } });
    barber.subscriptionStatus = 'inactive';
  }
  req.barber = barber;
  next();
};
export const requireActiveSubscription = (req, res, next) =>
  req.barber?.subscriptionStatus === 'active' ? next() : res.status(403).json({ error: 'Abbonamento required' });

