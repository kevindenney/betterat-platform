import type { StrategyAISuggestion, StrategyPhaseDefinition } from '@betterat/core/types/strategy';
import type { StrategyPhaseHistory } from '@betterat/core/services/strategyHistory';
export type DomainStrategyPhaseRequest = {
    domainId: string;
    entityId: string;
    entityTitle?: string;
    phase: StrategyPhaseDefinition;
    context?: Record<string, any>;
    history?: StrategyPhaseHistory;
};
export type DomainStrategyBatchRequest = {
    domainId: string;
    entityId: string;
    entityTitle?: string;
    phases: StrategyPhaseDefinition[];
    getContext?: (phaseId: string) => Record<string, any>;
    history?: Record<string, StrategyPhaseHistory>;
};
export declare function generateDomainPhaseSuggestion(request: DomainStrategyPhaseRequest): Promise<StrategyAISuggestion>;
export declare function generateDomainStrategySuggestions(params: DomainStrategyBatchRequest): Promise<Record<string, StrategyAISuggestion>>;
//# sourceMappingURL=DomainStrategyAgent.d.ts.map