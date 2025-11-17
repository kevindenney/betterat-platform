import { supabase } from '../database/client';
import type { StrategyPlanFields, StrategyAISuggestion } from '../types/strategy';

export type StrategyEntry = {
  id: string;
  domain: string;
  entity_id: string;
  phase: string;
  ai_suggestion: StrategyAISuggestion | null;
  plan: StrategyPlanFields | null;
  finalized: boolean;
  created_at: string;
  updated_at: string;
};

const TABLE = 'strategy_entries';

export async function fetchStrategyEntries(domain: string, entityId: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('domain', domain)
    .eq('entity_id', entityId)
    .order('phase');

  if (error) {
    throw error;
  }
  return (data ?? []) as StrategyEntry[];
}

export async function upsertStrategyEntry(params: {
  domain: string;
  entityId: string;
  phase: string;
  plan?: StrategyPlanFields;
  aiSuggestion?: StrategyAISuggestion | null;
  finalized?: boolean;
}) {
  const { domain, entityId, phase, plan, aiSuggestion, finalized } = params;
  const payload: Partial<StrategyEntry> & { domain: string; entity_id: string; phase: string } = {
    domain,
    entity_id: entityId,
    phase,
  };

  if (plan) {
    payload.plan = plan;
  }
  if (typeof finalized === 'boolean') {
    payload.finalized = finalized;
  }
  if (aiSuggestion !== undefined) {
    payload.ai_suggestion = aiSuggestion;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, {
      onConflict: 'domain,entity_id,phase',
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data as StrategyEntry;
}
