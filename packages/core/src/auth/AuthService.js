import { supabase } from '../database/client';
export class AuthService {
    static async signIn({ email, password }) {
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
    static async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw error;
        }
    }
    static async signUp({ email, password, name, persona }) {
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
    static async fetchUserProfile(userId) {
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
    static async updateUserProfile(userId, values) {
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
    static async fetchClubProfile(userId) {
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
