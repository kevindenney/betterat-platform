import React from 'react';
import { View, Text } from 'react-native';
import { z } from 'zod';
import {
  createDomain,
  createActivityType,
  createMetric,
  createAgent,
} from '@betterat/domain-sdk';
import { Button } from '@betterat/ui';
import { RacesScreen } from './screens/RacesScreen';
import { CoursesScreen } from './screens/CoursesScreen';
import { BoatScreen } from './screens/BoatScreen';
import { VenueScreen } from './screens/VenueScreen';
import { MoreScreen } from './screens/MoreScreen';

// ============================================================================
// Activity Type Definitions
// ============================================================================

// Race Activity Type
const raceActivity = createActivityType({
  id: 'race',
  name: 'Race',
  description: 'Competitive sailing race',
  icon: '🏁',
  metadataSchema: z.object({
    raceName: z.string().min(1, 'Race name is required'),
    date: z.string(),
    duration: z.number().positive('Duration must be positive'),
    distance: z.number().positive().optional(),
    position: z.number().int().positive().optional(),
    totalCompetitors: z.number().int().positive().optional(),
    boatClass: z.string().optional(),
    courseType: z.enum(['windward-leeward', 'triangle', 'coastal', 'offshore']).optional(),
    windSpeed: z.number().positive().optional(),
    windDirection: z.string().optional(),
    averageSpeed: z.number().positive().optional(),
    maxSpeed: z.number().positive().optional(),
    notes: z.string().optional(),
  }),
  displayComponent: ({ activity }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        🏁 {activity.metadata.raceName}
      </Text>
      <Text>Date: {activity.metadata.date}</Text>
      <Text>Duration: {activity.metadata.duration} hours</Text>
      {activity.metadata.position && activity.metadata.totalCompetitors && (
        <Text>
          Position: {activity.metadata.position} / {activity.metadata.totalCompetitors}
        </Text>
      )}
      {activity.metadata.averageSpeed && (
        <Text>Average Speed: {activity.metadata.averageSpeed} knots</Text>
      )}
      {activity.metadata.notes && <Text>Notes: {activity.metadata.notes}</Text>}
    </View>
  ),
  loggerComponent: ({ onSave }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Log Race</Text>
      <Button
        title="Save Race"
        onPress={() => onSave({
          raceName: 'Sample Race',
          date: new Date().toISOString(),
          duration: 2.5,
        })}
      />
    </View>
  ),
  defaultMetadata: {
    courseType: 'windward-leeward',
  },
});

// Training Session Activity Type
const trainingActivity = createActivityType({
  id: 'training-session',
  name: 'Training Session',
  description: 'Practice sailing session',
  icon: '🎯',
  metadataSchema: z.object({
    date: z.string(),
    duration: z.number().positive('Duration must be positive'),
    focusAreas: z.array(z.string()).optional(),
    conditions: z.enum(['light-wind', 'medium-wind', 'heavy-wind', 'varied']).optional(),
    drillsCompleted: z.array(z.string()).optional(),
    distance: z.number().positive().optional(),
    averageSpeed: z.number().positive().optional(),
    crewSize: z.number().int().positive().optional(),
    notes: z.string().optional(),
  }),
  displayComponent: ({ activity }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>🎯 Training Session</Text>
      <Text>Date: {activity.metadata.date}</Text>
      <Text>Duration: {activity.metadata.duration} hours</Text>
      {activity.metadata.focusAreas && activity.metadata.focusAreas.length > 0 && (
        <Text>Focus: {activity.metadata.focusAreas.join(', ')}</Text>
      )}
      {activity.metadata.conditions && (
        <Text>Conditions: {activity.metadata.conditions}</Text>
      )}
    </View>
  ),
  loggerComponent: ({ onSave }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Log Training Session</Text>
      <Button
        title="Save Training"
        onPress={() => onSave({
          date: new Date().toISOString(),
          duration: 1.5,
          focusAreas: ['tacking', 'starts'],
        })}
      />
    </View>
  ),
});

// Regatta Activity Type
const regattaActivity = createActivityType({
  id: 'regatta',
  name: 'Regatta',
  description: 'Multi-race sailing event',
  icon: '🏆',
  metadataSchema: z.object({
    name: z.string().min(1, 'Regatta name is required'),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string(),
    numberOfRaces: z.number().int().positive(),
    overallPosition: z.number().int().positive().optional(),
    totalCompetitors: z.number().int().positive().optional(),
    boatClass: z.string().optional(),
    raceIds: z.array(z.string()).optional(),
    highlights: z.string().optional(),
  }),
  displayComponent: ({ activity }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        🏆 {activity.metadata.name}
      </Text>
      <Text>Location: {activity.metadata.location}</Text>
      <Text>Races: {activity.metadata.numberOfRaces}</Text>
      {activity.metadata.overallPosition && (
        <Text>Overall Position: {activity.metadata.overallPosition}</Text>
      )}
    </View>
  ),
  loggerComponent: ({ onSave }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Log Regatta</Text>
      <Button
        title="Save Regatta"
        onPress={() => onSave({
          name: 'Sample Regatta',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          location: 'Harbor Bay',
          numberOfRaces: 5,
        })}
      />
    </View>
  ),
});

