import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthService, type ClubProfile, type UserProfile } from '../auth/AuthService';
import { supabase, type UserType } from '../database/client';

type AuthState =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'ready'
  | 'signed_out'
  | 'checking';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  state: AuthState;
  loading: boolean;
  ready: boolean;
  signedIn: boolean;
  userProfile: UserProfile | null;
  clubProfile: ClubProfile | null;
  userType: UserType;
  personaLoading: boolean;
  isDemoSession: boolean;
  signIn(email: string, password: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signUp(email: string, name: string, password: string, persona?: UserType | 'organization'): Promise<void>;
  signOut(): Promise<void>;
  fetchUserProfile(): Promise<void>;
  updateUserProfile(values: Partial<UserProfile>): Promise<void>;
  setDemoSession(next: boolean): void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [personaLoading, setPersonaLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [clubProfile, setClubProfile] = useState<ClubProfile | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [isDemoSession, setDemoSession] = useState(false);

  const hydrateProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setUserProfile(null);
      setClubProfile(null);
      setUserType(null);
      return;
    }

    setPersonaLoading(true);
    try {
      const profile = await AuthService.fetchUserProfile(nextUser.id);
      setUserProfile(profile);
      setUserType((profile?.user_type as UserType) ?? null);

      if (profile?.user_type === 'club') {
        const club = await AuthService.fetchClubProfile(nextUser.id);
        setClubProfile(club);
      } else {
        setClubProfile(null);
      }
    } catch (error) {
      console.warn('[AuthProvider] Failed to hydrate profile', error);
    } finally {
      setPersonaLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) {
        return;
      }
      if (error) {
        console.warn('[AuthProvider] Failed to fetch session', error);
      }
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setState(data.session?.user ? 'authenticated' : 'unauthenticated');
      hydrateProfile(data.session?.user ?? null).finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setState(nextSession?.user ? 'authenticated' : 'unauthenticated');
      hydrateProfile(nextSession?.user ?? null);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [hydrateProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { user: nextUser, session: nextSession } = await AuthService.signIn({ email, password });
    setSession(nextSession ?? null);
    setUser(nextUser ?? null);
    setState(nextUser ? 'authenticated' : 'unauthenticated');
    await hydrateProfile(nextUser ?? null);
  }, [hydrateProfile]);

  const signOut = useCallback(async () => {
    await AuthService.signOut();
    setSession(null);
    setUser(null);
    setUserProfile(null);
    setClubProfile(null);
    setUserType(null);
    setState('unauthenticated');
  }, []);

  const signUp = useCallback(async (
    email: string,
    name: string,
    password: string,
    persona?: UserType | 'organization'
  ) => {
    const { user: nextUser, session: nextSession } = await AuthService.signUp({
      email,
      password,
      name,
      persona
    });

    setSession(nextSession ?? null);
    setUser(nextUser ?? null);
    setState(nextUser ? 'authenticated' : 'unauthenticated');
    await hydrateProfile(nextUser ?? null);
  }, [hydrateProfile]);

  const fetchUserProfile = useCallback(async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    await hydrateProfile(user);
  }, [hydrateProfile, user]);

  const updateUserProfile = useCallback(
    async (values: Partial<UserProfile>) => {
      if (!user) {
        throw new Error('Cannot update profile without an authenticated user');
      }
      const updated = await AuthService.updateUserProfile(user.id, values);
      if (updated) {
        setUserProfile(updated);
        setUserType((updated.user_type as UserType) ?? null);
      }
    },
    [user]
  );

  const signInWithGoogle = useCallback(async () => {
    console.warn('[AuthProvider] Google sign-in is not configured yet.');
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    state,
    loading,
    ready: state !== 'loading',
    signedIn: !!user,
    userProfile,
    clubProfile,
    userType,
    personaLoading,
    isDemoSession,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    fetchUserProfile,
    updateUserProfile,
    setDemoSession
  }), [
    clubProfile,
    fetchUserProfile,
    isDemoSession,
    loading,
    personaLoading,
    signIn,
    signInWithGoogle,
    signOut,
    signUp,
    state,
    updateUserProfile,
    user,
    userProfile,
    userType,
    session
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
