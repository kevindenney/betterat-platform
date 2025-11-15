import type {
  Activity,
  ActivityFilters,
  CoachingMessage,
  PlatformServices,
  ProgressMetric,
  SessionFilters,
} from '@betterat/domain-sdk';
import type { NavigationContainerRef } from '@react-navigation/native';
import { AuthService, generateUuid, supabase } from '@betterat/core';

type NullableNavigationRef = NavigationContainerRef<any> | null;

const safeDate = (value?: string | null) => (value ? new Date(value) : new Date());

const mapActivity = (row: any): Activity => ({
  id: row.id,
  userId: row.user_id,
  domainId: row.domain_id,
  activityTypeId: row.activity_type_id ?? row.activity_type,
  metadata: row.metadata ?? row.payload ?? {},
  createdAt: safeDate(row.created_at),
  updatedAt: safeDate(row.updated_at),
  deletedAt: row.deleted_at ? new Date(row.deleted_at) : undefined,
  notes: row.notes ?? undefined,
  tags: row.tags ?? undefined,
});

const mapMetric = (row: any): ProgressMetric => ({
  id: row.id,
  userId: row.user_id,
  domainId: row.domain_id,
  metricId: row.metric_id,
  value: row.value ?? 0,
  timestamp: safeDate(row.recorded_at ?? row.created_at),
  metadata: row.metadata ?? undefined,
});

const handleMissingTable = (error: any) => {
  if (error?.code === '42P01') {
    console.warn('[PlatformServices] Table missing, returning empty result');
    return true;
  }
  return false;
};

const getSessionUser = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
};

