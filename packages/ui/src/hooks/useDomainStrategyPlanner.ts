// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getStrategyPhases,
  fetchStrategyEntries,
  upsertStrategyEntry,
  type StrategyPhaseDefinition,
  type StrategyPlanFields,
  type StrategyAISuggestion,
  type StrategyPhaseHistory,
  buildStrategyPhaseHistory,
} from '@betterat/core';

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

const EMPTY_PLAN: StrategyPlanFields = { what: '', why: '', how: '', who: '' };

export function useDomainStrategyPlanner(
  options: UseDomainStrategyPlannerOptions,
): UseDomainStrategyPlannerResult {
  const {
    domainId,
    entityId,
    entityTitle,
    phases: providedPhases,
    autoGenerate = true,
    context,
    getPhaseContext,
    generateSuggestion,
  } = options;

  const phases = useMemo<StrategyPhaseDefinition[]>(() => {
    if (providedPhases?.length) return providedPhases;
    return getStrategyPhases(domainId);
  }, [domainId, providedPhases]);

  const createPlanSeed = useCallback(() => {
    return phases.reduce<Record<string, StrategyPlanFields>>((acc, phase) => {
      acc[phase.id] = { ...EMPTY_PLAN };
      return acc;
    }, {});
  }, [phases]);

  const [plans, setPlans] = useState<Record<string, StrategyPlanFields>>(createPlanSeed);
  const [suggestions, setSuggestions] = useState<Record<string, StrategyAISuggestion | null>>({});
  const [planStatus, setPlanStatus] = useState<Record<string, PlannerStatus>>({});
  const [planErrors, setPlanErrors] = useState<Record<string, string | null>>({});
  const [history, setHistory] = useState<Record<string, StrategyPhaseHistory>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPlans(createPlanSeed());
    setSuggestions({});
    setPlanStatus({});
    setPlanErrors({});
    setHistory({});
  }, [createPlanSeed, entityId]);

  const getContextForPhase = useCallback(
    (phaseId: string) => {
      const specific = typeof getPhaseContext === 'function' ? getPhaseContext(phaseId) : null;
      return specific ?? context ?? {};
    },
    [context, getPhaseContext],
  );

  const runPhaseGeneration = useCallback(
    async (phaseId: string, historyOverride?: StrategyPhaseHistory) => {
      if (!entityId) {
        return;
      }
      const phase = phases.find((p) => p.id === phaseId);
      if (!phase) {
        return;
      }

      const generator = generateSuggestion ?? (async () =>
        buildLocalFallbackSuggestion({
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
      } catch (error) {
        console.warn('[useDomainStrategyPlanner] Failed to refresh phase', phaseId, error);
      } finally {
        setRefreshing((prev) => ({ ...prev, [phaseId]: false }));
      }
    },
    [domainId, entityId, entityTitle, generateSuggestion, getContextForPhase, phases],
  );

  useEffect(() => {
    if (!entityId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchStrategyEntries(domainId, entityId)
      .then((entries) => {
        if (cancelled) return;
        const basePlans = createPlanSeed();
        const nextSuggestions: Record<string, StrategyAISuggestion | null> = {};

        entries.forEach((entry) => {
          if (entry.plan && basePlans[entry.phase]) {
            basePlans[entry.phase] = {
              ...basePlans[entry.phase],
              ...entry.plan,
            } as StrategyPlanFields;
          }
          if (entry.ai_suggestion) {
            nextSuggestions[entry.phase] = entry.ai_suggestion as StrategyAISuggestion;
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

  const setPlan = useCallback(
    (phaseId: string, nextPlan: StrategyPlanFields) => {
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
    },
    [domainId, entityId],
  );

  const refreshPhase = useCallback(
    async (phaseId: string) => {
      await runPhaseGeneration(phaseId, history?.[phaseId]);
    },
    [history, runPhaseGeneration],
  );

  const refreshAll = useCallback(async () => {
    await Promise.all(
      phases.map((phase) => runPhaseGeneration(phase.id, history?.[phase.id])),
    );
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

function buildLocalFallbackSuggestion({
  entityTitle,
  phase,
  history,
}: {
  domainId: string;
  entityTitle?: string;
  phase: StrategyPhaseDefinition;
  history?: StrategyPhaseHistory;
}): StrategyAISuggestion {
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
