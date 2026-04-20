import { supabase, isSupabaseConfigured } from './supabase';
import { AuthUser, AuthSession } from '../types';

const AUTH_SESSION_KEY = 'clock-me-auth-session';
const GUEST_USER_KEY = 'clock-me-guest-user';

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {}

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,32}$/;

const normalizeUsername = (username: string): string => username.trim().toLowerCase();

const toInternalAuthPassword = async (password: string): Promise<string> => {
  const source = `clockme-v1:${password}`;
  const data = new TextEncoder().encode(source);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return `cmv1_${hash}`;
};

/**
 * Attempt to restore a session from localStorage (guest or previous session)
 */
export const restoreSession = (): AuthSession | null => {
  const guestStr = localStorage.getItem(GUEST_USER_KEY);
  if (guestStr) {
    try {
      const guest = JSON.parse(guestStr);
      return { user: guest, isGuest: true, isAuthenticated: false };
    } catch (e) {
      console.warn('Failed to restore guest session:', e);
    }
  }

  if (!isSupabaseConfigured) {
    return null;
  }

  // Check for stored auth session
  const authStr = localStorage.getItem(AUTH_SESSION_KEY);
  if (authStr) {
    try {
      const session = JSON.parse(authStr);
      if (session.user && session.expiresAt && new Date(session.expiresAt) > new Date()) {
        return session;
      }
    } catch (e) {
      console.warn('Failed to restore auth session:', e);
    }
  }

  return null;
};

/**
 * Create a guest user for offline mode
 */
export const createGuestUser = (): AuthUser => {
  const guestUsername = `guest-${Date.now()}`;
  const guestUser: AuthUser = {
    id: `guest-${Date.now()}`,
    username: guestUsername,
    isGuest: true,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
  return guestUser;
};

/**
 * Sign up a new user with Supabase
 */
export const signUp = async (data: SignUpData): Promise<{ user: AuthUser; session: AuthSession } | { error: string }> => {
  if (!supabase) {
    return { error: 'Supabase not configured. Please try guest mode.' };
  }

  try {
    const username = normalizeUsername(data.username);
    if (!USERNAME_REGEX.test(username)) {
      return { error: 'Username must be 3-32 characters and can only include letters, numbers, ., _, and -.' };
    }

    const passwordHash = await toInternalAuthPassword(data.password);

    const { data: insertedUser, error } = await supabase
      .from('cm_users')
      .insert({
        username,
        password_hash: passwordHash,
      })
      .select('id, username, created_at')
      .single();

    if (error || !insertedUser) {
      return { error: error?.message || 'Sign up failed' };
    }

    const authUser: AuthUser = {
      id: insertedUser.id,
      username,
      isGuest: false,
      createdAt: insertedUser.created_at,
    };

    const session: AuthSession = {
      user: authUser,
      isAuthenticated: true,
      isGuest: false,
      token: `cm_local_${insertedUser.id}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Store session
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));

    return { user: authUser, session };
  } catch (error) {
    console.error('Sign up error:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error during sign up' };
  }
};

/**
 * Sign in with username and password
 */
export const signIn = async (credentials: AuthCredentials): Promise<{ user: AuthUser; session: AuthSession } | { error: string }> => {
  if (!supabase) {
    return { error: 'Supabase not configured. Please try guest mode.' };
  }

  try {
    const username = normalizeUsername(credentials.username);
    if (!USERNAME_REGEX.test(username)) {
      return { error: 'Invalid username format.' };
    }

    const passwordHash = await toInternalAuthPassword(credentials.password);

    const { data: userRow, error } = await supabase
      .from('cm_users')
      .select('id, username, password_hash, created_at')
      .eq('username', username)
      .single();

    if (error || !userRow) {
      return { error: 'Sign in failed' };
    }

    if (userRow.password_hash !== passwordHash) {
      return { error: 'Sign in failed' };
    }

    const authUser: AuthUser = {
      id: userRow.id,
      username: userRow.username,
      isGuest: false,
      createdAt: userRow.created_at,
    };

    const session: AuthSession = {
      user: authUser,
      isAuthenticated: true,
      isGuest: false,
      token: `cm_local_${userRow.id}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Store session
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));

    return { user: authUser, session };
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error during sign in' };
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  // Clear stored session
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(GUEST_USER_KEY);
};

/**
 * Check if Supabase is available and connected
 */
export const isSupabaseAvailable = async (): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('cm_users').select('id', { head: true }).limit(1);
    return !error;
  } catch {
    return false;
  }
};

/**
 * Get current session from Supabase
 */
export const getCurrentSession = async (): Promise<AuthSession | null> => {
  return null;
};

export { normalizeUsername };