// Boat Maintenance Activity Type
const maintenanceActivity = createActivityType({
  id: 'boat-maintenance',
  name: 'Boat Maintenance',
  description: 'Maintenance and repair work',
  icon: '🔧',
  metadataSchema: z.object({
    date: z.string(),
    duration: z.number().positive(),
    maintenanceType: z.enum(['routine', 'repair', 'upgrade', 'inspection']),
    components: z.array(z.string()),
    cost: z.number().nonnegative().optional(),
    notes: z.string().optional(),
  }),
  displayComponent: ({ activity }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>🔧 Maintenance</Text>
      <Text>Type: {activity.metadata.maintenanceType}</Text>
      <Text>Components: {activity.metadata.components.join(', ')}</Text>
      <Text>Duration: {activity.metadata.duration} hours</Text>
    </View>
  ),
  loggerComponent: ({ onSave }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Log Maintenance</Text>
      <Button
        title="Save Maintenance"
        onPress={() => onSave({
          date: new Date().toISOString(),
          duration: 2,
          maintenanceType: 'routine',
          components: ['sails', 'rigging'],
        })}
      />
    </View>
  ),
});

// Weather Study Activity Type
const weatherActivity = createActivityType({
  id: 'weather-study',
  name: 'Weather Study',
  description: 'Weather analysis and planning',
  icon: '🌤️',
  metadataSchema: z.object({
    date: z.string(),
    duration: z.number().positive(),
    studyType: z.enum(['forecast-analysis', 'historical-review', 'pattern-study']),
    conditions: z.string(),
    insights: z.string().optional(),
    references: z.array(z.string()).optional(),
  }),
  displayComponent: ({ activity }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>🌤️ Weather Study</Text>
      <Text>Type: {activity.metadata.studyType}</Text>
      <Text>Conditions: {activity.metadata.conditions}</Text>
      <Text>Duration: {activity.metadata.duration} hours</Text>
    </View>
  ),
  loggerComponent: ({ onSave }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Log Weather Study</Text>
      <Button
        title="Save Study"
        onPress={() => onSave({
          date: new Date().toISOString(),
          duration: 0.5,
          studyType: 'forecast-analysis',
          conditions: 'Light winds, sea breeze expected',
        })}
      />
    </View>
  ),
});

// Navigation Planning Activity Type
const navigationActivity = createActivityType({
  id: 'navigation-planning',
  name: 'Navigation Planning',
  description: 'Course and strategy planning',
  icon: '🧭',
  metadataSchema: z.object({
    date: z.string(),
    duration: z.number().positive(),
    raceOrEvent: z.string(),
    strategyType: z.enum(['course-planning', 'tidal-analysis', 'wind-strategy', 'mark-rounding']),
    notes: z.string().optional(),
    diagrams: z.array(z.string()).optional(),
  }),
  displayComponent: ({ activity }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>🧭 Navigation Planning</Text>
      <Text>Event: {activity.metadata.raceOrEvent}</Text>
      <Text>Strategy: {activity.metadata.strategyType}</Text>
      <Text>Duration: {activity.metadata.duration} hours</Text>
    </View>
  ),
  loggerComponent: ({ onSave }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Log Navigation Planning</Text>
      <Button
        title="Save Planning"
        onPress={() => onSave({
          date: new Date().toISOString(),
          duration: 1,
          raceOrEvent: 'Weekend Race',
          strategyType: 'wind-strategy',
        })}
      />
    </View>
  ),
});

// Crew Practice Activity Type
const crewActivity = createActivityType({
  id: 'crew-practice',
  name: 'Crew Practice',
  description: 'Team coordination and drills',
  icon: '👥',
  metadataSchema: z.object({
    date: z.string(),
    duration: z.number().positive(),
    crewMembers: z.array(z.string()),
    drills: z.array(z.string()),
    focus: z.string(),
    performance: z.enum(['excellent', 'good', 'fair', 'needs-work']).optional(),
    notes: z.string().optional(),
  }),
  displayComponent: ({ activity }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>👥 Crew Practice</Text>
      <Text>Crew: {activity.metadata.crewMembers.join(', ')}</Text>
      <Text>Focus: {activity.metadata.focus}</Text>
      <Text>Duration: {activity.metadata.duration} hours</Text>
    </View>
  ),
  loggerComponent: ({ onSave }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Log Crew Practice</Text>
      <Button
        title="Save Practice"
        onPress={() => onSave({
          date: new Date().toISOString(),
          duration: 2,
          crewMembers: ['Skipper', 'Trimmer', 'Bow'],
          drills: ['tack-drill', 'spinnaker-hoist'],
          focus: 'Quick tacks',
        })}
      />
    </View>
  ),
});

