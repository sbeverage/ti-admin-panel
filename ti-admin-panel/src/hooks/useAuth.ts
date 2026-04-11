import { useState, useEffect } from 'react';

// Session expires after 8 hours of inactivity
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    loading: true
  });

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('admin_authenticated') === 'true';
      const username = localStorage.getItem('admin_username');
      const expiryStr = localStorage.getItem('admin_session_expiry');

      if (isAuth && expiryStr) {
        const expiry = parseInt(expiryStr, 10);
        if (Date.now() > expiry) {
          // Session expired — clear everything
          localStorage.removeItem('admin_authenticated');
          localStorage.removeItem('admin_username');
          localStorage.removeItem('admin_email');
          localStorage.removeItem('admin_session_expiry');
          setAuthState({ isAuthenticated: false, username: null, loading: false });
          return;
        }
      }

      setAuthState({
        isAuthenticated: isAuth,
        username: isAuth ? username : null,
        loading: false
      });
    };

    checkAuth();
  }, []);

  const login = (username: string) => {
    const expiry = Date.now() + SESSION_DURATION_MS;
    localStorage.setItem('admin_authenticated', 'true');
    localStorage.setItem('admin_username', username);
    localStorage.setItem('admin_session_expiry', String(expiry));
    setAuthState({
      isAuthenticated: true,
      username,
      loading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_username');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_session_expiry');

    setAuthState({
      isAuthenticated: false,
      username: null,
      loading: false
    });

    window.location.href = '/';
  };

  return {
    ...authState,
    login,
    logout
  };
};
