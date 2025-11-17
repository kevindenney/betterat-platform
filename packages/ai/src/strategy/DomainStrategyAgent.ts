// @ts-nocheck
import type { StrategyAISuggestion, StrategyPhaseDefinition } from '@betterat/core/types/strategy';
import type { StrategyPhaseHistory } from '@betterat/core/services/strategyHistory';
import { createLogger } from '@betterat/core/lib/utils/logger';
import { skillManagementService } from '../skills/manager';

const logger = createLogger('DomainStrategyAgent');

const STRATEGY_SKILL_BY_DOMAIN: Record<string, string> = {
  sailracing: 'betterat-race-strategist',
  nursing: 'betterat-clinical-stage-strategist',
  drawing: 'betterat-studio-strategist',
};

const MODEL = process.env.EXPO_PUBLIC_ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-latest';

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

export async function generateDomainPhaseSuggestion(
  request: DomainStrategyPhaseRequest,
): Promise<StrategyAISuggestion> {
  const response = await invokeStrategySkill(request).catch((error) => {
    logger.warn('[DomainStrategyAgent] Skill invocation failed, using fallback', error);
    return null;
  });

  if (response) {
    return response;
  }

  return buildFallbackSuggestion(request);
}

export async function generateDomainStrategySuggestions(
  params: DomainStrategyBatchRequest,
): Promise<Record<string, StrategyAISuggestion>> {
  const results: Record<string, StrategyAISuggestion> = {};
  const jobs = params.phases.map(async (phase) => {
    const suggestion = await generateDomainPhaseSuggestion({
      domainId: params.domainId,
      entityId: params.entityId,
      entityTitle: params.entityTitle,
      phase,
      context: params.getContext?.(phase.id),
      history: params.history?.[phase.id],
    });
    results[phase.id] = suggestion;
  });

  await Promise.all(jobs);
  return results;
}

async function invokeStrategySkill({
  domainId,
  phase,
  entityTitle,
  context,
  history,
}: DomainStrategyPhaseRequest): Promise<StrategyAISuggestion | null> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const skillName = STRATEGY_SKILL_BY_DOMAIN[domainId];

  if (!supabaseUrl || !supabaseKey || !skillName) {
    logger.debug('[DomainStrategyAgent] Missing Supabase config or skill mapping');
    return null;
  }

  const skillId = await skillManagementService.getSkillId(skillName);
  if (!skillId) {
    logger.info(`[DomainStrategyAgent] Skill "${skillName}" not initialized`);
    return null;
  }

  const prompt = buildSkillPrompt({ domainId, entityTitle, phase, context, history });

  const payload: Record<string, any> = {
    action: 'messages',
    model: MODEL,
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    skills: [
      {
        type: 'custom',
        custom_skill_id: skillId,
      },
    ],
  };

  const response = await fetch(`${supabaseUrl}/functions/v1/anthropic-skills-proxy`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Skill proxy failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  return parseSuggestionPayload(text);
}

function buildSkillPrompt({
  domainId,
  entityTitle,
  phase,
  context,
  history,
}: {
  domainId: string;
  entityTitle?: string;
  phase: StrategyPhaseDefinition;
  context?: Record<string, any>;
  history?: StrategyPhaseHistory;
}) {
  const contextLines = context ? JSON.stringify(context, null, 2) : 'No structured context supplied';
  const historyLines = history
    ? history.recent
        .map((entry, index) => {
          const plan = entry.plan;
          const what = plan?.what ? `Plan: ${plan.what}` : 'Plan unavailable';
          const why = plan?.why ? `Reason: ${plan.why}` : null;
          const confidence = entry.aiSuggestion?.confidence
            ? `Confidence: ${entry.aiSuggestion.confidence}`
            : null;
          const finalized = entry.finalized ? 'Finalized' : null;
          return `#${index + 1} (${entry.updatedAt}) ${[what, why, confidence, finalized]
            .filter(Boolean)
            .join(' · ')}`;
        })
        .join('\n')
    : 'No performance history captured for this phase.';

  return `
You are a BetterAt strategist powered by Anthropic Claude Skills.

Domain: ${domainId}
Entity: ${entityTitle ?? 'unnamed assignment'}
Stage: ${phase.title} — ${phase.subtitle}

Stage context:
${contextLines}

Performance signals (most recent first, max 3):
${historyLines}

Respond STRICTLY with compact JSON matching:
{
  "summary": "single sentence plan",
  "bullets": ["action", "action", "action"],
  "confidence": "low|medium|high",
  "dataPoints": ["optional metric or signal"]
}
`;
}

function parseSuggestionPayload(payload?: string | null): StrategyAISuggestion | null {
  if (!payload) {
    return null;
  }

  let trimmed = payload.trim();
  if (trimmed.startsWith('```')) {
    trimmed = trimmed.replace(/^```(?:json)?/i, '');
    if (trimmed.endsWith('```')) {
      trimmed = trimmed.slice(0, -3);
    }
  }
  trimmed = trimmed.trim();
  try {
    const parsed = JSON.parse(trimmed);
    const summary = typeof parsed.summary === 'string' ? parsed.summary : '';
    const bullets = Array.isArray(parsed.bullets) ? parsed.bullets.filter(Boolean) : [];
    const confidence =
      parsed.confidence === 'low' || parsed.confidence === 'high' ? parsed.confidence : 'medium';
    const dataPoints = Array.isArray(parsed.dataPoints)
      ? parsed.dataPoints.filter(Boolean)
      : undefined;

    if (!summary || !bullets.length) {
      throw new Error('Incomplete strategy payload');
    }

    return {
      summary,
      bullets,
      confidence,
      dataPoints,
    };
  } catch (error) {
    logger.warn('[DomainStrategyAgent] Failed to parse skill response', error);
    return null;
  }
}

function buildFallbackSuggestion({
  entityTitle,
  phase,
  history,
}: DomainStrategyPhaseRequest): StrategyAISuggestion {
  const lastPlan = history?.recent?.[0]?.plan;
  const bullets = [
    `Anchor on today's ${phase.title.toLowerCase()} objectives`,
    lastPlan?.what ? `Reinforce prior plan: ${lastPlan.what}` : 'Document the lead objective and owner',
    history?.totalEntries
      ? `Address ${history.totalEntries} logged lessons before progressing`
      : 'Capture first reflections for this phase to unlock adaptive coaching',
  ];

  return {
    summary: `${phase.title} priorities for ${entityTitle ?? 'this block'}`,
    bullets,
    confidence: history?.lastConfidence ?? 'medium',
    dataPoints: history?.lastUpdated
      ? [`Last update: ${new Date(history.lastUpdated).toLocaleString()}`]
      : undefined,
  };
}
