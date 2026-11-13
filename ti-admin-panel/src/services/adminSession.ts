/**
 * The signed-in admin's session.
 *
 * This replaces the shared admin secret. That secret was read from
 * REACT_APP_ADMIN_SECRET, and Create React App inlines REACT_APP_* into the
 * bundle at build time, so the working key was a string literal in the public
 * JavaScript at admin.forpurposetechnologies.com. It was also the only gate on
 * the admin API: donor names, emails, giving history and donor deletion. The
 * login screen did not help, because it set a localStorage flag and the API
 * never checked it.
 *
 * Now POST /admin/settings/team/login returns a token tied to one person,
 * expiring in eight hours, and every admin request carries it. Nothing
 * privileged is baked into the bundle.
 *
 * The token lives in localStorage rather than sessionStorage, deliberately:
 * sessionStorage is per-tab, so opening the panel in a second tab would mean
 * signing in again. The trade is that script running on this origin could read
 * the token, which is bounded by the eight-hour expiry. Moving to a
 * HttpOnly cookie would close that, and needs the API and the panel to share a
 * domain, which they do not today.
 */

const TOKEN_KEY = 'admin_token';
const EXPIRY_KEY = 'admin_session_expiry';

/** Every key the session writes, so sign-out cannot miss one. */
const SESSION_KEYS = [
  TOKEN_KEY,
  EXPIRY_KEY,
  'admin_authenticated',
  'admin_username',
  'admin_email',
  'admin_is_super_admin',
  'admin_must_reset_password',
];

export interface AdminLoginData {
  token?: string;
  expires_at?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  is_super_admin?: boolean;
  must_reset_password?: boolean;
}

const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/**
 * The token, or null if there isn't one or it has expired.
 *
 * Expiry is checked here as well as by the server. The server is what actually
 * enforces it; this only avoids sending a request that is certain to 401.
 */
export const getAdminToken = (): string | null => {
  const token = safeGet(TOKEN_KEY);
  if (!token) return null;

  const expiry = safeGet(EXPIRY_KEY);
  if (expiry) {
    const at = Date.parse(expiry);
    if (!Number.isNaN(at) && Date.now() >= at) {
      clearAdminSession();
      return null;
    }
  }
  return token;
};

export const isAdminSignedIn = (): boolean => getAdminToken() !== null;

/** True while this account is still using the password it was emailed. */
export const mustResetPassword = (): boolean =>
  safeGet('admin_must_reset_password') === 'true';

export const getAdminDisplayName = (): string | null =>
  safeGet('admin_username');

export const isSuperAdmin = (): boolean =>
  safeGet('admin_is_super_admin') === 'true';

/** Store everything the login returned. Returns the display name. */
export const setAdminSession = (data: AdminLoginData, fallbackEmail: string): string => {
  const displayName = data.name || data.email || fallbackEmail;
  const superAdmin =
    data.is_super_admin ??
    String(data.role || '').trim().toLowerCase() === 'super admin';

  try {
    if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
    if (data.expires_at) localStorage.setItem(EXPIRY_KEY, data.expires_at);
    localStorage.setItem('admin_authenticated', 'true');
    localStorage.setItem('admin_username', displayName);
    localStorage.setItem('admin_email', data.email || fallbackEmail);
    localStorage.setItem('admin_is_super_admin', superAdmin ? 'true' : 'false');
    localStorage.setItem(
      'admin_must_reset_password',
      data.must_reset_password === true ? 'true' : 'false'
    );
  } catch {
    // Private browsing, or storage disabled. The sign-in cannot be remembered,
    // which the caller surfaces rather than failing silently.
  }

  return displayName;
};

export const clearAdminSession = (): void => {
  try {
    SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    /* nothing to clear */
  }
};
