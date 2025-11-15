import {
  supabase,
  queryWithRetry,
  type Tables,
} from '@betterat/core/database/client';

export type BoatClassRow = Tables<'boat_classes'>;
export type SailorClassRow = Tables<'sailor_classes'>;

const getCurrentUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
};

/**
 * Fetch all boat classes available in the system
 */
export const fetchBoatClasses = async (): Promise<BoatClassRow[]> => {
  return queryWithRetry(async () => {
    const { data, error } = await supabase
      .from('boat_classes')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  });
};

/**
 * Fetch sailor's boat classes (their registered boats)
 */
export const fetchSailorBoats = async (): Promise<
  Array<SailorClassRow & { boat_classes: BoatClassRow }>
> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('No active user session');

  return queryWithRetry(async () => {
    const { data, error } = await supabase
      .from('sailor_classes')
      .select(`
        *,
        boat_classes (*)
      `)
      .eq('sailor_id', userId)
      .order('is_primary', { ascending: false });

    if (error) throw error;
    return data || [];
  });
};

/**
 * Fetch sailor's primary boat
 */
export const fetchPrimaryBoat = async (): Promise<
  (SailorClassRow & { boat_classes: BoatClassRow }) | null
> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('No active user session');

  return queryWithRetry(async () => {
    const { data, error } = await supabase
      .from('sailor_classes')
      .select(`
        *,
        boat_classes (*)
      `)
      .eq('sailor_id', userId)
      .eq('is_primary', true)
      .single();

    if (error) {
      if ((error as { code?: string }).code === 'PGRST116') return null;
      throw error;
    }
    return data;
  });
};

/**
 * Add a new boat for the sailor
 */
export const addSailorBoat = async (input: {
  classId: string;
  boatName?: string;
  sailNumber?: string;
  isPrimary?: boolean;
}): Promise<SailorClassRow> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('No active user session');

  return queryWithRetry(async () => {
    // If setting as primary, unset other primary boats first
    if (input.isPrimary) {
      await supabase
        .from('sailor_classes')
        .update({ is_primary: false })
        .eq('sailor_id', userId);
    }

    const { data, error } = await supabase
      .from('sailor_classes')
      .insert({
        sailor_id: userId,
        class_id: input.classId,
        boat_name: input.boatName || null,
        sail_number: input.sailNumber || null,
        is_primary: input.isPrimary ?? false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  });
};

/**
 * Update a sailor's boat
 */
export const updateSailorBoat = async (
  sailorId: string,
  classId: string,
  updates: {
    boatName?: string;
    sailNumber?: string;
    isPrimary?: boolean;
  }
): Promise<SailorClassRow> => {
  return queryWithRetry(async () => {
    // If setting as primary, unset other primary boats first
    if (updates.isPrimary) {
      await supabase
        .from('sailor_classes')
        .update({ is_primary: false })
        .eq('sailor_id', sailorId);
    }

    const { data, error } = await supabase
      .from('sailor_classes')
      .update({
        boat_name: updates.boatName,
        sail_number: updates.sailNumber,
        is_primary: updates.isPrimary,
      })
      .eq('sailor_id', sailorId)
      .eq('class_id', classId)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
};

/**
 * Remove a boat from sailor's boats
 */
export const removeSailorBoat = async (
  sailorId: string,
  classId: string
): Promise<void> => {
  return queryWithRetry(async () => {
    const { error } = await supabase
      .from('sailor_classes')
      .delete()
      .eq('sailor_id', sailorId)
      .eq('class_id', classId);

    if (error) throw error;
  });
};

/**
 * Set a boat as primary
 */
export const setPrimaryBoat = async (classId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('No active user session');

  return queryWithRetry(async () => {
    // First, unset all primary boats
    await supabase
      .from('sailor_classes')
      .update({ is_primary: false })
      .eq('sailor_id', userId);

    // Then set the new primary
    const { error } = await supabase
      .from('sailor_classes')
      .update({ is_primary: true })
      .eq('sailor_id', userId)
      .eq('class_id', classId);

    if (error) throw error;
  });
};