// Equipment Check Activity Type
const equipmentActivity = createActivityType({
  id: 'equipment-check',
  name: 'Equipment Check',
  description: 'Pre-race equipment inspection',
  icon: '✅',
  metadataSchema: z.object({
    date: z.string(),
    duration: z.number().positive(),
    checklistItems: z.array(z.string()),
    issuesFound: z.array(z.string()).optional(),
    resolved: z.boolean(),
    notes: z.string().optional(),
  }),
  displayComponent: ({ activity }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✅ Equipment Check</Text>
      <Text>Items: {activity.metadata.checklistItems.length}</Text>
      <Text>Resolved: {activity.metadata.resolved ? 'Yes' : 'No'}</Text>
      {activity.metadata.issuesFound && activity.metadata.issuesFound.length > 0 && (
        <Text>Issues: {activity.metadata.issuesFound.join(', ')}</Text>
      )}
    </View>
  ),
  loggerComponent: ({ onSave }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Log Equipment Check</Text>
      <Button
        title="Save Check"
        onPress={() => onSave({
          date: new Date().toISOString(),
          duration: 0.5,
          checklistItems: ['Sails', 'Rigging', 'Safety Equipment'],
          resolved: true,
        })}
      />
    </View>
  ),
});

// ============================================================================
// Metric Definitions
// ============================================================================

const totalRacesMetric = createMetric({
  id: 'total-races',
  name: 'Total Races',
  description: 'Total number of races completed',
  calculator: (activities) => {
    return activities.filter(a => a.activityTypeId === 'race').length;
  },
  formatter: (value) => `${value} races`,
  chartConfig: {
    type: 'line',
    color: '#0369A1',
  },
});

const raceWinsMetric = createMetric({
  id: 'race-wins',
  name: 'Race Wins',
  description: 'Number of races won (1st place)',
  calculator: (activities) => {
    return activities.filter(
      a => a.activityTypeId === 'race' && a.metadata.position === 1
    ).length;
  },
  formatter: (value) => `${value} wins`,
  chartConfig: {
    type: 'bar',
    color: '#10B981',
  },
});

const winRateMetric = createMetric({
  id: 'win-rate',
  name: 'Win Rate',
  description: 'Percentage of races won',
  calculator: (activities) => {
    const races = activities.filter(a => a.activityTypeId === 'race');
    if (races.length === 0) return null;

    const wins = races.filter(a => a.metadata.position === 1).length;
    return (wins / races.length) * 100;
  },
  formatter: (value) => `${value.toFixed(1)}%`,
  chartConfig: {
    type: 'line',
    color: '#F59E0B',
  },
});

const trainingHoursMetric = createMetric({
  id: 'training-hours',
  name: 'Training Hours',
  description: 'Total hours spent training',
  unit: 'hours',
  calculator: (activities) => {
    const trainingSessions = activities.filter(
      a => a.activityTypeId === 'training-session'
    );
    return trainingSessions.reduce((sum, a) => sum + (a.metadata.duration || 0), 0);
  },
  formatter: (value) => `${value.toFixed(1)}h`,
  chartConfig: {
    type: 'area',
    color: '#8B5CF6',
  },
});

const averageSpeedMetric = createMetric({
  id: 'average-speed',
  name: 'Average Speed',
  description: 'Average sailing speed across all races',
  unit: 'knots',
  calculator: (activities) => {
    const racesWithSpeed = activities.filter(
      a => a.activityTypeId === 'race' && a.metadata.averageSpeed
    );
    if (racesWithSpeed.length === 0) return null;

    const totalSpeed = racesWithSpeed.reduce(
      (sum, a) => sum + a.metadata.averageSpeed,
      0
    );
    return totalSpeed / racesWithSpeed.length;
  },
  formatter: (value) => `${value.toFixed(1)} knots`,
  chartConfig: {
    type: 'line',
    color: '#06B6D4',
  },
});

const distanceSailedMetric = createMetric({
  id: 'distance-sailed',
  name: 'Distance Sailed',
  description: 'Total distance sailed',
  unit: 'nautical miles',
  calculator: (activities) => {
    const activitiesWithDistance = activities.filter(
      a => (a.activityTypeId === 'race' || a.activityTypeId === 'training-session')
         && a.metadata.distance
    );
    return activitiesWithDistance.reduce(
      (sum, a) => sum + (a.metadata.distance || 0),
      0
    );
  },
  formatter: (value) => `${value.toFixed(1)} nm`,
  chartConfig: {
    type: 'area',
    color: '#3B82F6',
  },
});

