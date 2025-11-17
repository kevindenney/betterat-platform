// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStrategyPhases, fetchStrategyEntries, upsertStrategyEntry, buildStrategyPhaseHistory, } from '@betterat/core';
const EMPTY_PLAN = { what: '', why: '', how: '', who: '' };
export function useDomainStrategyPlanner(options) {
    const { domainId, entityId, entityTitle, phases: providedPhases, autoGenerate = true, context, getPhaseContext, generateSuggestion, } = options;
    const phases = useMemo(() => {
        if (providedPhases?.length)
            return providedPhases;
        return getStrategyPhases(domainId);
    }, [domainId, providedPhases]);
    const createPlanSeed = useCallback(() => {
        return phases.reduce((acc, phase) => {
            acc[phase.id] = { ...EMPTY_PLAN };
            return acc;
        }, {});
    }, [phases]);
    const [plans, setPlans] = useState(createPlanSeed);
    const [suggestions, setSuggestions] = useState({});
    const [planStatus, setPlanStatus] = useState({});
    const [planErrors, setPlanErrors] = useState({});
    const [history, setHistory] = useState({});
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState({});
    useEffect(() => {
        setPlans(createPlanSeed());
        setSuggestions({});
        setPlanStatus({});
        setPlanErrors({});
        setHistory({});
    }, [createPlanSeed, entityId]);
    const getContextForPhase = useCallback((phaseId) => {
        const specific = typeof getPhaseContext === 'function' ? getPhaseContext(phaseId) : null;
        return specific ?? context ?? {};
    }, [context, getPhaseContext]);
    const runPhaseGeneration = useCallback(async (phaseId, historyOverride) => {
        if (!entityId) {
            return;
        }
        const phase = phases.find((p) => p.id === phaseId);
        if (!phase) {
            return;
        }
        const generator = generateSuggestion ?? (async () => buildLocalFallbackSuggestion({
            domainId,
            entityTitle,
            phase,
            history: historyOverride,
        }));
        setRefreshing((prev) => ({ ...prev, [phaseId]: true }));
        try {
            const suggestion = await generator({
                domainId,
                entityId,
                entityTitle,
                phase,
                context: getContextForPhase(phaseId),
                history: historyOverride,
            });
            setSuggestions((prev) => ({ ...prev, [phaseId]: suggestion }));
            await upsertStrategyEntry({
                domain: domainId,
                entityId,
                phase: phaseId,
                aiSuggestion: suggestion,
            });
        }
        catch (error) {
            console.warn('[useDomainStrategyPlanner] Failed to refresh phase', phaseId, error);
        }
        finally {
            setRefreshing((prev) => ({ ...prev, [phaseId]: false }));
        }
    }, [domainId, entityId, entityTitle, generateSuggestion, getContextForPhase, phases]);
    useEffect(() => {
        if (!entityId) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        fetchStrategyEntries(domainId, entityId)
            .then((entries) => {
            if (cancelled)
                return;
            const basePlans = createPlanSeed();
            const nextSuggestions = {};
            entries.forEach((entry) => {
                if (entry.plan && basePlans[entry.phase]) {
                    basePlans[entry.phase] = {
                        ...basePlans[entry.phase],
                        ...entry.plan,
                    };
                }
                if (entry.ai_suggestion) {
                    nextSuggestions[entry.phase] = entry.ai_suggestion;
                }
            });
            setPlans(basePlans);
            setSuggestions(nextSuggestions);
            const historyMap = buildStrategyPhaseHistory(entries);
            setHistory(historyMap);
            if (autoGenerate) {
                phases
                    .filter((phase) => !nextSuggestions[phase.id])
                    .forEach((phase) => {
                    void runPhaseGeneration(phase.id, historyMap[phase.id]);
                });
            }
        })
            .catch((error) => {
            if (!cancelled) {
                console.warn('[useDomainStrategyPlanner] Failed to load strategy entries', error);
            }
        })
            .finally(() => {
            if (!cancelled) {
                setLoading(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [autoGenerate, createPlanSeed, domainId, entityId, phases, runPhaseGeneration]);
    const setPlan = useCallback((phaseId, nextPlan) => {
        setPlans((prev) => ({ ...prev, [phaseId]: nextPlan }));
        if (!entityId) {
            return;
        }
        setPlanStatus((prev) => ({ ...prev, [phaseId]: 'saving' }));
        setPlanErrors((prev) => ({ ...prev, [phaseId]: null }));
        upsertStrategyEntry({
            domain: domainId,
            entityId,
            phase: phaseId,
            plan: nextPlan,
        })
            .then(() => {
            setPlanStatus((prev) => ({ ...prev, [phaseId]: 'idle' }));
        })
            .catch((error) => {
            console.warn('[useDomainStrategyPlanner] Failed to save plan', error);
            setPlanStatus((prev) => ({ ...prev, [phaseId]: 'error' }));
            setPlanErrors((prev) => ({
                ...prev,
                [phaseId]: 'Unable to save plan. Check connection and retry.',
            }));
        });
    }, [domainId, entityId]);
    const refreshPhase = useCallback(async (phaseId) => {
        await runPhaseGeneration(phaseId, history?.[phaseId]);
    }, [history, runPhaseGeneration]);
    const refreshAll = useCallback(async () => {
        await Promise.all(phases.map((phase) => runPhaseGeneration(phase.id, history?.[phase.id])));
    }, [history, phases, runPhaseGeneration]);
    return {
        phases,
        plans,
        suggestions,
        planStatus,
        planErrors,
        history,
        loading,
        refreshing,
        setPlan,
        refreshPhase,
        refreshAll,
    };
}
function buildLocalFallbackSuggestion({ entityTitle, phase, history, }) {
    const lastPlan = history?.recent?.[0]?.plan;
    const historyCount = history?.totalEntries ?? 0;
    return {
        summary: `${phase.title} focus for ${entityTitle ?? 'this assignment'}`,
        bullets: [
            lastPlan?.what ? `Revisit last plan: ${lastPlan.what}` : `Set a clear objective for ${phase.title}`,
            historyCount
                ? `Incorporate ${historyCount} logged lessons before locking decisions`
                : 'Capture first lessons learned to unlock smarter AI refreshes',
            'Assign ownership and timing before leaving this phase',
        ],
        confidence: history?.lastConfidence ?? 'medium',
        dataPoints: history?.lastUpdated
            ? [`Last update ${new Date(history.lastUpdated).toLocaleDateString()}`]
            : undefined,
    };
}
