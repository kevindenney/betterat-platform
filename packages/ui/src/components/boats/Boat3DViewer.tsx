import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface BoatTuningSnapshot {
  shrouds: number;
  backstay: number;
  forestay: number;
  mastButtPosition: number;
}

export interface BoatRigProfile {
  name: string;
  forestayBaseline: number;
  headline: string;
  notes: string[];
}

export interface Boat3DViewerProps {
  boatClass: string;
  tuning: BoatTuningSnapshot;
  width?: number;
  height?: number;
}

const CLASS_SUMMARY: Record<string, BoatRigProfile> = {
  etchells: {
    name: 'Etchells',
    forestayBaseline: 10950,
    headline: 'Etchells tuned baseline',
    notes: [
      'Mast rake 47–47.5in (forestay ≈ 10.95m)',
      'Upper shrouds 25–28 PT‑2M · lowers 12–14 PT‑1M',
      'Backstay marks 0–7 with vang assist above 12kts',
    ],
  },
  dragon: {
    name: 'Dragon',
    forestayBaseline: 10800,
    headline: 'Dragon rig matrix',
    notes: [
      'Forestay baseline 10.8m with 120mm pre-bend',
      'Uppers ~28 PT‑3M · lowers ~18 PT‑2M',
      'Backstay adds ~40mm bend at mark 6 (>14kts)',
    ],
  },
};

const fallbackProfile: BoatRigProfile = {
  name: 'Custom class',
  forestayBaseline: 11000,
  headline: 'Rig baseline',
  notes: [
    'Upload a class profile to unlock the 3D visualizer.',
    'BetterAt will auto-tune the analytics once this class is defined.',
  ],
};

const formatPercent = (value: number) => `${Math.round(value)}%`;

export function Boat3DViewer({ boatClass, tuning, width = 420, height = 320 }: Boat3DViewerProps) {
  const profile = useMemo(() => {
    const key = boatClass?.toLowerCase?.();
    return (key && CLASS_SUMMARY[key]) || fallbackProfile;
  }, [boatClass]);

  const rakeDelta = tuning.forestay - profile.forestayBaseline;
  const rakeLabel = rakeDelta === 0 ? 'On baseline' : `${rakeDelta > 0 ? '+' : ''}${rakeDelta} mm`;

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.headerRow}>
        <Text style={styles.kicker}>Rig Visualizer</Text>
        <Text style={styles.classLabel}>{profile.name}</Text>
      </View>
      <Text style={styles.headline}>{profile.headline}</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Forestay</Text>
          <Text style={styles.metricValue}>{(tuning.forestay / 1000).toFixed(2)} m</Text>
          <Text style={styles.metricMeta}>{rakeLabel}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Shrouds</Text>
          <Text style={styles.metricValue}>{formatPercent(tuning.shrouds)}</Text>
          <Text style={styles.metricMeta}>Even tension</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Backstay</Text>
          <Text style={styles.metricValue}>{formatPercent(tuning.backstay)}</Text>
          <Text style={styles.metricMeta}>Target 0-100 scale</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Mast butt</Text>
          <Text style={styles.metricValue}>{tuning.mastButtPosition} mm</Text>
          <Text style={styles.metricMeta}>Fore/aft trim</Text>
        </View>
      </View>

      <View style={styles.callouts}>
        {profile.notes.map((note) => (
          <View key={note} style={styles.noteChip}>
            <Text style={styles.noteText}>{note}</Text>
          </View>
        ))}
      </View>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderEmoji}>🧭</Text>
        <Text style={styles.placeholderTitle}>3D rig view coming soon</Text>
        <Text style={styles.placeholderBody}>
        This preview build doesn&rsquo;t ship the React Three Fiber renderer. Your tuning analytics are
          still stored, and the interactive rig visualizer will relaunch once the lightweight shader
          port is complete.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#0F172A',
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kicker: {
    color: '#94A3B8',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  classLabel: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '700',
  },
  headline: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flexGrow: 1,
    minWidth: 90,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  metricLabel: {
    color: '#CBD5F5',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  metricMeta: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  callouts: {
    gap: 8,
  },
  noteChip: {
    backgroundColor: '#1E1B4B',
    padding: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#4338CA',
  },
  noteText: {
    color: '#E0E7FF',
    fontSize: 13,
    lineHeight: 18,
  },
  placeholder: {
    marginTop: 4,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#111827',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1F2937',
    alignItems: 'center',
    gap: 6,
  },
  placeholderEmoji: {
    fontSize: 28,
  },
  placeholderTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderBody: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default Boat3DViewer;