const regattasParticipatedMetric = createMetric({
  id: 'regattas-participated',
  name: 'Regattas Participated',
  description: 'Number of regattas entered',
  calculator: (activities) => {
    return activities.filter(a => a.activityTypeId === 'regatta').length;
  },
  formatter: (value) => `${value} regattas`,
  chartConfig: {
    type: 'bar',
    color: '#EF4444',
  },
});

const podiumFinishesMetric = createMetric({
  id: 'podium-finishes',
  name: 'Podium Finishes',
  description: 'Number of top-3 finishes',
  calculator: (activities) => {
    return activities.filter(
      a => a.activityTypeId === 'race'
         && a.metadata.position
         && a.metadata.position <= 3
    ).length;
  },
  formatter: (value) => `${value} podiums`,
  chartConfig: {
    type: 'bar',
    color: '#F59E0B',
  },
});

// ============================================================================
// AI Agent Definitions
// ============================================================================

const racingCoach = createAgent({
  id: 'racing-coach',
  name: 'Racing Coach',
  description: 'Expert sailing coach for race strategy and technique',
  systemPrompt: `You are an experienced yacht racing coach with decades of competitive sailing experience.
Your role is to help sailors improve their racing performance through strategic advice, technical guidance,
and mental preparation. You specialize in:
- Race tactics and strategy
- Boat handling and speed optimization
- Weather and wind pattern analysis
- Start line tactics
- Mark rounding techniques
- Crew coordination

Provide clear, actionable advice tailored to the sailor's experience level and racing goals.`,
  tools: [],
  model: 'gpt-4',
});

const weatherAdvisor = createAgent({
  id: 'weather-advisor',
  name: 'Weather Advisor',
  description: 'Meteorology expert for sailing conditions',
  systemPrompt: `You are a sailing meteorologist specializing in weather analysis for yacht racing.
Your expertise includes:
- Wind forecasting and pattern prediction
- Tidal and current analysis
- Sea state assessment
- Microclimate understanding
- Weather routing strategies

Help sailors understand and leverage weather conditions for optimal race performance.
Explain complex meteorological concepts in sailor-friendly terms.`,
  tools: [],
  model: 'gpt-4',
});

const performanceAnalyst = createAgent({
  id: 'performance-analyst',
  name: 'Performance Analyst',
  description: 'Data-driven sailing performance analysis',
  systemPrompt: `You are a yacht racing performance analyst specializing in data analysis and insights.
Your role is to analyze race results, training data, and performance metrics to identify:
- Performance trends and patterns
- Areas for improvement
- Competitive positioning
- Training effectiveness
- Equipment optimization opportunities

Provide data-driven insights with clear recommendations for improvement.`,
  tools: [],
  model: 'gpt-4',
});

// ============================================================================
// Domain Export
// ============================================================================

export default createDomain({
  meta: {
    id: 'sailracing',
    name: 'Sail Racing',
    description: 'Track and improve your competitive sailing performance',
    icon: '⛵',
    primaryColor: '#0369A1',
    version: '1.0.0',
    minPlatformVersion: '1.0.0',
  },
  activityTypes: [
    raceActivity,
    trainingActivity,
    regattaActivity,
    maintenanceActivity,
    weatherActivity,
    navigationActivity,
    crewActivity,
    equipmentActivity,
  ],
  metrics: [
    totalRacesMetric,
    raceWinsMetric,
    winRateMetric,
    trainingHoursMetric,
    averageSpeedMetric,
    distanceSailedMetric,
    regattasParticipatedMetric,
    podiumFinishesMetric,
  ],
  agents: [
    racingCoach,
    weatherAdvisor,
    performanceAnalyst,
  ],
  routes: [
    {
      path: '/races',
      component: RacesScreen,
      name: 'Races',
      tabLabel: 'Races',
      tabIcon: '🏁',
    },
    {
      path: '/courses',
      component: CoursesScreen,
      name: 'Courses',
      tabLabel: 'Courses',
      tabIcon: '🗺️',
    },
    {
      path: '/boat',
      component: BoatScreen,
      name: 'Boat',
      tabLabel: 'Boat',
      tabIcon: '⛵',
    },
    {
      path: '/venue',
      component: VenueScreen,
      name: 'Venue',
      tabLabel: 'Venue',
      tabIcon: '🌍',
    },
    {
      path: '/more',
      component: MoreScreen,
      name: 'More',
      tabLabel: 'More',
      tabIcon: '☰',
    },
  ],
  components: {
    Dashboard: RacesScreen,
  },
});
