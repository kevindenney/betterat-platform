import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

const sampleTeams = [
  {
    name: 'Telemetry South',
    charge: 'Jordan Reyes',
    coverage: '8 RNs · 2 LPNs · 3 PCAs',
    focus: 'Admissions ramp + diuresis bundle',
    readiness: 'On shift',
  },
  {
    name: 'Rapid Response Pool',
    charge: 'Casey Wong',
    coverage: '4 RNs · 1 RT',
    focus: 'Falls bundle + respiratory escalations',
    readiness: 'Floating',
  },
  {
    name: 'Clinical Education',
    charge: 'Dr. Angie Lam',
    coverage: '2 educators',
    focus: 'Night simulation cycle',
    readiness: 'Available 14:00',
  },
];

const TeamsScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Care teams</Text>
      <Text style={styles.title}>Roster + competency map</Text>
      <Text style={styles.subtitle}>
        Manage staffing pods, cross-training, and competencies across the unit. Each team mirrors the
        "Boats" tab from yacht racing—quick glance at readiness, roles, and focus areas.
      </Text>

      {sampleTeams.map((team) => (
        <View key={team.name} style={styles.teamCard}>
          <View style={styles.teamHeader}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.readiness}>{team.readiness}</Text>
          </View>
          <Text style={styles.meta}>Charge: {team.charge}</Text>
          <Text style={styles.meta}>{team.coverage}</Text>
          <View style={styles.focusPill}>
            <Text style={styles.focusText}>{team.focus}</Text>
          </View>
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Competency matrix</Text>
        <Text style={styles.sectionCopy}>
          Coming soon: configurable skills boards, badge tracking, and API hooks for LMS ingestion.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#6366F1',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
  },
  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  readiness: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16A34A',
  },
  meta: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  focusPill: {
    backgroundColor: '#EEF2FF',
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  focusText: {
    color: '#4338CA',
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1E3A8A',
  },
  sectionTitle: {
    color: '#BFDBFE',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionCopy: {
    color: '#E2E8F0',
    fontSize: 14,
  },
});

export default TeamsScreen;
