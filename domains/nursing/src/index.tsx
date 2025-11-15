import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { z } from 'zod';
import {
  createDomain,
  createActivityType,
  createMetric,
} from '@betterat/domain-sdk';
import { Button } from '@betterat/ui';
import Dashboard from './screens/Dashboard';
import Operations from './screens/Operations';
import Discovery from './screens/Discovery';

const clinicalSimulation = createActivityType({
  id: 'clinical-simulation',
  name: 'Clinical Simulation',
  description: 'Structured simulation covering critical skills',
  icon: '🩺',
  metadataSchema: z.object({
    skill: z.string(),
    durationMinutes: z.number().min(15),
    confidenceDelta: z.number().int(),
    reflection: z.string().optional(),
  }),
  displayComponent: ({ activity }) => (
    <View style={styles.activityCard}>
      <Text style={styles.activityTitle}>{activity.metadata.skill}</Text>
      <Text style={styles.activityMeta}>{activity.metadata.durationMinutes} min</Text>
      {activity.metadata.reflection ? (
        <Text style={styles.activityReflection}>{activity.metadata.reflection}</Text>
      ) : null}
    </View>
  ),
  loggerComponent: ({ onSave }) => (
    <View style={styles.loggerContainer}>
      <Text style={styles.loggerTitle}>Simulation logged</Text>
      <Button
        title="Save sample"
        variant="secondary"
        onPress={() =>
          onSave({
            skill: 'Airway management',
            durationMinutes: 60,
            confidenceDelta: 2,
            reflection: 'Able to troubleshoot equipment faster.',
          })
        }
      />
    </View>
  ),
});

const practiceHoursMetric = createMetric({
  id: 'practice-hours-week',
  name: 'Practice Hours (7d)',
  description: 'Rolling practice minutes converted to hours',
  calculator: (activities) => {
    const minutes = activities.reduce((total, activity) => {
      const duration = activity.metadata?.durationMinutes ?? 0;
      return total + (typeof duration === 'number' ? duration : 0);
    }, 0);
    return Math.round((minutes / 60) * 10) / 10;
  },
  formatter: (value) => `${value} hrs`,
  chartConfig: { type: 'line', color: '#DB2777' },
});

const nursingDefinition: any = {
  meta: {
    id: 'nursing',
    name: 'BetterAt Nursing',
    description: 'Clinical skills, simulation tracking, and team-based learning',
    icon: '🩺',
    primaryColor: '#DB2777',
    version: '0.1.0',
    minPlatformVersion: '1.0.0',
  },
  components: {
    Dashboard,
    Operations,
    Discovery,
  },
  routes: [
    {
      path: '/dashboard',
      component: Dashboard,
      name: 'Dashboard',
      tabLabel: 'Dashboard',
      tabIcon: '🩺',
    },
    {
      path: '/operations',
      component: Operations,
      name: 'Shift Ops',
      tabLabel: 'Ops',
      tabIcon: '📅',
    },
    {
      path: '/discovery',
      component: Discovery,
      name: 'Discovery',
      tabLabel: 'Discovery',
      tabIcon: '🗺️',
    },
  ],
  activityTypes: [clinicalSimulation],
  metrics: [practiceHoursMetric],
};

export default createDomain(nursingDefinition);

const styles = StyleSheet.create({
  activityCard: {
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  activityMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  activityReflection: {
    marginTop: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  loggerContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  loggerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
});
