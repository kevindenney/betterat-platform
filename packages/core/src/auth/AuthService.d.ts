import type { Session, User } from '@supabase/supabase-js';
import { type Database, type UserType } from '../database/client';
export type UserProfile = Database['public']['Tables']['users']['Row'];
export type ClubProfile = Database['public']['Tables']['club_profiles']['Row'];
export interface SignInPayload {
    email: string;
    password: string;
}
export interface SignUpPayload {
    email: string;
    password: string;
    name?: string;
    persona?: UserType | 'organization';
}
export declare class AuthService {
    static signIn({ email, password }: SignInPayload): Promise<{
        user: User | null;
        session: Session | null;
    }>;
    static signOut(): Promise<void>;
    static signUp({ email, password, name, persona }: SignUpPayload): Promise<{
        user: User | null;
        session: Session | null;
    }>;
    static fetchUserProfile(userId: string): Promise<UserProfile | null>;
    static updateUserProfile(userId: string, values: Partial<Database['public']['Tables']['users']['Update']>): Promise<UserProfile | null>;
    static fetchClubProfile(userId: string): Promise<ClubProfile | null>;
}
//# sourceMappingURL=AuthService.d.ts.map