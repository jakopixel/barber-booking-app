const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
let token = '';
export const setToken = t => { token = t || ''; };
export const request = async (path, opt = {}) => {
  const res = await fetch(`${API}${path}`, {
    ...opt,
    headers: {
      ...(opt.body && !(opt.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opt.headers || {})
    },
    body: opt.body && !(opt.body instanceof FormData) ? JSON.stringify(opt.body) : opt.body
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Errore');
  return data;
};

