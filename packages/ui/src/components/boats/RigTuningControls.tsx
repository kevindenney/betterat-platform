// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

export interface RigTuning {
  shrouds: number;
  backstay: number;
  forestay: number;
  mastButtPosition: number;
}

export interface TuningParameterConfig {
  key: keyof RigTuning;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  icon?: Ionicons['props']['name'];
}

export interface RigTuningControlsProps {
  tuning: RigTuning;
  boatClass?: string;
  parameters?: TuningParameterConfig[];
  onTuningChange?: (tuning: RigTuning) => void;
  onSaveConfiguration?: (tuning: RigTuning) => void;
  helperText?: string;
}

const DEFAULT_PARAMETERS: TuningParameterConfig[] = [
  {
    key: 'shrouds',
    label: 'Shroud tension',
    description: 'Lateral support for the mast. Higher tension = stiffer rig.',
    min: 0,
    max: 100,
    step: 1,
    unit: 'units',
    icon: 'git-network',
  },
  {
    key: 'backstay',
    label: 'Backstay tension',
    description: 'Controls mast bend and forestay tension.',
    min: 0,
    max: 100,
    step: 1,
    unit: 'units',
    icon: 'trending-down',
  },
  {
    key: 'forestay',
    label: 'Forestay length',
    description: 'Adjusts mast rake. Shorter = more rake aft.',
    min: 10600,
    max: 11000,
    step: 5,
    unit: 'mm',
    icon: 'speedometer',
  },
  {
    key: 'mastButtPosition',
    label: 'Mast butt position',
    description: 'Fore-aft mast location within the mast step.',
    min: 0,
    max: 100,
    step: 1,
    unit: 'mm aft',
    icon: 'construct',
  },
];

export function RigTuningControls({
  tuning,
  boatClass = 'Dragon',
  parameters = DEFAULT_PARAMETERS,
  onTuningChange,
  onSaveConfiguration,
  helperText = 'Changes reflect instantly in the 3D model above.',
}: RigTuningControlsProps) {
  const updateValue = (key: keyof RigTuning, value: number) => {
    const clamped = Math.max(
      parameters.find((p) => p.key === key)?.min ?? -Infinity,
      Math.min(parameters.find((p) => p.key === key)?.max ?? Infinity, value),
    );
    const next = {
      ...tuning,
      [key]: clamped,
    };
    onTuningChange?.(next);
  };

  const handleReset = (param: TuningParameterConfig) => {
    updateValue(param.key, Math.round((param.min + param.max) / 2));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Rig tuning</Text>
        <Text style={styles.subtitle}>
          {boatClass} class • Adjust repeatable tuning parameters.
        </Text>
      </View>

      {parameters.map((param) => {
        const currentValue = tuning[param.key];
        const ratio = (currentValue - param.min) / (param.max - param.min);
        const percentage = Math.max(0, Math.min(1, ratio));

        return (
          <View key={param.key as string} style={styles.parameterCard}>
            <View style={styles.parameterHeader}>
              <View style={styles.parameterIcon}>
                <Ionicons name={param.icon ?? 'options'} size={18} color="#0284C7" />
              </View>
              <View style={styles.parameterDetails}>
                <Text style={styles.parameterLabel}>{param.label}</Text>
                <Text style={styles.parameterDescription}>{param.description}</Text>
              </View>
            </View>

            <View style={styles.valueRow}>
              <Text style={styles.value}>{currentValue}</Text>
              <Text style={styles.unit}>{param.unit}</Text>
            </View>

            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${percentage * 100}%` }]} />
            </View>

            <View style={styles.rangeLabels}>
              <Text style={styles.rangeText}>
                {param.min} {param.unit}
              </Text>
              <Text style={styles.rangeText}>
                {param.max} {param.unit}
              </Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => updateValue(param.key, currentValue - param.step)}
              >
                <Ionicons name="remove" size={16} color="#475569" />
                <Text style={styles.adjustText}>-{param.step}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetButton} onPress={() => handleReset(param)}>
                <Ionicons name="refresh" size={16} color="#0369A1" />
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => updateValue(param.key, currentValue + param.step)}
              >
                <Ionicons name="add" size={16} color="#475569" />
                <Text style={styles.adjustText}>+{param.step}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {onSaveConfiguration && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onSaveConfiguration?.(tuning)}
        >
          <Ionicons name="save-outline" size={18} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save tuning configuration</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.helperText}>{helperText}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
  },
  parameterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  parameterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  parameterIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  parameterDetails: {
    flex: 1,
  },
  parameterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  parameterDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0284C7',
  },
  unit: {
    fontSize: 13,
    color: '#475569',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    marginTop: 12,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  rangeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  adjustButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  adjustText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0369A1',
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#0369A1',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  helperText: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
});

export default RigTuningControls;
