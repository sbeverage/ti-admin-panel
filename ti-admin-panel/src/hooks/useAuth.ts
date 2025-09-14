import { useState, useEffect } from 'react';

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
    // Check if user is already authenticated
    const checkAuth = () => {
      const isAuth = localStorage.getItem('admin_authenticated') === 'true';
      const username = localStorage.getItem('admin_username');
      
      setAuthState({
        isAuthenticated: isAuth,
        username: isAuth ? username : null,
        loading: false
      });
    };

    checkAuth();
  }, []);

  const login = (username: string) => {
    localStorage.setItem('admin_authenticated', 'true');
    localStorage.setItem('admin_username', username);
    setAuthState({
      isAuthenticated: true,
      username,
      loading: false
    });
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_username');
    
    // Update state
    setAuthState({
      isAuthenticated: false,
      username: null,
      loading: false
    });
    
    // Force redirect to login page
    window.location.href = '/';
  };

  return {
    ...authState,
    login,
    logout
  };
};
