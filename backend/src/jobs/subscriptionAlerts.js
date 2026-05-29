import { prisma } from '../prisma.js';
import { notify } from '../services/notify.js';
const d = n => new Date(Date.now() + n * 86400000);
export const sendSubscriptionAlerts = async () => {
  const soon = await prisma.barber.findMany({
    where: { subscriptionStatus: 'active', subscriptionEndDate: { gte: new Date(), lte: d(3) } },
    include: { user: true }
  });
  const expired = await prisma.barber.findMany({
    where: { subscriptionStatus: 'active', subscriptionEndDate: { lt: new Date() } },
    include: { user: true }
  });
  await Promise.all(soon.map(b => notify(b.user.email, 'Abbonamento in scadenza', `Il tuo abbonamento scade il ${b.subscriptionEndDate.toLocaleDateString('it-IT')}, rinnova per continuare`)));
  await Promise.all(expired.map(b => prisma.barber.update({ where: { id: b.id }, data: { subscriptionStatus: 'inactive' } }).then(() => notify(b.user.email, 'Abbonamento scaduto', 'Abbonamento scaduto, rinnova per riattivare il tuo profilo'))));
};

