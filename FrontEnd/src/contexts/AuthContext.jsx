import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('academia.token'));
  const [pendingEmail, setPendingEmail] = useState(null);

  const user = useMemo(() => decodeToken(token), [token]);
  const isAuthenticated = Boolean(token && user && !isTokenExpired(user));
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    if (token && (!user || isTokenExpired(user))) {
      logout();
    }
  }, [token, user]);

  useEffect(() => {
    function handleUnauthorized() {
      logout();
    }

    window.addEventListener('academia:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('academia:unauthorized', handleUnauthorized);
  }, []);

  async function login(email, password) {
    const result = await authService.login({ email, password });

    if (result.requiresTwoFactor) {
      setPendingEmail(email);
      return result;
    }

    persistToken(result.accessToken);
    return result;
  }

  async function verifyTwoFactor(code) {
    const result = await authService.verifyTwoFactor({ email: pendingEmail, code });
    persistToken(result.accessToken);
    setPendingEmail(null);
    return result;
  }

  function persistToken(accessToken) {
    localStorage.setItem('academia.token', accessToken);
    setToken(accessToken);
  }

  function logout() {
    localStorage.removeItem('academia.token');
    setToken(null);
    setPendingEmail(null);
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated, isAdmin, pendingEmail, login, verifyTwoFactor, logout }),
    [token, user, isAuthenticated, isAdmin, pendingEmail]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function decodeToken(token) {
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return {
      id: payload.nameid ?? payload.sub,
      email: payload.email,
      name: payload.unique_name,
      role: payload.role ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      exp: payload.exp
    };
  } catch {
    return null;
  }
}

function isTokenExpired(user) {
  if (!user?.exp) {
    return true;
  }

  return Date.now() >= user.exp * 1000;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
