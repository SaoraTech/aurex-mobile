import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  getCurrentSession,
  signInWithEmail,
  signOut as endAuthSession,
  signUpWithEmail,
} from './authApi';

type AuthUser = { id: string; name?: string | null; email?: string | null };
type SessionSnapshot = { user?: AuthUser } | null;
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionSnapshot>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const refreshSession = useCallback(async () => {
    const result = await getCurrentSession() as SessionSnapshot;
    setSession(result);
    setStatus(result?.user ? 'authenticated' : 'unauthenticated');
  }, []);

  useEffect(() => {
    let active = true;
    getCurrentSession()
      .then((result) => {
        if (!active) return;
        const snapshot = result as SessionSnapshot;
        setSession(snapshot);
        setStatus(snapshot?.user ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => {
        if (!active) return;
        setSession(null);
        setStatus('unauthenticated');
      });

    return () => { active = false; };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmail({ email: email.trim().toLowerCase(), password });
    await refreshSession();
  }, [refreshSession]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    await signUpWithEmail({ name: name.trim(), email: email.trim().toLowerCase(), password });
    await refreshSession();
  }, [refreshSession]);

  const signOut = useCallback(async () => {
    try {
      await endAuthSession();
    } finally {
      setSession(null);
      setStatus('unauthenticated');
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user: session?.user ?? null,
    signIn,
    signUp,
    signOut,
  }), [status, session, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
