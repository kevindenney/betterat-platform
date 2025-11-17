import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

const PATHWAYS = [
  {
    name: 'Telemetry · Admission to Discharge',
    checkpoints: ['ED handoff', 'Telemetry bundle', 'Rounds cadence', 'Discharge teaching'],
    aiSignal: 'Add diuresis micro-drill for beds 404/405',
  },
  {
    name: 'ICU Step-down · 48h plan',
    checkpoints: ['Transfer brief', 'Safety huddle', 'Falls bundle', 'QI logging'],
    aiSignal: 'Escalate respiratory sync with coverage pod C',
  },
  {
    name: 'Night Simulation Cycle',
    checkpoints: ['Scenario review', 'Skill station', 'Coaching sync', 'Reflection log'],
    aiSignal: 'Swap airway station for rapid transfusion drill',
  },
];

const PathwaysScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Pathways</Text>
      <Text style={styles.title}>Unit playbooks & clinical pathways</Text>
      <Text style={styles.subtitle}>
        Nursing analog to the "Courses" tab—standardize flows, publish checklists, and let AI surface
        micro-drills. Replace static PDFs with living pathways that update as acuity changes.
      </Text>

      {PATHWAYS.map((pathway) => (
        <View key={pathway.name} style={styles.pathwayCard}>
          <Text style={styles.pathwayName}>{pathway.name}</Text>
          <View style={styles.checkpointList}>
            {pathway.checkpoints.map((checkpoint) => (
              <View key={checkpoint} style={styles.checkpointRow}>
                <View style={styles.checkpointDot} />
                <Text style={styles.checkpointLabel}>{checkpoint}</Text>
              </View>
            ))}
          </View>
          <View style={styles.aiBanner}>
            <Text style={styles.aiEyebrow}>AI Signal</Text>
            <Text style={styles.aiCopy}>{pathway.aiSignal}</Text>
          </View>
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coming soon</Text>
        <Text style={styles.sectionCopy}>
          Integrate Epic orders and LMS modules, publish micro-pathways for new hires, and run "Plan →
          Care → Broadcast → Debrief" inside the same canvas.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#DB2777',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
  },
  pathwayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  pathwayName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  checkpointList: {
    gap: 8,
    marginBottom: 12,
  },
  checkpointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkpointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A78BFA',
  },
  checkpointLabel: {
    fontSize: 14,
    color: '#334155',
  },
  aiBanner: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 12,
  },
  aiEyebrow: {
    fontSize: 11,
    letterSpacing: 0.5,
    color: '#7C3AED',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  aiCopy: {
    color: '#4C1D95',
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
  },
  sectionTitle: {
    color: '#065F46',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionCopy: {
    color: '#166534',
    fontSize: 14,
  },
});

export default PathwaysScreen;
