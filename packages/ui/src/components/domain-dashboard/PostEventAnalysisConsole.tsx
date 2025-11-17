import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export type AnalysisMetric = {
  id: string;
  label: string;
  plan: string;
  actual: string;
  delta?: string;
  suggestion?: string;
};

export type PhaseQuestion = {
  id: string;
  label: string;
  prompt: string;
  helper?: string;
  aiFinding?: string | null;
};

export type ImprovementIdea = {
  id: string;
  title: string;
  detail: string;
  aiTag?: string;
};

export type ContextDatum = {
  label: string;
  value: string;
};

export interface PostEventAnalysisConsoleProps {
  title?: string;
  subtitle?: string;
  context?: ContextDatum[];
  weatherSummary?: ContextDatum[];
  strategySummary?: string;
  trackSummary?: string;
  metrics?: AnalysisMetric[];
  questions: PhaseQuestion[];
  responses?: Record<string, string>;
  onResponseChange?: (id: string, value: string) => void;
  improvementIdeas?: ImprovementIdea[];
  aiSummary?: string;
  callToAction?: {
    label: string;
    helper?: string;
    onPress?: () => void;
  };
}

export const PostEventAnalysisConsole: React.FC<PostEventAnalysisConsoleProps> = ({
  title = 'Post-race analysis',
  subtitle = 'Compare execution vs. the plan, capture lessons, and lock next-race focus.',
  context = [],
  weatherSummary = [],
  strategySummary,
  trackSummary,
  metrics = [],
  questions,
  responses = {},
  onResponseChange,
  improvementIdeas = [],
  aiSummary,
  callToAction,
}) => {
  const renderMetric = (metric: AnalysisMetric) => (
    <View key={metric.id} style={styles.metricCard}>
      <Text style={styles.metricLabel}>{metric.label}</Text>
      <View style={styles.metricRow}>
        <Text style={styles.metricValue}>{metric.actual}</Text>
        <Text style={styles.metricDivider}>vs</Text>
        <Text style={styles.metricPlan}>{metric.plan}</Text>
      </View>
      {metric.delta ? <Text style={styles.metricDelta}>{metric.delta}</Text> : null}
      {metric.suggestion ? <Text style={styles.metricSuggestion}>{metric.suggestion}</Text> : null}
    </View>
  );

  const renderQuestion = (question: PhaseQuestion) => (
    <View key={question.id} style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View>
          <Text style={styles.questionLabel}>{question.label}</Text>
          <Text style={styles.questionPrompt}>{question.prompt}</Text>
        </View>
        {question.aiFinding ? (
          <View style={styles.aiPill}>
            <Text style={styles.aiPillText}>{question.aiFinding}</Text>
          </View>
        ) : null}
      </View>
      {question.helper ? <Text style={styles.questionHelper}>{question.helper}</Text> : null}
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={4}
        placeholder="Add your notes..."
        value={responses[question.id] ?? ''}
        onChangeText={(value) => onResponseChange?.(question.id, value)}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.contextGrid}>
        {context.map((item) => (
          <View key={item.label} style={styles.contextCard}>
            <Text style={styles.contextLabel}>{item.label}</Text>
            <Text style={styles.contextValue}>{item.value}</Text>
          </View>
        ))}
        {weatherSummary.length > 0 && (
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>Conditions snapshot</Text>
            {weatherSummary.map((item) => (
              <Text key={item.label} style={styles.contextValueSecondary}>
                {item.label}: {item.value}
              </Text>
            ))}
          </View>
        )}
        {strategySummary ? (
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>Strategy reference</Text>
            <Text style={styles.contextValueSecondary}>{strategySummary}</Text>
          </View>
        ) : null}
        {trackSummary ? (
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>Track capture</Text>
            <Text style={styles.contextValueSecondary}>{trackSummary}</Text>
          </View>
        ) : null}
      </View>

      {metrics.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Plan vs execution</Text>
            <Text style={styles.sectionHelper}>Delta highlights feed the AI coaching</Text>
          </View>
          <View style={styles.metricGrid}>{metrics.map(renderMetric)}</View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Phase journal</Text>
          <Text style={styles.sectionHelper}>Document what happened and why</Text>
        </View>
        <View style={styles.questionStack}>{questions.map(renderQuestion)}</View>
      </View>

      {improvementIdeas.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI improvement ideas</Text>
            <Text style={styles.sectionHelper}>Auto-generated from your track + answers</Text>
          </View>
          <View style={styles.improvementGrid}>
            {improvementIdeas.map((idea) => (
              <View key={idea.id} style={styles.improvementCard}>
                <View style={styles.improvementHeader}>
                  <Text style={styles.improvementTitle}>{idea.title}</Text>
                  {idea.aiTag ? <Text style={styles.improvementTag}>{idea.aiTag}</Text> : null}
                </View>
                <Text style={styles.improvementDetail}>{idea.detail}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {aiSummary ? (
        <View style={styles.section}>
          <View style={styles.aiSummaryCard}>
            <Text style={styles.sectionTitle}>Anthropic recap</Text>
            <Text style={styles.aiSummaryText}>{aiSummary}</Text>
          </View>
        </View>
      ) : null}

      {callToAction ? (
        <TouchableOpacity style={styles.ctaButton} onPress={callToAction.onPress}>
          <Text style={styles.ctaLabel}>{callToAction.label}</Text>
          {callToAction.helper ? <Text style={styles.ctaHelper}>{callToAction.helper}</Text> : null}
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
  },
  header: {
    marginBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
  },
  contextGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  contextCard: {
    flexGrow: 1,
    minWidth: 180,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  contextLabel: {
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    fontWeight: '600',
  },
  contextValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  contextValueSecondary: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sectionHelper: {
    fontSize: 13,
    color: '#6B7280',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flexGrow: 1,
    minWidth: 180,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricDivider: {
    color: '#9CA3AF',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  metricPlan: {
    fontSize: 16,
    color: '#6B7280',
  },
  metricDelta: {
    fontSize: 13,
    color: '#DC2626',
    marginTop: 6,
  },
  metricSuggestion: {
    fontSize: 13,
    color: '#374151',
    marginTop: 4,
  },
  questionStack: {
    gap: 16,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  questionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  questionPrompt: {
    fontSize: 13,
    color: '#4B5563',
  },
  questionHelper: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  textInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F8FAFC',
    textAlignVertical: 'top',
  },
  aiPill: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  aiPillText: {
    fontSize: 12,
    color: '#4338CA',
    fontWeight: '600',
  },
  improvementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  improvementCard: {
    flexGrow: 1,
    minWidth: 220,
    backgroundColor: '#FDF2F8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    padding: 16,
  },
  improvementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  improvementTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#831843',
  },
  improvementTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#BE185D',
    textTransform: 'uppercase',
  },
  improvementDetail: {
    fontSize: 13,
    color: '#9D174D',
  },
  aiSummaryCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 20,
  },
  aiSummaryText: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    gap: 6,
  },
  ctaLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  ctaHelper: {
    fontSize: 13,
    color: '#CBD5F5',
  },
});

export default PostEventAnalysisConsole;
