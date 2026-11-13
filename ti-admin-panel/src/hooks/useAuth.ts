import { useState, useEffect } from 'react';
import {
  clearAdminSession,
  getAdminDisplayName,
  isAdminSignedIn,
} from '../services/adminSession';

// Signed in means holding an unexpired admin token, not a localStorage flag.
// The flag used to be the whole gate, and it gated only this screen: the API
// authenticated on a shared secret shipped in the bundle, so setting
// admin_authenticated by hand in a console was enough to get in, and not
// setting it stopped nobody who called the API directly.
//
// Expiry now comes from the token the server issued, so it cannot be extended
// from the browser. getAdminToken() clears the session once it passes.

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
      // isAdminSignedIn() clears an expired session as a side effect, so a
      // stale token never survives a reload.
      const isAuth = isAdminSignedIn();
      setAuthState({
        isAuthenticated: isAuth,
        username: isAuth ? getAdminDisplayName() : null,
        loading: false
      });
    };

    checkAuth();
  }, []);

  // AdminLogin has already stored the token and profile by the time this runs;
  // this only moves the UI. The expiry is the server's, not one made up here.
  const login = (username: string) => {
    setAuthState({
      isAuthenticated: true,
      username,
      loading: false
    });
  };

  const logout = () => {
    clearAdminSession();

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
