import { useEffect, useState } from 'react';
export const useDebouncedValue = (v, d = 300) => {
  const [x, setX] = useState(v);
  useEffect(() => { const t = setTimeout(() => setX(v), d); return () => clearTimeout(t); }, [v, d]);
  return x;
};

