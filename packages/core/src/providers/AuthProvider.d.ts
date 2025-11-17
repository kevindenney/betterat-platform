import type { Session, User } from '@supabase/supabase-js';
import React from 'react';
import { type ClubProfile, type UserProfile } from '../auth/AuthService';
import { type UserType } from '../database/client';
type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'ready' | 'signed_out' | 'checking';
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
interface AuthProviderProps {
    children: React.ReactNode;
}
export declare function AuthProvider({ children }: AuthProviderProps): React.JSX.Element;
export declare function useAuth(): AuthContextValue;
export {};
//# sourceMappingURL=AuthProvider.d.ts.map