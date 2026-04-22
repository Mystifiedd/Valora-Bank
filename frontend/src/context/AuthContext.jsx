import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import api from '../api/axios';
import { onAuthEvent } from '../utils/authEvents';
import { getTokenExpiry, isTokenExpired } from '../utils/token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: jwt, user: userData } = res.data;
    sessionStorage.setItem('token', jwt);
    sessionStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common.Authorization = `Bearer ${jwt}`;
    setToken(jwt);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.post('/auth/register', payload);
    return res.data;
  }, []);

  const logout = useCallback(({ redirect } = { redirect: false }) => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    api.defaults.headers.common.Authorization = '';
    setToken(null);
    setUser(null);
    if (redirect) {
      window.location.replace('/login');
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    if (isTokenExpired(token)) {
      logout({ redirect: true });
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        logout({ redirect: true });
      })
      .finally(() => setLoading(false));
  }, [token, logout]);

  useEffect(() => {
    if (!token) return undefined;
    const expiry = getTokenExpiry(token);
    if (!expiry) return undefined;
    const timeoutMs = Math.max(expiry - Date.now(), 0);
    const timeoutId = setTimeout(() => {
      logout({ redirect: true });
    }, timeoutMs);
    return () => clearTimeout(timeoutId);
  }, [token, logout]);

  useEffect(() => {
    const unsubscribe = onAuthEvent((event) => {
      if (event.type === 'logout') {
        logout({ redirect: true });
      }
    });
    return unsubscribe;
  }, [logout]);

  const contextValue = useMemo(
    () => ({ user, setUser, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
