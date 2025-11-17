import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';

export type SequenceOption = {
  id: string;
  label: string;
  description?: string;
  durationSeconds: number;
};

export type ExecutionInsight = {
  id: string;
  label: string;
  detail: string;
  status: 'waiting' | 'tracking' | 'ready';
  metric?: string;
};

export type ShareTarget = {
  id: string;
  label: string;
  description: string;
  channel: string;
  enabled?: boolean;
};

export type EvidencePrompt = {
  id: string;
  label: string;
  description: string;
  acceptedTypes: string[];
};

export type LiveMetric = {
  id: string;
  label: string;
  value: string;
  status?: 'positive' | 'warning' | 'critical';
};

export interface WorkflowExecutionConsoleProps {
  title?: string;
  subtitle?: string;
  contextPills?: string[];
  sequenceOptions?: SequenceOption[];
  defaultSequenceId?: string;
  liveMetrics?: LiveMetric[];
  insights?: ExecutionInsight[];
  shareTargets?: ShareTarget[];
  evidencePrompts?: EvidencePrompt[];
  onSequenceStart?: (option: SequenceOption) => void;
  onSequenceStop?: (option: SequenceOption | null) => void;
  onEvidenceRequest?: (prompt: EvidencePrompt) => void;
}

const defaultSequenceOptions: SequenceOption[] = [
  { id: 'standard', label: 'Start 5-min sequence', description: 'US Sailing sync', durationSeconds: 300 },
  { id: 'rolling', label: '3-min practice', description: 'Training dock-start', durationSeconds: 180 },
];

