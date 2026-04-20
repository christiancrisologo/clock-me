import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthSession, AuthUser } from '../types';
import {
  restoreSession,
  createGuestUser,
  signUp,
  signIn,
  signOut as authSignOut,
  isSupabaseAvailable,
  getCurrentSession,
  AuthCredentials,
  SignUpData,
} from '../lib/auth';

interface AuthContextType {
  session: AuthSession | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isSupabaseConnected: boolean;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  loginAsGuest: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const available = await isSupabaseAvailable();
        setIsSupabaseConnected(available);

        const restored = restoreSession();
        if (restored) {
          setSession(restored);
        } else {
          const currentSession = await getCurrentSession();
          if (currentSession) {
            setSession(currentSession);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleSignIn = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    setError(null);

    const result = await signIn(credentials);
    if ('error' in result) {
      setError(result.error);
    } else {
      setSession(result.session);
      setIsSupabaseConnected(true);
    }

    setIsLoading(false);
  };

  const handleSignUp = async (data: SignUpData) => {
    setIsLoading(true);
    setError(null);

    const result = await signUp(data);
    if ('error' in result) {
      setError(result.error);
    } else {
      setSession(result.session);
      setIsSupabaseConnected(true);
    }

    setIsLoading(false);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authSignOut();
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginAsGuest = () => {
    const guestUser = createGuestUser();
    const guestSession: AuthSession = {
      user: guestUser,
      isAuthenticated: false,
      isGuest: true,
    };
    setSession(guestSession);
  };

  const value: AuthContextType = {
    session,
    user: session?.user || null,
    isLoading,
    error,
    isSupabaseConnected,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    loginAsGuest: handleLoginAsGuest,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
