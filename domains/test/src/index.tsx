import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { z } from 'zod';
import {
  createDomain,
  createActivityType,
  createMetric,
  createAgent,
  DomainDashboardProps,
} from '@betterat/domain-sdk';
import { Button } from '@betterat/ui';
import {
  EventOverviewDashboard,
  type QuickAction,
  type HighlightEvent,
  type UpcomingEvent,
} from '@betterat/ui';

// ============================================================================
// Test Dashboard Component
// ============================================================================

const TestDashboard: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  const actions: QuickAction[] = [
    { id: 'seed-data', label: 'Seed data', icon: '🧪', onPress: () => services.analytics.trackEvent('seed_data', { userId }) },
    { id: 'open-log', label: 'Open logger', icon: '📝', onPress: () => services.analytics.trackEvent('open_logger', { userId }) },
  ];

  const highlight: HighlightEvent = {
    name: 'Sample readiness run',
    dateRange: 'Now',
    venue: 'Local sandbox',
    info: 'Use this to validate layout propagation',
    checklist: [
      { label: 'Dashboard renders', state: 'complete' },
      { label: 'Actions tracked', state: 'warning' },
      { label: 'Routes registered', state: 'pending' },
    ],
    actions: [{ label: 'Trigger action', onPress: () => services.analytics.trackEvent('test_action', { userId }) }],
  };

  const upcoming: UpcomingEvent[] = [
    { id: '1', name: 'Domain smoke test', date: 'Daily at 09:00', venue: 'CI pipeline', badge: 'Automation' },
  ];

  return (
    <EventOverviewDashboard
      hero={{
        title: 'Test Domain Loaded!',
        subtitle: 'Validates the shared EventOverview layout',
        primaryCtaLabel: 'Run Test Action',
        onPrimaryCta: () => services.analytics.trackEvent('test_button_pressed', { userId }),
      }}
      quickActions={actions}
      highlightEvent={highlight}
      upcomingEvents={upcoming}
      emptyState={undefined}
      fabLabel="+"
      onFabPress={() => services.analytics.trackEvent('fab_pressed', { userId })}
    >
      <View style={styles.infoCard}>
        <Text style={styles.subtitle}>SDK diagnostics</Text>
        <Text style={styles.infoText}>🧪 Domain ID: test</Text>
        <Text style={styles.infoText}>👤 User ID: {userId}</Text>
        <Text style={styles.infoText}>✨ SDK Version: 1.0.0</Text>
        <Button title="Trigger analytics" onPress={() => services.analytics.trackEvent('test_button_pressed', { userId })} />
      </View>
    </EventOverviewDashboard>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
});

// ============================================================================
// Activity Type Definitions
// ============================================================================

const testActivity = createActivityType({
  id: 'test-activity',
  name: 'Test Activity',
  description: 'Simple activity for testing',
  icon: '📝',
  metadataSchema: z.object({
    notes: z.string().min(1, 'Notes are required'),
  }),
  displayComponent: ({ activity }) => (
    <View style={{ padding: 16 }}>
      <Text>Test Activity</Text>
      <Text>{activity.metadata.notes}</Text>
    </View>
  ),
  loggerComponent: ({ onSave }) => {
    const [notes, setNotes] = React.useState('');

    return (
      <View style={{ padding: 16 }}>
        <Text>Log Test Activity</Text>
        <Button
          title="Save"
          onPress={() => onSave({ notes: 'Test note' })}
        />
      </View>
    );
  },
});

// ============================================================================
// Metric Definitions
// ============================================================================

const activityCountMetric = createMetric({
  id: 'activity-count',
  name: 'Activity Count',
  description: 'Total number of activities logged',
  calculator: (activities) => activities.length,
  formatter: (value) => `${value} activities`,
  chartConfig: {
    type: 'bar',
    color: '#10B981',
  },
});

// ============================================================================
// AI Agent Definitions
// ============================================================================

const testCoach = createAgent({
  id: 'test-coach',
  name: 'Test Coach',
  description: 'Helpful coach for testing',
  systemPrompt: `You are a helpful test coach for the BetterAt platform.
Your role is to guide users through testing the platform features and provide
encouragement. Keep responses brief and positive.`,
  tools: [],
  model: 'gpt-4',
});

const testAnalyst = createAgent({
  id: 'test-analyst',
  name: 'Test Analyst',
  description: 'Analyzes test data',
  systemPrompt: `You are a test data analyst for the BetterAt platform.
Your role is to analyze test activities and provide insights. Be concise and
focus on the data patterns.`,
  tools: [],
  model: 'gpt-4',
});

// ============================================================================
// Domain Export
// ============================================================================

export default createDomain({
  meta: {
    id: 'test',
    name: 'Test Domain',
    description: 'Validates platform architecture',
    icon: '🧪',
    primaryColor: '#10B981',
    version: '1.0.0',
    minPlatformVersion: '1.0.0',
  },
  activityTypes: [testActivity],
  metrics: [activityCountMetric],
  agents: [testCoach, testAnalyst],
  routes: [
    {
      path: '/dashboard',
      component: TestDashboard,
      name: 'Dashboard',
      tabLabel: 'Dashboard',
      tabIcon: '📊',
    },
  ],
  components: {
    Dashboard: TestDashboard,
  },
});
