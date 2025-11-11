/**
 * Supabase Client for Yacht Racing Domain
 *
 * Re-exports the RegattaFlow Supabase client and provides
 * domain-specific utilities for yacht racing data access.
 */

// Re-export the core Supabase client and types from RegattaFlow
export {
  supabase,
  queryWithRetry,
  testSupabaseConnectivity,
  type Database,
  type Tables,
  type TablesInsert,
  type TablesUpdate,
  type UserType,
  type UsersRow,
} from '/Users/kdenney/Developer/RegattaFlow/regattaflow-app/services/supabase';

/**
 * Domain-specific Supabase utilities for yacht racing
 */

// Helper type for race-related queries
export type RaceRow = Tables<'races'>;
export type RegattaRow = Tables<'regattas'>;

// Helper for filtering races by status
export type RaceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Check if we have an active Supabase session
 */
export const hasActiveSession = async (): Promise<boolean> => {
  const { supabase } = await import('/Users/kdenney/Developer/RegattaFlow/regattaflow-app/services/supabase');
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
};

/**
 * Get the current user ID from the session
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const { supabase } = await import('/Users/kdenney/Developer/RegattaFlow/regattaflow-app/services/supabase');
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
};
