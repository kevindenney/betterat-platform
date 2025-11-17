import { supabase } from '../database/client';
const TABLE = 'strategy_entries';
export async function fetchStrategyEntries(domain, entityId) {
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('domain', domain)
        .eq('entity_id', entityId)
        .order('phase');
    if (error) {
        throw error;
    }
    return (data ?? []);
}
export async function upsertStrategyEntry(params) {
    const { domain, entityId, phase, plan, aiSuggestion, finalized } = params;
    const payload = {
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
    return data;
}
