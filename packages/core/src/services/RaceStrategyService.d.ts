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
export declare function fetchStrategyEntries(domain: string, entityId: string): Promise<StrategyEntry[]>;
export declare function upsertStrategyEntry(params: {
    domain: string;
    entityId: string;
    phase: string;
    plan?: StrategyPlanFields;
    aiSuggestion?: StrategyAISuggestion | null;
    finalized?: boolean;
}): Promise<StrategyEntry>;
//# sourceMappingURL=RaceStrategyService.d.ts.map