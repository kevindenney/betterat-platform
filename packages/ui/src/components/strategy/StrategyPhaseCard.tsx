// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated } from 'react-native';
import { RefreshCw } from 'lucide-react-native';

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

const defaultTheme: StrategyCardTheme = {
  cardBackground: '#FFFDF8',
  cardBorder: '#DED3C2',
  aiBackground: '#F7F3EB',
  aiBorder: '#E6DCCC',
  refreshBackground: '#FFFDF8',
  refreshBorder: '#D8CCBA',
  refreshText: '#4C4B48',
  eyebrowColor: '#8B7965',
  pillBorder: '#D8CCBA',
  pillLabel: '#8B7965',
  pillText: '#4C3F32',
  iconBackground: '#F4ECDD',
  iconColor: '#4C3F32',
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
  fieldLabels?: Partial<Record<keyof StrategyPlanFields, { label: string; placeholder?: string }>>;
};

const defaultFieldLabels: Record<keyof StrategyPlanFields, { label: string; placeholder?: string }> = {
  what: { label: 'What are we doing to win?' },
  why: { label: 'Why this choice?' },
  how: { label: 'How will we execute?' },
  who: { label: 'Who owns this?', placeholder: 'Driver, tactician, trim team…' },
};

export const StrategyPhaseCard: React.FC<StrategyPhaseCardProps> = ({
  phaseId,
  title,
  subtitle,
  aiSuggestion,
  plan,
  onPlanChange,
  onRefreshSuggestion,
  saving,
  refreshInFlight,
  errorMessage,
  theme,
  icon,
  fieldLabels,
}) => {
  const handleFieldChange = (field: keyof StrategyPlanFields, value: string) => {
    onPlanChange(phaseId, { ...plan, [field]: value });
  };

  const appliedTheme: StrategyCardTheme = { ...defaultTheme, ...(theme || {}) };
  const confidenceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (aiSuggestion?.confidence) {
      confidenceAnim.setValue(0);
      Animated.timing(confidenceAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [aiSuggestion?.confidence, confidenceAnim]);

  return (
    <View style={[styles.card, { backgroundColor: appliedTheme.cardBackground, borderColor: appliedTheme.cardBorder }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.phaseLabel}>{title}</Text>
          {subtitle ? <Text style={styles.phaseSubtitle}>{subtitle}</Text> : null}
        </View>
        {icon ? (
          <View style={[styles.iconBadge, { backgroundColor: appliedTheme.iconBackground }]}>
            {typeof icon === 'string' ? (
              <Text style={[styles.iconText, { color: appliedTheme.iconColor }]}>{icon}</Text>
            ) : (
              icon
            )}
          </View>
        ) : null}
        {onRefreshSuggestion ? (
          <TouchableOpacity
            accessibilityLabel={`Refresh ${title} strategy suggestions`}
            style={[styles.refreshButton, { borderColor: appliedTheme.refreshBorder, backgroundColor: appliedTheme.refreshBackground }]}
            onPress={() => onRefreshSuggestion(phaseId)}
            disabled={refreshInFlight}
          >
            <RefreshCw size={16} color={appliedTheme.refreshText} />
            <Text style={[styles.refreshText, { color: appliedTheme.refreshText }]}>{refreshInFlight ? 'Updating…' : 'Refresh'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.columns}>
        <View style={[styles.aiColumn, { backgroundColor: appliedTheme.aiBackground, borderColor: appliedTheme.aiBorder }]}>
          <Text style={[styles.aiEyebrow, { color: appliedTheme.eyebrowColor }]}>AI STRATEGY</Text>
          {aiSuggestion ? (
            <>
              <Text style={styles.aiSummary}>{aiSuggestion.summary}</Text>
              {aiSuggestion.bullets.map((bullet, index) => (
                <View key={`${phaseId}-bullet-${index}`} style={styles.bulletRow}>
                  <Text style={styles.bulletMarker}>•</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
              {aiSuggestion.confidence ? (
                <Animated.View
                  style={[
                    styles.confidencePill,
                    { borderColor: appliedTheme.pillBorder, opacity: confidenceAnim, transform: [{ scale: confidenceAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] },
                  ]}
                >
                  <Text style={[styles.confidenceLabel, { color: appliedTheme.pillLabel }]}>Confidence</Text>
                  <Text style={[styles.confidenceValue, { color: appliedTheme.pillText }]}>{aiSuggestion.confidence.toUpperCase()}</Text>
                </Animated.View>
              ) : null}
            </>
          ) : (
            <Text style={styles.aiPlaceholder}>No AI intel yet. Refresh to pull the latest weather-backed plan.</Text>
          )}
        </View>

        <View style={styles.planColumn}>
          {(['what', 'why', 'how', 'who'] as (keyof StrategyPlanFields)[]).map((field) => {
            const applied = fieldLabels?.[field] ?? defaultFieldLabels[field];
            return (
              <PlanField
                key={`${phaseId}-${field}`}
                label={applied.label}
                value={plan[field]}
                placeholder={applied.placeholder}
                onChangeText={(value: string) => handleFieldChange(field, value)}
              />
            );
          })}
        </View>
      </View>
      {saving ? <Text style={styles.statusText}>Saving…</Text> : null}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
};

type PlanFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

const PlanField = ({ label, value, onChangeText, placeholder }: PlanFieldProps) => {
  return (
    <View style={styles.planField}>
      <Text style={styles.planLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A89F90"
        multiline
        style={styles.planInput}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: '#DED3C2',
    marginBottom: 24,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  phaseLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1810',
  },
  phaseSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#7A6D5F',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#D8CCBA',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4C4B48',
  },
  columns: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  iconText: {
    fontSize: 18,
  },
  aiColumn: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#F7F3EB',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6DCCC',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  aiEyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#8B7965',
    marginBottom: 8,
  },
  aiSummary: {
    fontSize: 15,
    color: '#3F352A',
    marginBottom: 10,
    fontWeight: '600',
  },
  aiPlaceholder: {
    fontSize: 13,
    color: '#A89F90',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  bulletMarker: {
    fontSize: 14,
    lineHeight: 18,
    color: '#4C4B48',
  },
  bulletText: {
    flex: 1,
    color: '#4C4B48',
    fontSize: 13,
    lineHeight: 18,
  },
  confidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 12,
  },
  confidenceLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: '#8B7965',
    textTransform: 'uppercase',
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4C3F32',
  },
  planColumn: {
    flex: 1,
    minWidth: 240,
  },
  planField: {
    marginBottom: 12,
  },
  planLabel: {
    fontSize: 12,
    letterSpacing: 1,
    color: '#7A6D5F',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  planInput: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#D3C5B2',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1F1810',
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6D5D4A',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#B45309',
  },
});
