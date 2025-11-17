import React from 'react';
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
export type StrategyCardTheme = {
    cardBackground: string;
    cardBorder: string;
    aiBackground: string;
    aiBorder: string;
    refreshBackground: string;
    refreshBorder: string;
    refreshText: string;
    eyebrowColor: string;
    pillBorder: string;
    pillLabel: string;
    pillText: string;
    iconBackground: string;
    iconColor: string;
};
export type StrategyPhaseCardProps = {
    phaseId: string;
    title: string;
    subtitle?: string;
    aiSuggestion?: StrategyAISuggestion | null;
    plan: StrategyPlanFields;
    onPlanChange: (phaseId: string, next: StrategyPlanFields) => void;
    onRefreshSuggestion?: (phaseId: string) => void;
    saving?: boolean;
    refreshInFlight?: boolean;
    errorMessage?: string | null;
    theme?: Partial<StrategyCardTheme>;
    icon?: React.ReactNode;
};
export declare const StrategyPhaseCard: React.FC<StrategyPhaseCardProps>;
//# sourceMappingURL=StrategyPhaseCard.d.ts.map