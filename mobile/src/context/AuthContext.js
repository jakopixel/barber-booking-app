import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { request, setToken } from '../api/client.js';

const Ctx = createContext(null);
const key = 'barber-auth';
const sync = async auth => {
  if (auth?.token) await AsyncStorage.setItem(key, JSON.stringify(auth));
  else await AsyncStorage.removeItem(key);
  setToken(auth?.token);
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null, token: '', loading: true });

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return setAuth(a => ({ ...a, loading: false }));
      const stored = JSON.parse(raw);
      setToken(stored.token);
      try {
        const user = await request('/api/auth/me');
        setAuth({ user, token: stored.token, loading: false });
      } catch {
        await sync(null);
        setAuth({ user: null, token: '', loading: false });
      }
    })();
  }, []);

  const signIn = async (email, password) => {
    const { token, user } = await request('/api/auth/login', { method: 'POST', body: { email, password } });
    await sync({ token, user });
    setAuth({ token, user, loading: false });
  };

  const signUp = async body => {
    const { token, user } = await request('/api/auth/register', { method: 'POST', body });
    await sync({ token, user });
    setAuth({ token, user, loading: false });
  };

  const logout = async () => { await sync(null); setAuth({ user: null, token: '', loading: false }); };
  const refresh = async () => { if (!auth.token) return; const user = await request('/api/auth/me'); setAuth(a => ({ ...a, user })); };

  const value = useMemo(() => ({ ...auth, signIn, signUp, logout, refresh }), [auth]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);

