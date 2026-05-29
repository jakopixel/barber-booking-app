export const km = (a, b, c, d) => {
  const R = 6371, x = p => p * Math.PI / 180, dx = x(c - a), dy = x(d - b);
  const s = Math.sin(dx / 2) ** 2 + Math.cos(x(a)) * Math.cos(x(c)) * Math.sin(dy / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)));
};

