import jwt from 'jsonwebtoken';
export const requireAuth = (req, res, next) => {
  try {
    const t = req.headers.authorization?.split(' ')[1];
    if (!t) return res.status(401).json({ error: 'Unauthorized' });
    req.user = jwt.verify(t, process.env.JWT_SECRET);
    next();
  } catch (e) { res.status(401).json({ error: 'Unauthorized' }); }
};
export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : res.status(403).json({ error: 'Forbidden' });

