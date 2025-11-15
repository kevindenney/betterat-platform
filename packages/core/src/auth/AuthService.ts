// @ts-nocheck
import type { Session, User } from '@supabase/supabase-js';
import { supabase, type Database, type UserType } from '../database/client';

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

export class AuthService {
  static async signIn({ email, password }: SignInPayload): Promise<{
    user: User | null;
    session: Session | null;
  }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      throw error;
    }

    return {
      user: data.user,
      session: data.session
    };
  }

  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }

  static async signUp({ email, password, name, persona }: SignUpPayload): Promise<{
    user: User | null;
    session: Session | null;
  }> {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name ?? null,
          user_type: persona ?? null
        }
      }
    });

    if (error) {
      throw error;
    }

    return {
      user: data.user,
      session: data.session
    };
  }

  static async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ?? null;
  }

  static async updateUserProfile(
    userId: string,
    values: Partial<Database['public']['Tables']['users']['Update']>
  ): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('*')
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ?? null;
  }

  static async fetchClubProfile(userId: string): Promise<ClubProfile | null> {
    const { data, error } = await supabase
      .from('club_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ?? null;
  }
}
