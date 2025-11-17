import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  StrategyPhaseCard,
  StrategyCollaborationPanel,
  type StrategyCardTheme,
  type StrategyCollaborationPanelProps,
  type UseDomainStrategyPlannerResult,
  useDomainStrategyPlanner,
} from '@betterat/ui';
import { generateDomainPhaseSuggestion } from '@betterat/ai';
import { Search, PenSquare, Ruler, Palette as PaletteIcon, Sparkles } from 'lucide-react-native';
import { getStrategyPhases, type StrategyPlanFields } from '@betterat/core';

export type PromptBoard = {
  id: string;
  title: string;
  prompts: string[];
  aiIdea: string;
  subject?: string;
  medium?: string;
};

const PROMPT_BOARDS: PromptBoard[] = [
  {
    id: 'gesture-marathon',
    title: 'Gesture Marathon',
    prompts: ['30s poses', '2 min expressive', 'Animal motion study'],
    aiIdea: 'Mix dance references with sports photography for dynamism.',
    medium: 'Charcoal + ink',
    subject: 'Figure study',
  },
  {
    id: 'perspective-residency',
    title: 'Perspective Residency',
    prompts: ['Cityscape at dusk', 'Interior cafe scene', 'Overhead market'],
    aiIdea: 'Rotate vanishing points every session to break autopilot.',
    medium: 'Graphite + digital paint',
    subject: 'Urban storytelling',
  },
  {
    id: 'material-exploration',
    title: 'Material Exploration',
    prompts: ['Brushed metal', 'Velvet fabric', 'Frosted glass'],
    aiIdea: 'Layer gouache and pastel to push texture contrast.',
    medium: 'Gouache + pastel',
    subject: 'Still life lighting',
  },
];

const DRAWING_PHASES = getStrategyPhases('drawing');
const DRAWING_STRATEGY_THEME: StrategyCardTheme = {
  cardBackground: '#FEF9FF',
  cardBorder: '#F5D0FE',
  aiBackground: '#F9E8FF',
  aiBorder: '#F5D0FE',
  refreshBackground: '#F4EBFF',
  refreshBorder: '#E9D5FF',
  refreshText: '#6B21A8',
  eyebrowColor: '#9333EA',
  pillBorder: '#E9D5FF',
  pillLabel: '#9333EA',
  pillText: '#6B21A8',
  iconBackground: '#F5E1FF',
  iconColor: '#6B21A8',
};

const DRAWING_PHASE_ICONS: Record<string, React.ReactNode> = {
  research: <Search size={18} color={DRAWING_STRATEGY_THEME.iconColor} strokeWidth={1.6} />, 
  thumbnails: <PenSquare size={18} color={DRAWING_STRATEGY_THEME.iconColor} strokeWidth={1.6} />, 
  line: <Ruler size={18} color={DRAWING_STRATEGY_THEME.iconColor} strokeWidth={1.6} />, 
  color: <PaletteIcon size={18} color={DRAWING_STRATEGY_THEME.iconColor} strokeWidth={1.6} />, 
  final: <Sparkles size={18} color={DRAWING_STRATEGY_THEME.iconColor} strokeWidth={1.6} />,
};

const DRAWING_FIELD_LABELS = {
  what: {
    label: 'What are we creating or studying?',
  },
  why: {
    label: 'Why this subject or prompt?',
  },
  how: {
    label: 'How will we execute (tools, process, schedule)?',
  },
  who: {
    label: 'Who is leading / collaborating?',
    placeholder: 'Solo, mentor critique, studio partner…',
  },
};

