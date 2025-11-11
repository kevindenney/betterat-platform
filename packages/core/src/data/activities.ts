import { supabase } from './supabaseClient';

interface ActivityInput {
  userId: string;
  domainId: string;
  activityType: string;
  payload: Record<string, any>;
}

interface ActivitiesQuery {
  userId: string;
  domainId: string;
}

export const addActivity = async ({
  userId,
  domainId,
  activityType,
  payload,
}: ActivityInput) => {
  const { data, error } = await supabase()
    .from('activities')
    .insert({
      user_id: userId,
      domain_id: domainId,
      activity_type: activityType,
      payload,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const listActivities = async ({ userId, domainId }: ActivitiesQuery) => {
  const { data, error } = await supabase()
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .eq('domain_id', domainId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
