export type StrategyPhaseDefinition = {
    id: string;
    title: string;
    subtitle: string;
};
export type StrategyPlanFields = {
    what: string;
    why: string;
    how: string;
    who: string;
};
export type StrategyAISuggestion = {
    summary: string;
    bullets: string[];
    confidence?: 'low' | 'medium' | 'high';
    dataPoints?: string[];
};
export type StrategyPhaseConfigMap = Record<string, StrategyPhaseDefinition[]>;
export declare const StrategyPhaseLibrary: StrategyPhaseConfigMap;
export declare const getStrategyPhases: (domainId: string, fallbackId?: string) => StrategyPhaseDefinition[];
//# sourceMappingURL=strategy.d.ts.map