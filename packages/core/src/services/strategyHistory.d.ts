import type { StrategyPlanFields, StrategyAISuggestion } from '../types/strategy';
import type { StrategyEntry } from './RaceStrategyService';
export type StrategyPhaseHistoryEntry = {
    updatedAt: string;
    plan?: StrategyPlanFields | null;
    aiSuggestion?: StrategyAISuggestion | null;
    finalized?: boolean;
};
export type StrategyPhaseHistory = {
    phaseId: string;
    totalEntries: number;
    recent: StrategyPhaseHistoryEntry[];
    lastUpdated?: string;
    lastConfidence?: StrategyAISuggestion['confidence'];
};
/**
 * Convert persisted strategy entries into lightweight history objects the AI
 * strategy engine can feed into prompts. We intentionally keep the payload
 * small (recent entries only) to avoid bloating prompt tokens.
 */
export declare function buildStrategyPhaseHistory(entries: StrategyEntry[], recentLimit?: number): Record<string, StrategyPhaseHistory>;
//# sourceMappingURL=strategyHistory.d.ts.map