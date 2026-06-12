import { useCallback, useEffect, useState } from 'react';
import { ADMIN_TOKEN_KEY, adminFetch, adminLogin } from '../utils/adminApi';

export function useAdminAuth() {
  const [token, setToken] = useState('');
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : '';
    if (!saved) {
      setChecking(false);
      return;
    }

    setToken(saved);
    adminFetch('/api/admin/auth', { method: 'POST', body: { token: saved } })
      .then(() => setAuthed(true))
      .catch(() => localStorage.removeItem(ADMIN_TOKEN_KEY))
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (email, password) => {
    setError('');
    setLoading(true);
    try {
      const data = await adminLogin(email, password);
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setToken(data.token);
      setAuthed(true);
    } catch (err) {
      setError(err.message);
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken('');
    setAuthed(false);
    setError('');
  }, []);

  return { token, authed, checking, error, loading, login, logout, setError };
}
