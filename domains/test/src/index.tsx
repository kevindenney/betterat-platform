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

// ============================================================================
// Test Dashboard Component
// ============================================================================

const TestDashboard: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  const handleButtonPress = () => {
    console.log('Button pressed!');
    console.log('User ID:', userId);
    services.analytics.trackEvent('test_button_pressed', { userId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ Test Domain Loaded!</Text>
      <Text style={styles.subtitle}>Test Domain v1.0.0</Text>
      <Text style={styles.description}>
        Platform architecture validation successful
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Test Button"
          onPress={handleButtonPress}
          variant="primary"
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>🧪 Domain ID: test</Text>
        <Text style={styles.infoText}>👤 User ID: {userId}</Text>
        <Text style={styles.infoText}>✨ SDK Version: 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
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
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 32,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
