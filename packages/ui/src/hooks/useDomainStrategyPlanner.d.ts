import { type StrategyPhaseDefinition, type StrategyPlanFields, type StrategyAISuggestion, type StrategyPhaseHistory } from '@betterat/core';
type PlannerStatus = 'idle' | 'saving' | 'error';
export type StrategySuggestionGenerator = (input: {
    domainId: string;
    entityId: string;
    entityTitle?: string;
    phase: StrategyPhaseDefinition;
    context?: Record<string, any>;
    history?: StrategyPhaseHistory;
}) => Promise<StrategyAISuggestion>;
export type UseDomainStrategyPlannerOptions = {
    domainId: string;
    entityId: string | null | undefined;
    entityTitle?: string;
    phases?: StrategyPhaseDefinition[];
    autoGenerate?: boolean;
    context?: Record<string, any>;
    getPhaseContext?: (phaseId: string) => Record<string, any>;
    generateSuggestion?: StrategySuggestionGenerator;
};
export type UseDomainStrategyPlannerResult = {
    phases: StrategyPhaseDefinition[];
    plans: Record<string, StrategyPlanFields>;
    suggestions: Record<string, StrategyAISuggestion | null>;
    planStatus: Record<string, PlannerStatus>;
    planErrors: Record<string, string | null>;
    history: Record<string, StrategyPhaseHistory>;
    loading: boolean;
    refreshing: Record<string, boolean>;
    setPlan: (phaseId: string, plan: StrategyPlanFields) => void;
    refreshPhase: (phaseId: string) => Promise<void>;
    refreshAll: () => Promise<void>;
};
export declare function useDomainStrategyPlanner(options: UseDomainStrategyPlannerOptions): UseDomainStrategyPlannerResult;
export {};
//# sourceMappingURL=useDomainStrategyPlanner.d.ts.map