const formatSeconds = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.max(totalSeconds % 60, 0)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const WorkflowExecutionConsole: React.FC<WorkflowExecutionConsoleProps> = ({
  title = 'Run the live sequence',
  subtitle = 'Orchestrate timing, sensors, and AI capture from one console.',
  contextPills = [],
  sequenceOptions = defaultSequenceOptions,
  defaultSequenceId,
  liveMetrics = [],
  insights = [],
  shareTargets = [],
  evidencePrompts = [],
  onSequenceStart,
  onSequenceStop,
  onEvidenceRequest,
}) => {
  const [selectedSequenceId, setSelectedSequenceId] = useState(
    defaultSequenceId ?? sequenceOptions[0]?.id,
  );
  const selectedSequence = useMemo(
    () => sequenceOptions.find((option) => option.id === selectedSequenceId) ?? sequenceOptions[0],
    [sequenceOptions, selectedSequenceId],
  );

  const [remainingSeconds, setRemainingSeconds] = useState(selectedSequence?.durationSeconds ?? 0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const [shareState, setShareState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(shareTargets.map((target) => [target.id, target.enabled ?? true])),
  );

  useEffect(() => {
    setRemainingSeconds(selectedSequence?.durationSeconds ?? 0);
    if (isRunning) {
      // Restart timer if option is changed mid-run
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
      setIsRunning(false);
    }
  }, [selectedSequence?.id, selectedSequence?.durationSeconds, isRunning]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          onSequenceStop?.(selectedSequence ?? null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onSequenceStop, selectedSequence]);

  const handleStart = () => {
    if (!selectedSequence) return;
    setRemainingSeconds(selectedSequence.durationSeconds);
    setIsRunning(true);
    onSequenceStart?.(selectedSequence);
  };

  const handleStop = () => {
    setIsRunning(false);
    onSequenceStop?.(selectedSequence ?? null);
  };

  const toggleShareTarget = (targetId: string) => {
    setShareState((prev) => ({
      ...prev,
      [targetId]: !prev[targetId],
    }));
  };

  const renderSequenceOption = (option: SequenceOption) => {
    const active = option.id === selectedSequenceId;
    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.sequenceOption, active && styles.sequenceOptionActive]}
        onPress={() => setSelectedSequenceId(option.id)}
        disabled={isRunning}
      >
        <Text style={[styles.sequenceLabel, active && styles.sequenceLabelActive]}>{option.label}</Text>
        {option.description ? (
          <Text style={[styles.sequenceDescription, active && styles.sequenceDescriptionActive]}>
            {option.description}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderInsightStatus = (insight: ExecutionInsight) => {
    const statusLabel =
      insight.status === 'ready' ? 'Ready' : insight.status === 'tracking' ? 'Live' : 'Queued';
    return (
      <View key={insight.id} style={styles.insightRow}>
        <View style={styles.insightMeta}>
          <Text style={styles.insightLabel}>{insight.label}</Text>
          <Text style={styles.insightDetail}>{insight.detail}</Text>
        </View>
        <View style={styles.insightStatus}>
          <Text style={[styles.statusPill, insight.status === 'ready' && styles.statusReady, insight.status === 'tracking' && styles.statusTracking]}>
            {statusLabel}
          </Text>
          {insight.metric && <Text style={styles.insightMetric}>{insight.metric}</Text>}
        </View>
      </View>
    );
  };

  const renderEvidencePrompt = (prompt: EvidencePrompt) => (
    <TouchableOpacity
      key={prompt.id}
      style={styles.evidenceCard}
      onPress={() => onEvidenceRequest?.(prompt)}
    >
      <View style={styles.evidenceHeader}>
        <Text style={styles.evidenceLabel}>{prompt.label}</Text>
        <Text style={styles.evidenceTypes}>{prompt.acceptedTypes.join(' • ')}</Text>
      </View>
      <Text style={styles.evidenceDescription}>{prompt.description}</Text>
      <Text style={styles.evidenceCta}>Add capture</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.pillRow}>
          {contextPills.map((pill) => (
            <Text key={pill} style={styles.contextPill}>
              {pill}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.primaryCard}>
        <View style={styles.timerColumn}>
          <Text style={styles.timerLabel}>Countdown</Text>
          <Text style={styles.timerValue}>{formatSeconds(remainingSeconds)}</Text>
          <Text style={styles.timerMeta}>
            {isRunning ? 'Sequence live • GPS + sensors recording' : 'Standing by for your start call'}
          </Text>
          <View style={styles.timerButtons}>
            {!isRunning ? (
              <TouchableOpacity style={[styles.timerButton, styles.timerButtonPrimary]} onPress={handleStart}>
                <Text style={styles.timerButtonText}>Start sequence</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.timerButton, styles.timerButtonStop]} onPress={handleStop}>
                <Text style={styles.timerButtonText}>Stop + save track</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.sequenceList}>
          <Text style={styles.sequenceTitle}>Preset sequences</Text>
          {sequenceOptions.map(renderSequenceOption)}
        </View>
      </View>

      {liveMetrics.length > 0 && (
        <View style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>Live tracking health</Text>
          <View style={styles.metricGrid}>
            {liveMetrics.map((metric) => (
              <View key={metric.id} style={styles.metricItem}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text
                  style={[
                    styles.metricValue,
                    metric.status === 'warning' && styles.metricWarning,
                    metric.status === 'critical' && styles.metricCritical,
                  ]}
                >
                  {metric.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {insights.length > 0 && (
        <View style={styles.insightsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI analyst queue</Text>
            <Text style={styles.sectionHelper}>Anthropic skills auto-run when you end the timer</Text>
          </View>
          {insights.map(renderInsightStatus)}
        </View>
      )}

      {shareTargets.length > 0 && (
        <View style={styles.sharingCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Auto-share</Text>
            <Text style={styles.sectionHelper}>Control who receives the GPS track + notes</Text>
          </View>
          {shareTargets.map((target) => (
            <View key={target.id} style={styles.shareRow}>
              <View style={styles.shareMeta}>
                <Text style={styles.shareLabel}>{target.label}</Text>
                <Text style={styles.shareDescription}>{target.description}</Text>
                <Text style={styles.shareChannel}>{target.channel}</Text>
              </View>
              <Switch
                value={!!shareState[target.id]}
                onValueChange={() => toggleShareTarget(target.id)}
                trackColor={{ false: '#C8C8C8', true: '#4ADE80' }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>
      )}

      {evidencePrompts.length > 0 && (
        <View style={styles.evidenceSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Evidence capture</Text>
            <Text style={styles.sectionHelper}>Drop in video or photos the AI can compare to your strategy</Text>
          </View>
          <View style={styles.evidenceGrid}>
            {evidencePrompts.map(renderEvidencePrompt)}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
    marginTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contextPill: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    backgroundColor: '#F9FAFB',
  },
  primaryCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    gap: 24,
    flexWrap: 'wrap',
  },
  timerColumn: {
    flex: 1,
    minWidth: 220,
  },
  timerLabel: {
    color: '#A5B4FC',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  timerValue: {
    fontSize: 64,
    color: '#F8FAFC',
    fontVariant: ['tabular-nums'],
    marginTop: 8,
    fontWeight: '700',
  },
  timerMeta: {
    color: '#CBD5F5',
    fontSize: 14,
    marginTop: 8,
  },
  timerButtons: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  timerButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  timerButtonPrimary: {
    backgroundColor: '#22D3EE',
    borderColor: '#22D3EE',
  },
  timerButtonStop: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  timerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  sequenceList: {
    flex: 1,
    minWidth: 220,
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderRadius: 16,
    padding: 16,
  },
  sequenceTitle: {
    color: '#94A3B8',
    fontSize: 13,
    textTransform: 'uppercase',
    marginBottom: 12,
    fontWeight: '600',
  },
  sequenceOption: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    marginBottom: 10,
  },
  sequenceOptionActive: {
    borderColor: '#22D3EE',
    backgroundColor: 'rgba(34,211,238,0.08)',
  },
  sequenceLabel: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600',
  },
  sequenceLabelActive: {
    color: '#F8FAFC',
  },
  sequenceDescription: {
    color: '#CBD5F5',
    fontSize: 13,
    marginTop: 4,
  },
  sequenceDescriptionActive: {
    color: '#F8FAFC',
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricItem: {
    minWidth: 120,
  },
  metricLabel: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 4,
  },
  metricValue: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
  },
  metricWarning: {
    color: '#D97706',
  },
  metricCritical: {
    color: '#DC2626',
  },
  insightsCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FCD34D',
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#78350F',
  },
  sectionHelper: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
    textAlign: 'right',
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  insightMeta: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#78350F',
  },
  insightDetail: {
    fontSize: 13,
    color: '#92400E',
    marginTop: 4,
  },
  insightStatus: {
    alignItems: 'flex-end',
    minWidth: 90,
    gap: 4,
  },
  statusPill: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: '#7C2D12',
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  statusReady: {
    backgroundColor: '#FDE68A',
  },
  statusTracking: {
    backgroundColor: '#FCD34D',
  },
  insightMetric: {
    fontSize: 12,
    color: '#7C2D12',
  },
  sharingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  shareMeta: {
    flex: 1,
    marginRight: 16,
  },
  shareLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  shareDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  shareChannel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  evidenceSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  evidenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  evidenceCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  evidenceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  evidenceTypes: {
    fontSize: 12,
    color: '#6B7280',
  },
  evidenceDescription: {
    fontSize: 13,
    color: '#4B5563',
  },
  evidenceCta: {
    marginTop: 12,
    fontSize: 13,
    color: '#0EA5E9',
    fontWeight: '600',
  },
});

export default WorkflowExecutionConsole;