export const createPlatformServices = (
  navigationRef: NullableNavigationRef
): PlatformServices => ({
  user: {
    getCurrentUser: async () => {
      const user = await getSessionUser();
      if (!user) {
        return null;
      }
      return {
        id: user.id,
        email: user.email ?? '',
        name: user.user_metadata?.full_name ?? undefined,
        avatar: user.user_metadata?.avatar_url ?? undefined,
      };
    },
    getUserProfile: async (userId: string) => {
      const profile = await AuthService.fetchUserProfile(userId);
      if (!profile) {
        return null;
      }
      return {
        id: profile.id,
        email: profile.email ?? '',
        name: profile.full_name ?? undefined,
        avatar: profile.avatar_url ?? undefined,
        bio: profile.bio ?? undefined,
        createdAt: safeDate(profile.created_at),
        updatedAt: safeDate(profile.updated_at),
        preferences: profile.preferences ?? undefined,
      };
    },
    updateProfile: async (updates) => {
      const user = await getSessionUser();
      if (!user) {
        throw new Error('Must be signed in to update profile');
      }
      await AuthService.updateUserProfile(user.id, {
        full_name: updates.name,
        avatar_url: updates.avatar,
        bio: updates.bio,
      });
    },
  },
  data: {
    activities: {
      list: async (filters?: ActivityFilters) => {
        try {
          const query = supabase
            .from('activities')
            .select('*')
            .order('created_at', { ascending: false });

          if (filters?.domainId) {
            query.eq('domain_id', filters.domainId);
          }
          if (filters?.activityTypeId) {
            query.eq('activity_type_id', filters.activityTypeId);
          }
          if (filters?.startDate) {
            query.gte('created_at', filters.startDate.toISOString());
          }
          if (filters?.endDate) {
            query.lte('created_at', filters.endDate.toISOString());
          }

          const { data, error } = await query;
          if (error) {
            if (handleMissingTable(error)) {
              return [];
            }
            throw error;
          }
          return (data ?? []).map(mapActivity);
        } catch (error) {
          console.warn('[PlatformServices] Failed to list activities', error);
          return [];
        }
      },
      get: async (id: string) => {
        try {
          const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            if (handleMissingTable(error) || error.code === 'PGRST116') {
              return null;
            }
            throw error;
          }
          return data ? mapActivity(data) : null;
        } catch (error) {
          console.warn('[PlatformServices] Failed to load activity', error);
          return null;
        }
      },
      create: async (input) => {
        const user = await getSessionUser();
        if (!user) {
          throw new Error('Must be signed in to create activity');
        }
        try {
          const { data, error } = await supabase
            .from('activities')
            .insert({
              user_id: user.id,
              domain_id: input.domainId,
              activity_type_id: input.activityTypeId,
              metadata: input.metadata,
              notes: input.notes ?? null,
              tags: input.tags ?? null,
            })
            .select('*')
            .single();

          if (error) throw error;
          return mapActivity(data);
        } catch (error) {
          console.warn('[PlatformServices] Failed to create activity', error);
          throw error;
        }
      },
      update: async (id, input) => {
        try {
          const { data, error } = await supabase
            .from('activities')
            .update({
              metadata: input.metadata ?? undefined,
              notes: input.notes ?? undefined,
              tags: input.tags ?? undefined,
            })
            .eq('id', id)
            .select('*')
            .single();

          if (error) throw error;
          return mapActivity(data);
        } catch (error) {
          console.warn('[PlatformServices] Failed to update activity', error);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          const { error } = await supabase.from('activities').delete().eq('id', id);
          if (error) throw error;
        } catch (error) {
          console.warn('[PlatformServices] Failed to delete activity', error);
          throw error;
        }
      },
    },
    metrics: {
      list: async () => {
        try {
          const { data, error } = await supabase.from('progress_metrics').select('*').order('recorded_at', {
            ascending: false,
          });
          if (error) {
            if (handleMissingTable(error)) {
              return [];
            }
            throw error;
          }
          return (data ?? []).map(mapMetric);
        } catch (error) {
          console.warn('[PlatformServices] Failed to list metrics', error);
          return [];
        }
      },
      record: async (metricId, value, metadata) => {
        const user = await getSessionUser();
        if (!user) {
          throw new Error('Must be signed in to record metrics');
        }
        try {
          const { data, error } = await supabase
            .from('progress_metrics')
            .insert({
              user_id: user.id,
              domain_id: metadata?.domainId ?? null,
              metric_id: metricId,
              value,
              metadata: metadata ?? null,
            })
            .select('*')
            .single();
          if (error) throw error;
          return mapMetric(data);
        } catch (error) {
          console.warn('[PlatformServices] Failed to record metric', error);
          throw error;
        }
      },
    },
    sessions: {
      list: async (filters?: SessionFilters) => {
        try {
          const query = supabase.from('ai_coaching_sessions').select('*').order('started_at', { ascending: false });
          if (filters?.domainId) {
            query.eq('domain_id', filters.domainId);
          }
          if (filters?.agentId) {
            query.eq('agent_id', filters.agentId);
          }
          const { data, error } = await query;
          if (error) {
            if (handleMissingTable(error)) {
              return [];
            }
            throw error;
          }
          return (data ?? []).map((row) => ({
            id: row.id,
            userId: row.user_id,
            domainId: row.domain_id,
            agentId: row.agent_id,
            messages: row.messages ?? [],
            startedAt: safeDate(row.started_at),
            endedAt: row.ended_at ? new Date(row.ended_at) : undefined,
          }));
        } catch (error) {
          console.warn('[PlatformServices] Failed to list sessions', error);
          return [];
        }
      },
      get: async (id: string) => {
        try {
          const { data, error } = await supabase
            .from('ai_coaching_sessions')
            .select('*')
            .eq('id', id)
            .single();
          if (error) {
            if (handleMissingTable(error) || error.code === 'PGRST116') {
              return null;
            }
            throw error;
          }
          return data
            ? {
                id: data.id,
                userId: data.user_id,
                domainId: data.domain_id,
                agentId: data.agent_id,
                messages: data.messages ?? [],
                startedAt: safeDate(data.started_at),
                endedAt: data.ended_at ? new Date(data.ended_at) : undefined,
              }
            : null;
        } catch (error) {
          console.warn('[PlatformServices] Failed to load session', error);
          return null;
        }
      },
      create: async (agentId: string) => {
        const user = await getSessionUser();
        if (!user) {
          throw new Error('Must be signed in to start a session');
        }
        try {
          const { data, error } = await supabase
            .from('ai_coaching_sessions')
            .insert({
              user_id: user.id,
              domain_id: null,
              agent_id: agentId,
              messages: [],
            })
            .select('*')
            .single();
          if (error) throw error;
          return {
            id: data.id,
            userId: data.user_id,
            domainId: data.domain_id,
            agentId,
            messages: data.messages ?? [],
            startedAt: safeDate(data.started_at),
          };
        } catch (error) {
          console.warn('[PlatformServices] Failed to create session', error);
          throw error;
        }
      },
      addMessage: async (sessionId: string, message: Omit<CoachingMessage, 'id' | 'timestamp'>) => {
        try {
          const { data: session, error: fetchError } = await supabase
            .from('ai_coaching_sessions')
            .select('messages')
            .eq('id', sessionId)
            .single();

          if (fetchError) throw fetchError;

          const existingMessages = Array.isArray(session?.messages) ? session?.messages : [];
          const nextMessage = {
            ...message,
            id: generateUuid(),
            timestamp: new Date().toISOString(),
          };

          const { error } = await supabase
            .from('ai_coaching_sessions')
            .update({
              messages: [...existingMessages, nextMessage],
            })
            .eq('id', sessionId);

          if (error) throw error;
        } catch (error) {
          console.warn('[PlatformServices] Failed to append session message', error);
          throw error;
        }
      },
      end: async (sessionId: string) => {
        try {
          const { error } = await supabase
            .from('ai_coaching_sessions')
            .update({ ended_at: new Date().toISOString() })
            .eq('id', sessionId);
          if (error) throw error;
        } catch (error) {
          console.warn('[PlatformServices] Failed to end session', error);
          throw error;
        }
      },
    },
  },
  ai: {
    chat: async (_config, messages) => {
      // Placeholder implementation until AI service is wired
      const lastUserMessage = [...messages].reverse().find((msg) => msg.role === 'user');
      return {
        content: lastUserMessage
          ? `Echo: ${lastUserMessage.content?.slice(0, 200)}`
          : 'AI service coming soon.',
      };
    },
    executeTools: async (toolCalls) => toolCalls,
  },
  storage: {
    uploadFile: async () => {
      console.warn('[PlatformServices] uploadFile not implemented');
      return 'https://storage.placeholder/betterat';
    },
    getFileUrl: async () => {
      console.warn('[PlatformServices] getFileUrl not implemented');
      return 'https://storage.placeholder/betterat';
    },
    deleteFile: async () => {
      console.warn('[PlatformServices] deleteFile not implemented');
    },
  },
  analytics: {
    trackEvent: async (event, props) => {
      console.log('📊 trackEvent', event, props);
    },
    trackScreen: async (screen, props) => {
      console.log('📱 trackScreen', screen, props);
    },
  },
  navigation: {
    navigate: (route, params) => {
      navigationRef?.navigate(route, params);
    },
    goBack: () => {
      navigationRef?.goBack();
    },
    reset: (route: string) => {
      navigationRef?.reset({
        index: 0,
        routes: [{ name: route }],
      });
    },
  },
});