export const DrawingStrategyPlannerSection: React.FC<{ embedded?: boolean }> = ({ embedded }) => {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(PROMPT_BOARDS[0]?.id ?? null);
  const selectedBoard = PROMPT_BOARDS.find((board) => board.id === selectedBoardId) ?? PROMPT_BOARDS[0];

  const strategyPlanner = useDomainStrategyPlanner({
    domainId: 'drawing',
    entityId: selectedBoardId,
    entityTitle: selectedBoard?.title,
    phases: DRAWING_PHASES,
    getPhaseContext: () => ({
      prompts: selectedBoard?.prompts ?? [],
      aiIdea: selectedBoard?.aiIdea,
      subject: selectedBoard?.subject,
      medium: selectedBoard?.medium,
    }),
    generateSuggestion: generateDomainPhaseSuggestion,
  });

  const historyEntries = Object.entries(strategyPlanner.history ?? {});
  const collaborationPanel = useMemo(
    () => buildDrawingCollaborationModel(selectedBoard, strategyPlanner),
    [selectedBoard, strategyPlanner.plans, strategyPlanner.suggestions],
  );

  return (
    <View style={embedded ? styles.embeddedContent : undefined}>
      <Text style={styles.eyebrow}>Prompts</Text>
      <Text style={styles.title}>Plan sessions with prompt boards</Text>
      <Text style={styles.subtitle}>
        Equivalent to the "Courses" tab, but for drawing: structured practice ladders, AI prompt
        mashups, and session templates ready to drag into the Sessions carousel.
      </Text>

      {PROMPT_BOARDS.map((board) => {
        const isActive = board.id === selectedBoardId;
        return (
          <TouchableOpacity
            key={board.id}
            style={[styles.boardCard, isActive && styles.boardCardActive]}
            onPress={() => setSelectedBoardId(board.id)}
          >
            <Text style={styles.boardTitle}>{board.title}</Text>
            <View style={styles.promptList}>
              {board.prompts.map((prompt) => (
                <View key={prompt} style={styles.promptPill}>
                  <Text style={styles.promptText}>{prompt}</Text>
                </View>
              ))}
            </View>
            <View style={styles.aiStrip}>
              <Text style={styles.aiLabel}>AI idea</Text>
              <Text style={styles.aiCopy}>{board.aiIdea}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={styles.strategySection}>
        <Text style={styles.strategyEyebrow}>Session Strategy</Text>
        <TouchableOpacity style={styles.strategyRefresh} onPress={strategyPlanner.refreshAll}>
          <Text style={styles.strategyRefreshText}>Refresh AI suggestions</Text>
        </TouchableOpacity>

        {historyEntries.length ? (
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Recent signals</Text>
            {historyEntries.slice(0, 3).map(([phaseId, history]) => (
              <View key={phaseId} style={styles.historyRow}>
                <Text style={styles.historyPhase}>
                  {DRAWING_PHASES.find((phase) => phase.id === phaseId)?.title ?? phaseId}
                </Text>
                <Text style={styles.historyMeta}>
                  {history.recent?.[0]?.plan?.what ?? 'No plan saved'}
                </Text>
                <Text style={styles.historyMetaSecondary}>
                  {history.totalEntries} entries · confidence {history.lastConfidence ?? 'n/a'}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {collaborationPanel ? (
          <StrategyCollaborationPanel
            heading={collaborationPanel.heading}
            description={collaborationPanel.description}
            connectionLabel={collaborationPanel.connectionLabel}
            connectionDescription={collaborationPanel.connectionDescription}
            collaborators={collaborationPanel.collaborators}
            topics={collaborationPanel.topics}
            onConnect={() => console.log('drawing_collab_join_clicked', collaborationPanel.connectionLabel)}
          />
        ) : null}

        {strategyPlanner.phases.map((phase) => (
          <StrategyPhaseCard
            key={phase.id}
            phaseId={phase.id}
            title={phase.title}
            subtitle={phase.subtitle}
            aiSuggestion={strategyPlanner.suggestions?.[phase.id]}
            plan={strategyPlanner.plans?.[phase.id] ?? { what: '', why: '', how: '', who: '' }}
            onPlanChange={strategyPlanner.setPlan}
            saving={strategyPlanner.planStatus?.[phase.id] === 'saving'}
            errorMessage={strategyPlanner.planErrors?.[phase.id] ?? null}
            onRefreshSuggestion={strategyPlanner.refreshPhase}
            refreshInFlight={strategyPlanner.refreshing?.[phase.id]}
            theme={DRAWING_STRATEGY_THEME}
            icon={DRAWING_PHASE_ICONS[phase.id]}
            fieldLabels={DRAWING_FIELD_LABELS}
          />
        ))}
      </View>
    </View>
  );
};

const PromptsScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <DrawingStrategyPlannerSection />
  </ScrollView>
);

export default PromptsScreen;

function buildDrawingCollaborationModel(
  board: PromptBoard | null,
  planner: UseDomainStrategyPlannerResult,
): StrategyCollaborationPanelProps | null {
  if (!board) return null;

  const planFor = (phaseId: string, field: keyof StrategyPlanFields, fallback: string) => {
    const value = planner.plans?.[phaseId]?.[field];
    return value?.trim() ? value.trim() : fallback;
  };

  const collaborators = [
    {
      id: 'studio-east',
      name: 'Atelier East Crit Club',
      subtitle: '3 illustrators · 1 mentor',
      status: 'Crit slot 7pm',
      planFocus: 'Gesture intensity exercises',
    },
    {
      id: 'mentor-z',
      name: 'Mentor Zee',
      subtitle: 'Storyboarding lead at Hyperline',
      status: 'Left paintover notes',
      planFocus: 'Push perspective exaggeration',
    },
    {
      id: 'ai-collective',
      name: 'Prompt Collective Bot',
      subtitle: 'Aggregates community mashups',
      status: 'Auto-posted',
      planFocus: 'Textures + palette swaps',
    },
    {
      id: 'lighting-lab',
      name: 'Lighting Lab',
      subtitle: 'Remote studio, weekdays',
      status: 'Online',
      planFocus: 'References for dusk scenes',
    },
  ];

  const topics = [
    {
      id: 'prompts',
      title: 'Prompt swaps & ideation',
      detail: 'Share how you are stitching prompts, mediums, and subject focus so other artists can riff or send back studies.',
      ourPlanLabel: 'Your board',
      ourPlan: planFor('research', 'what', board.prompts.join(' · ')),
      peerPlanLabel: 'Community remix',
      peerPlan: `${board.subject ?? 'Mixed media'} circle layering: ${board.aiIdea}`,
      peerSource: 'Prompt Collective Bot',
      callout: 'Drop your top 3 prompts so the collective can build a mashup reference sheet.',
      tags: ['Prompts', board.medium ?? 'Mixed medium'],
    },
    {
      id: 'materials',
      title: 'Materials + palette pairing',
      detail: 'Studios are logging what pigments + brushes are solving each phase speeds so you can benchmark your kit.',
      ourPlanLabel: 'Your stack',
      ourPlan: planFor('color', 'how', 'Document palette + blending order'),
      peerPlanLabel: 'Peer recipe',
      peerPlan: 'Gouache blocking + Procreate neon overlays for urban dusk scenes.',
      peerSource: 'Lighting Lab thread',
      callout: 'Ask Mentor Zee for brush set if you want their glow treatment.',
      tags: ['Materials', 'Color'],
    },
    {
      id: 'crit',
      title: 'Critique cadence',
      detail: 'Line + color leads coordinate when to trade WIPs so everyone enters crits with context.',
      ourPlanLabel: 'Your critique ask',
      ourPlan: planFor('final', 'who', 'Log who you need feedback from'),
      peerPlanLabel: 'Studio slot',
      peerPlan: 'Atelier East wants gesture packets by 18:00 for async review.',
      peerSource: 'Atelier East Crit Club',
      callout: 'Tap “Join” to book the Thursday async crit if you need eyes on anatomy exaggeration.',
      tags: ['Critique', 'Community'],
    },
  ];

  return {
    heading: 'Studio collaboration thread',
    description: `See how partner studios are tackling the "${board.title}" board and trade notes before you ink.`,
    connectionLabel: 'Join shared studio',
    connectionDescription: 'Connect with a critique circle to compare prompts, palettes, and roles across the workflow.',
    collaborators,
    topics,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF4FF',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  embeddedContent: {
    padding: 20,
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#C026D3',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B0764',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B21A8',
  },
  boardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0ABFC',
    marginBottom: 12,
  },
  boardCardActive: {
    borderColor: '#C026D3',
    shadowColor: '#C026D3',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  boardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B0764',
    marginBottom: 10,
  },
  promptList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FBE7FF',
  },
  promptText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7E22CE',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiStrip: {
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F9E8FF',
  },
  aiLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#7E22CE',
    marginBottom: 4,
  },
  aiCopy: {
    color: '#6B21A8',
    fontSize: 14,
  },
  strategySection: {
    marginTop: 24,
    gap: 12,
    backgroundColor: '#FEF9FF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F5D0FE',
    padding: 20,
  },
  strategyEyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#9333EA',
  },
  strategyRefresh: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    backgroundColor: '#F4EBFF',
  },
  strategyRefreshText: {
    fontSize: 12,
    letterSpacing: 1,
    color: '#6B21A8',
    textTransform: 'uppercase',
  },
  historyCard: {
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 18,
    backgroundColor: '#FFF5FF',
    padding: 16,
    gap: 10,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
    textTransform: 'uppercase',
  },
  historyRow: {
    borderTopWidth: 1,
    borderTopColor: '#F5D0FE',
    paddingTop: 8,
  },
  historyPhase: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4C1D95',
  },
  historyMeta: {
    fontSize: 13,
    color: '#6B21A8',
    marginTop: 2,
  },
  historyMetaSecondary: {
    fontSize: 12,
    color: '#A855F7',
    marginTop: 2,
  },
});
