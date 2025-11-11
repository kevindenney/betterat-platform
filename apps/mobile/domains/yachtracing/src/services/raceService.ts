/**
 * Race Service
 *
 * Provides data access methods for yacht racing data from Supabase.
 * Handles fetching races, regattas, and related race information.
 */

import {
  supabase,
  queryWithRetry,
  type RaceRow,
  type RegattaRow,
  getCurrentUserId,
} from './supabase';

/**
 * Fetch all races for a specific regatta
 */
export const fetchRacesByRegatta = async (regattaId: string): Promise<RaceRow[]> => {
  return queryWithRetry(async () => {
    const { data, error } = await supabase
      .from('races')
      .select('*')
      .eq('regatta_id', regattaId)
      .order('race_number', { ascending: true });

    if (error) throw error;
    return data || [];
  });
};

/**
 * Fetch a single race by ID
 */
export const fetchRaceById = async (raceId: string): Promise<RaceRow | null> => {
  return queryWithRetry(async () => {
    const { data, error } = await supabase
      .from('races')
      .select('*')
      .eq('id', raceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  });
};

/**
 * Fetch all regattas for the current user
 */
export const fetchUserRegattas = async (): Promise<RegattaRow[]> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('No active user session');

  return queryWithRetry(async () => {
    const { data, error } = await supabase
      .from('regattas')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  });
};

/**
 * Fetch a single regatta by ID
 */
export const fetchRegattaById = async (regattaId: string): Promise<RegattaRow | null> => {
  return queryWithRetry(async () => {
    const { data, error } = await supabase
      .from('regattas')
      .select('*')
      .eq('id', regattaId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  });
};

/**
 * Fetch upcoming races for the current user
 */
export const fetchUpcomingRaces = async (): Promise<Array<RaceRow & { regatta: RegattaRow }>> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('No active user session');

  return queryWithRetry(async () => {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('races')
      .select(`
        *,
        regatta:regattas!inner(*)
      `)
      .eq('regattas.user_id', userId)
      .gte('scheduled_start', now)
      .order('scheduled_start', { ascending: true })
      .limit(10);

    if (error) throw error;
    return data || [];
  });
};

/**
 * Fetch recent races for the current user
 */
export const fetchRecentRaces = async (limit: number = 10): Promise<Array<RaceRow & { regatta: RegattaRow }>> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('No active user session');

  return queryWithRetry(async () => {
    const { data, error } = await supabase
      .from('races')
      .select(`
        *,
        regatta:regattas!inner(*)
      `)
      .eq('regattas.user_id', userId)
      .order('scheduled_start', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  });
};

/**
 * Update race status
 */
export const updateRaceStatus = async (raceId: string, status: string): Promise<RaceRow> => {
  return queryWithRetry(async () => {
    const { data, error } = await supabase
      .from('races')
      .update({ status })
      .eq('id', raceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
};

/**
 * Update race actual start time
 */
export const updateRaceActualStart = async (raceId: string, actualStart: string): Promise<RaceRow> => {
  return queryWithRetry(async () => {
    const { data, error } = await supabase
      .from('races')
      .update({ actual_start: actualStart })
      .eq('id', raceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
};

/**
 * Subscribe to real-time race updates for a specific regatta
 */
export const subscribeToRegattaRaces = (
  regattaId: string,
  onUpdate: (race: RaceRow) => void,
  onError?: (error: Error) => void
) => {
  const channel = supabase
    .channel(`regatta-${regattaId}-races`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'races',
        filter: `regatta_id=eq.${regattaId}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          onUpdate(payload.new as RaceRow);
        }
      }
    )
    .subscribe((status, err) => {
      if (err && onError) {
        onError(err);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to real-time updates for a specific race
 */
export const subscribeToRace = (
  raceId: string,
  onUpdate: (race: RaceRow) => void,
  onError?: (error: Error) => void
) => {
  const channel = supabase
    .channel(`race-${raceId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'races',
        filter: `id=eq.${raceId}`,
      },
      (payload) => {
        if (payload.eventType === 'UPDATE') {
          onUpdate(payload.new as RaceRow);
        }
      }
    )
    .subscribe((status, err) => {
      if (err && onError) {
        onError(err);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
};
