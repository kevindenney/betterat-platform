import {
  supabase,
  queryWithRetry,
  type Tables,
} from '@betterat/core/database/client';
import type { NewRaceData } from '../components/AddRaceModal';

export type RaceRow = Tables<'races'>;
export type RegattaRow = Tables<'regattas'>;

const getCurrentUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
};

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

export const fetchRaceById = async (raceId: string): Promise<RaceRow | null> => {
  return queryWithRetry(async () => {
    const { data, error } = await supabase
      .from('races')
      .select('*')
      .eq('id', raceId)
      .single();

    if (error) {
      if ((error as { code?: string }).code === 'PGRST116') return null;
      throw error;
    }
    return data;
  });
};

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

export const fetchRegattaById = async (regattaId: string): Promise<RegattaRow | null> => {
  return queryWithRetry(async () => {
    const { data, error } = await supabase
      .from('regattas')
      .select('*')
      .eq('id', regattaId)
      .single();

    if (error) {
      if ((error as { code?: string }).code === 'PGRST116') return null;
      throw error;
    }
    return data;
  });
};

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

export const fetchRecentRaces = async (
  limit = 10
): Promise<Array<RaceRow & { regatta: RegattaRow }>> => {
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

const formatDateParts = (value?: string) => {
  const parsed = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const isoTimestamp = safeDate.toISOString();
  return {
    isoTimestamp,
    isoDate: isoTimestamp.slice(0, 10),
    isoTime: isoTimestamp.slice(11, 19),
  };
};

export interface QuickRaceEventInput extends NewRaceData {
  userId: string;
}

export const createQuickRaceEvent = async ({
  userId,
  name,
  dateTime,
  venue,
  notes,
  boat,
}: QuickRaceEventInput) => {
  if (!name.trim()) {
    throw new Error('Race name is required');
  }

  const { isoTimestamp, isoDate, isoTime } = formatDateParts(dateTime);
  let regattaId: string | null = null;

  if (userId) {
    const { data: regatta, error: regattaError } = await supabase
      .from('regattas')
      .insert({
        name: name.trim(),
        start_date: isoTimestamp,
        end_date: isoTimestamp,
        created_by: userId,
        start_area_name: venue || null,
        metadata: {
          source: 'sailracing_quick_add',
          boat,
        },
      })
      .select('id')
      .single();

    if (regattaError) {
      throw regattaError;
    }
    regattaId = regatta?.id ?? null;
  }

  const { error } = await supabase.from('race_events').insert({
    name: name.trim(),
    regatta_id: regattaId,
    event_date: isoDate,
    start_time: isoTime,
    status: 'planned',
    course_description: notes || null,
    weather_conditions: venue ? { venue } : null,
  });

  if (error) {
    throw error;
  }
};
