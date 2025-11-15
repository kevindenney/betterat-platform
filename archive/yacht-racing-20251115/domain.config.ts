// @ts-nocheck
/**
 * Yacht Racing Domain Configuration
 *
 * This file registers the yacht-racing domain with the BetterAt platform.
 * It defines all activities, metrics, agents, skills, routes, and permissions
 * that make up the complete yacht racing training and performance system.
 *
 * @module domain.config
 * @version 1.0.0
 */

import { DomainConfig } from '@betterat/domain-sdk';
import { z } from 'zod';
import { YACHT_RACING_SKILLS } from './skills/registry';

// ============================================================================
// ACTIVITY SCHEMAS
// ============================================================================

/**
 * Race Event Schema
 * Represents a single race with GPS tracking, timer, and analysis
 */
const raceEventSchema = z.object({
  eventName: z.string().min(1).describe('Name of the race event'),
  venueId: z.string().uuid().describe('Venue where race takes place'),
  startTime: z.string().datetime().describe('Race start time'),
  boatClassId: z.string().uuid().describe('Boat class competing'),
  courseType: z.enum(['windward-leeward', 'triangle', 'trapezoid', 'olympic', 'custom']).describe('Type of race course'),
  marks: z.array(z.object({
    name: z.string(),
    lat: z.number(),
    lng: z.number(),
    order: z.number(),
  })).optional().describe('Course marks with GPS coordinates'),
  windSpeed: z.number().optional().describe('Wind speed in knots'),
  windDirection: z.number().min(0).max(360).optional().describe('Wind direction in degrees'),
  currentSpeed: z.number().optional().describe('Current speed in knots'),
  currentDirection: z.number().min(0).max(360).optional().describe('Current direction in degrees'),
  timerSessionId: z.string().uuid().optional().describe('Associated race timer session'),
  placement: z.number().int().optional().describe('Finishing position'),
  totalBoats: z.number().int().optional().describe('Total boats in race'),
});

/**
 * Regatta Schema
 * Represents a multi-race series event
 */
const regattaSchema = z.object({
  name: z.string().min(1).describe('Regatta name'),
  startDate: z.string().datetime().describe('First race date'),
  endDate: z.string().datetime().describe('Last race date'),
  venueId: z.string().uuid().describe('Venue hosting regatta'),
  races: z.array(z.string().uuid()).describe('Array of race event IDs'),
  boatClasses: z.array(z.string()).optional().describe('Boat classes competing'),
  organizingAuthority: z.string().optional().describe('Club or organization running event'),
  raceCount: z.number().int().optional().describe('Total number of races'),
  participantCount: z.number().int().optional().describe('Number of participants'),
  overallPlacement: z.number().int().optional().describe('Overall series placement'),
});

/**
 * Training Session Schema
 * Represents a practice session focused on skill development
 */
const trainingSessionSchema = z.object({
  focus: z.enum([
    'boat-handling',
    'starts',
    'upwind-tactics',
    'downwind-tactics',
    'mark-rounding',
    'speed-work',
    'general',
  ]).describe('Primary focus area'),
  duration: z.number().int().describe('Session duration in minutes'),
  drills: z.array(z.object({
    name: z.string(),
    duration: z.number(),
    notes: z.string().optional(),
  })).describe('Drills completed during session'),
  venueId: z.string().uuid().optional().describe('Training venue'),
  boatClass: z.string().optional().describe('Boat class used'),
  windSpeed: z.number().optional().describe('Wind speed during session'),
  windDirection: z.number().optional().describe('Wind direction during session'),
  timerSessionId: z.string().uuid().optional().describe('GPS tracking session'),
});

// ============================================================================
// DOMAIN CONFIGURATION
// ============================================================================

const yachtRacingDomain: DomainConfig = {
  // --------------------------------------------------------------------------
  // BASIC INFORMATION
  // --------------------------------------------------------------------------
  id: 'yacht-racing',
  name: 'Yacht Racing',
  description: 'Sailing race management, performance analysis, and AI coaching for competitive sailors',
  icon: '⛵',
  color: '#0066CC',
  version: '1.0.0',

  // --------------------------------------------------------------------------
  // ACTIVITY TYPES
  // Define the types of activities sailors can log and track
  // --------------------------------------------------------------------------
  activities: [
    {
      id: 'race-event',
      name: 'Race Event',
      description: 'Individual race with GPS tracking, timer, and post-race AI analysis',
      icon: '🏁',
      schema: raceEventSchema,
      defaultDuration: 3600, // 1 hour
      requiresLocation: true,
      supportsGPS: true,
      supportsTimer: true,
      color: '#FF6B35',
    },
    {
      id: 'regatta',
      name: 'Regatta',
      description: 'Multi-race series event spanning multiple days',
      icon: '🏆',
      schema: regattaSchema,
      defaultDuration: 259200, // 3 days
      requiresLocation: true,
      supportsGPS: false,
      supportsTimer: false,
      color: '#FFD23F',
    },
    {
      id: 'training-session',
      name: 'Training Session',
      description: 'Practice session for developing specific sailing skills',
      icon: '🎯',
      schema: trainingSessionSchema,
      defaultDuration: 7200, // 2 hours
      requiresLocation: true,
      supportsGPS: true,
      supportsTimer: true,
      color: '#4ECDC4',
    },
  ],

  // --------------------------------------------------------------------------
  // METRICS
  // These metrics are derived from the ai_coach_analysis table and GPS data
  // They power the dashboard, charts, and progress tracking
  // --------------------------------------------------------------------------
  metrics: [
    // Core Performance Metrics
    {
      id: 'overall-performance-score',
      name: 'Overall Performance Score',
      description: 'Composite score based on race results, GPS analysis, and tactical execution',
      category: 'performance',
      unit: 'score',
      min: 0,
      max: 100,
      visualization: 'gauge',
      color: '#0066CC',
      formula: 'Weighted average of placement, start quality, tactical decisions, and boat handling',
    },
    {
      id: 'start-performance-score',
      name: 'Start Performance Score',
      description: 'Quality of race starts: timing, positioning, line bias recognition, and acceleration',
      category: 'tactical',
      unit: 'score',
      min: 0,
      max: 100,
      visualization: 'line',
      color: '#4CAF50',
      formula: 'Analyzed from GPS data: distance to line at gun, boat speed at start, position relative to fleet',
    },
    {
      id: 'tactical-decision-quality',
      name: 'Tactical Decision Quality',
      description: 'Quality of tactical decisions: tack/gybe timing, wind shift response, positioning',
      category: 'tactical',
      unit: 'score',
      min: 0,
      max: 100,
      visualization: 'bar',
      color: '#FF9800',
      formula: 'AI analysis of decision points: layline approach, shift response, passing lanes, mark approach',
    },
    {
      id: 'speed-consistency-score',
      name: 'Speed Consistency Score',
      description: 'Consistency of boat speed throughout race in similar conditions',
      category: 'performance',
      unit: 'score',
      min: 0,
      max: 100,
      visualization: 'line',
      color: '#2196F3',
      formula: 'Standard deviation of boat speed on similar points of sail in similar wind conditions',
    },
    {
      id: 'upwind-performance-score',
      name: 'Upwind Performance Score',
      description: 'Performance on upwind legs: VMG, tacking efficiency, wind shift response',
      category: 'performance',
      unit: 'score',
      min: 0,
      max: 100,
      visualization: 'line',
      color: '#9C27B0',
      formula: 'VMG upwind compared to boat polar, tacking angles, gains/losses on shifts',
    },
    {
      id: 'downwind-performance-score',
      name: 'Downwind Performance Score',
      description: 'Performance on downwind legs: VMG, gybing efficiency, pressure seeking',
      category: 'performance',
      unit: 'score',
      min: 0,
      max: 100,
      visualization: 'line',
      color: '#FF5722',
      formula: 'VMG downwind compared to boat polar, gybing angles, distance sailed relative to rhumb line',
    },
    {
      id: 'mark-rounding-quality',
      name: 'Mark Rounding Quality',
      description: 'Execution quality at mark roundings: approach, turn radius, exit speed',
      category: 'execution',
      unit: 'score',
      min: 0,
      max: 100,
      visualization: 'bar',
      color: '#E91E63',
      formula: 'GPS analysis of approach angle, turn radius, speed loss, and exit acceleration',
    },
    {
      id: 'race-strategy-effectiveness',
      name: 'Race Strategy Effectiveness',
      description: 'Overall effectiveness of pre-race strategy execution',
      category: 'tactical',
      unit: 'score',
      min: 0,
      max: 100,
      visualization: 'line',
      color: '#00BCD4',
      formula: 'Comparison of planned strategy vs. executed tactics and outcome',
    },
    {
      id: 'boat-handling-score',
      name: 'Boat Handling Score',
      description: 'Quality of boat handling, maneuvers, and crew coordination',
      category: 'execution',
      unit: 'score',
      min: 0,
      max: 100,
      visualization: 'bar',
      color: '#009688',
      formula: 'Smoothness of maneuvers, speed loss during tacks/gybes, trim efficiency',
    },
    {
      id: 'weather-adaptation-score',
      name: 'Weather Adaptation Score',
      description: 'Ability to adapt tactics to changing weather conditions',
      category: 'tactical',
      unit: 'score',
      min: 0,
      max: 100,
      visualization: 'line',
      color: '#607D8B',
      formula: 'Response time to wind shifts, pressure changes, current variations',
    },

    // Volume Metrics
    {
      id: 'races-completed',
      name: 'Races Completed',
      description: 'Total number of races sailed',
      category: 'volume',
      unit: 'count',
      min: 0,
      max: null,
      visualization: 'bar',
      color: '#795548',
    },
    {
      id: 'training-hours',
      name: 'Training Hours',
      description: 'Total hours spent in focused training sessions',
      category: 'volume',
      unit: 'hours',
      min: 0,
      max: null,
      visualization: 'area',
      color: '#3F51B5',
    },
    {
      id: 'regattas-entered',
      name: 'Regattas Entered',
      description: 'Number of multi-race series events competed in',
      category: 'volume',
      unit: 'count',
      min: 0,
      max: null,
      visualization: 'bar',
      color: '#FF6B35',
    },

    // Results Metrics
    {
      id: 'average-finish-position',
      name: 'Average Finish Position',
      description: 'Average finishing position across all races',
      category: 'results',
      unit: 'position',
      min: 1,
      max: null,
      visualization: 'line',
      color: '#F44336',
    },
    {
      id: 'podium-finishes',
      name: 'Podium Finishes',
      description: 'Number of top-3 finishes',
      category: 'results',
      unit: 'count',
      min: 0,
      max: null,
      visualization: 'bar',
      color: '#FFD700',
    },
    {
      id: 'win-rate',
      name: 'Win Rate',
      description: 'Percentage of races won',
      category: 'results',
      unit: 'percent',
      min: 0,
      max: 100,
      visualization: 'gauge',
      color: '#4CAF50',
    },

    // Improvement Metrics
    {
      id: 'improvement-rate',
      name: 'Improvement Rate',
      description: 'Rate of performance improvement over recent races',
      category: 'trends',
      unit: 'percent',
      min: -100,
      max: 100,
      visualization: 'line',
      color: '#8BC34A',
      formula: 'Comparison of recent 5 races vs. previous 5 races performance score',
    },
    {
      id: 'consistency-trend',
      name: 'Consistency Trend',
      description: 'Trend in result consistency over time',
      category: 'trends',
      unit: 'score',
      min: 0,
      max: 100,
      visualization: 'line',
      color: '#03A9F4',
      formula: 'Coefficient of variation of results over recent races',
    },

    // Detailed Performance Metrics
    {
      id: 'vmg-upwind',
      name: 'VMG Upwind',
      description: 'Velocity Made Good upwind compared to boat polar',
      category: 'performance',
      unit: 'percent',
      min: 0,
      max: 100,
      visualization: 'line',
      color: '#673AB7',
    },
    {
      id: 'vmg-downwind',
      name: 'VMG Downwind',
      description: 'Velocity Made Good downwind compared to boat polar',
      category: 'performance',
      unit: 'percent',
      min: 0,
      max: 100,
      visualization: 'line',
      color: '#FF5722',
    },
    {
      id: 'tacking-efficiency',
      name: 'Tacking Efficiency',
      description: 'Speed retention through tacks',
      category: 'execution',
      unit: 'percent',
      min: 0,
      max: 100,
      visualization: 'bar',
      color: '#00BCD4',
    },
    {
      id: 'gybing-efficiency',
      name: 'Gybing Efficiency',
      description: 'Speed retention through gybes',
      category: 'execution',
      unit: 'percent',
      min: 0,
      max: 100,
      visualization: 'bar',
      color: '#FF9800',
    },
  ],

  // --------------------------------------------------------------------------
  // AI AGENTS
  // These agents provide intelligent analysis, coaching, and automation
  // --------------------------------------------------------------------------
  agents: [
    {
      id: 'race-analysis-agent',
      name: 'Race Analysis Agent',
      description: 'Analyzes GPS race data and generates comprehensive coaching feedback covering starts, upwind/downwind tactics, and boat handling',
      module: './services/agents/RaceAnalysisAgent',
      capabilities: ['gps-analysis', 'performance-metrics', 'coaching-feedback'],
      requiredData: ['gps-track', 'race-metadata'],
    },
    {
      id: 'venue-intelligence-agent',
      name: 'Venue Intelligence Agent',
      description: 'Provides venue-specific tactical knowledge including wind patterns, current flows, typical courses, and local racing insights',
      module: './services/agents/VenueIntelligenceAgent',
      capabilities: ['venue-analysis', 'tactical-advice', 'condition-prediction'],
      requiredData: ['venue-location', 'weather-forecast'],
    },
    {
      id: 'course-prediction-agent',
      name: 'Course Prediction Agent',
      description: 'Predicts likely race courses based on weather forecasts, venue characteristics, and historical patterns',
      module: './services/agents/CoursePredictionAgent',
      capabilities: ['course-prediction', 'strategy-planning'],
      requiredData: ['venue-data', 'weather-forecast'],
    },
    {
      id: 'document-processing-agent',
      name: 'Document Processing Agent',
      description: 'Parses sailing instructions, notice of race, and other documents to extract race details, courses, and requirements',
      module: './services/agents/DocumentProcessingAgent',
      capabilities: ['document-parsing', 'race-extraction', 'course-extraction'],
      requiredData: ['document-file'],
    },
    {
      id: 'race-extraction-agent',
      name: 'Race Extraction Agent',
      description: 'Extracts race details from unstructured text including dates, venues, courses, and entry requirements',
      module: './services/agents/RaceExtractionAgent',
      capabilities: ['text-parsing', 'structured-data-extraction'],
      requiredData: ['text-input'],
    },
    {
      id: 'comprehensive-race-extraction-agent',
      name: 'Comprehensive Race Extraction Agent',
      description: 'Advanced race extraction with complete schedule, entry details, course descriptions, and notice board updates',
      module: './services/agents/ComprehensiveRaceExtractionAgent',
      capabilities: ['advanced-parsing', 'multi-race-extraction', 'schedule-parsing'],
      requiredData: ['document-or-text'],
    },
    {
      id: 'onboarding-agent',
      name: 'Onboarding Agent',
      description: 'Guides new sailors through GPS detection, boat selection, fleet discovery, and initial setup',
      module: './services/agents/OnboardingAgent',
      capabilities: ['user-guidance', 'setup-assistance', 'venue-detection'],
      requiredData: ['gps-location'],
    },
    {
      id: 'conversational-onboarding-agent',
      name: 'Conversational Onboarding Agent',
      description: 'Streaming AI chat interface providing natural conversational onboarding experience',
      module: './services/agents/ConversationalOnboardingAgent',
      capabilities: ['chat-interface', 'streaming-responses', 'contextual-guidance'],
      requiredData: ['user-input'],
    },
    {
      id: 'coach-matching-agent',
      name: 'Coach Matching Agent',
      description: 'Analyzes sailor performance, identifies skill gaps, and matches with appropriate coaches for targeted improvement',
      module: './services/agents/CoachMatchingAgent',
      capabilities: ['performance-analysis', 'skill-gap-identification', 'coach-recommendation'],
      requiredData: ['performance-history', 'available-coaches'],
    },
    {
      id: 'club-onboarding-agent',
      name: 'Club Onboarding Agent',
      description: 'Assists sailing clubs with platform setup, venue intelligence configuration, pricing, and staff management',
      module: './services/agents/ClubOnboardingAgent',
      capabilities: ['club-setup', 'admin-guidance', 'configuration-assistance'],
      requiredData: ['club-information'],
    },
  ],

  // --------------------------------------------------------------------------
  // SKILLS
  // These are Anthropic Skills uploaded from the RegattaFlow Playbook
  // They provide expert tactical knowledge for specific racing situations
  // --------------------------------------------------------------------------
  skills: [
    {
      id: 'race-strategy-analyst',
      skillId: YACHT_RACING_SKILLS['race-strategy-analyst'],
      name: 'Race Strategy Analyst',
      description: 'Comprehensive race strategy analysis considering weather, venue, and competition',
      category: 'strategy',
      tags: ['strategy', 'planning', 'weather', 'competition'],
    },
    {
      id: 'tidal-opportunism-analyst',
      skillId: YACHT_RACING_SKILLS['tidal-opportunism-analyst'],
      name: 'Tidal Opportunism Analyst',
      description: 'Identifies and exploits tidal flow advantages on the race course',
      category: 'strategy',
      tags: ['tidal', 'current', 'positioning', 'advantage'],
    },
    {
      id: 'slack-window-planner',
      skillId: YACHT_RACING_SKILLS['slack-window-planner'],
      name: 'Slack Window Planner',
      description: 'Calculates optimal timing for tidal slack windows and transition periods',
      category: 'strategy',
      tags: ['tidal', 'timing', 'planning'],
    },
    {
      id: 'current-counterplay-advisor',
      skillId: YACHT_RACING_SKILLS['current-counterplay-advisor'],
      name: 'Current Counterplay Advisor',
      description: 'Tactical advice for racing in strong current and complex flow patterns',
      category: 'strategy',
      tags: ['current', 'tactics', 'positioning'],
    },
    {
      id: 'starting-line-mastery',
      skillId: YACHT_RACING_SKILLS['starting-line-mastery'],
      name: 'Starting Line Mastery',
      description: 'Expert guidance on race starts: line bias, timing, positioning, and acceleration',
      category: 'tactical',
      tags: ['starts', 'timing', 'positioning', 'line-bias'],
    },
    {
      id: 'upwind-strategic-positioning',
      skillId: YACHT_RACING_SKILLS['upwind-strategic-positioning'],
      name: 'Upwind Strategic Positioning',
      description: 'Upwind tactical positioning for wind shifts, pressure, and layline approach',
      category: 'tactical',
      tags: ['upwind', 'positioning', 'shifts', 'strategy'],
    },
    {
      id: 'upwind-tactical-combat',
      skillId: YACHT_RACING_SKILLS['upwind-tactical-combat'],
      name: 'Upwind Tactical Combat',
      description: 'Close-quarters upwind racing: covering, passing lanes, and defensive tactics',
      category: 'tactical',
      tags: ['upwind', 'combat', 'covering', 'passing'],
    },
    {
      id: 'downwind-speed-and-position',
      skillId: YACHT_RACING_SKILLS['downwind-speed-and-position'],
      name: 'Downwind Speed and Position',
      description: 'Downwind tactics for speed optimization, positioning, and wind shadow avoidance',
      category: 'tactical',
      tags: ['downwind', 'speed', 'positioning', 'pressure'],
    },
    {
      id: 'mark-rounding-execution',
      skillId: YACHT_RACING_SKILLS['mark-rounding-execution'],
      name: 'Mark Rounding Execution',
      description: 'Optimal mark approach, rounding technique, and exit acceleration',
      category: 'tactical',
      tags: ['marks', 'maneuvers', 'execution', 'speed'],
    },
    {
      id: 'finishing-line-tactics',
      skillId: YACHT_RACING_SKILLS['finishing-line-tactics'],
      name: 'Finishing Line Tactics',
      description: 'Finish line approach strategy, timing, and position protection',
      category: 'tactical',
      tags: ['finish', 'tactics', 'positioning'],
    },
    {
      id: 'boat-tuning-analyst',
      skillId: YACHT_RACING_SKILLS['boat-tuning-analyst'],
      name: 'Boat Tuning Analyst',
      description: 'Boat setup, trim, and tuning recommendations for different conditions',
      category: 'performance',
      tags: ['tuning', 'setup', 'trim', 'speed'],
    },
    {
      id: 'race-learning-analyst',
      skillId: YACHT_RACING_SKILLS['race-learning-analyst'],
      name: 'Race Learning Analyst',
      description: 'Post-race analysis identifying lessons learned and improvement opportunities',
      category: 'performance',
      tags: ['learning', 'analysis', 'improvement', 'reflection'],
    },
  ],

  // --------------------------------------------------------------------------
  // ROUTES
  // Application routes for the yacht racing domain
  // --------------------------------------------------------------------------
  routes: [
    {
      path: '/(tabs)/races',
      name: 'Races',
      description: 'Browse and manage upcoming and past races',
      component: 'app/(tabs)/races.tsx',
      requiresAuth: true,
      icon: '🏁',
    },
    {
      path: '/(tabs)/race/[id]',
      name: 'Race Detail',
      description: 'Detailed race view with analysis and GPS track',
      component: 'app/(tabs)/race/[id].tsx',
      requiresAuth: true,
      icon: '📊',
    },
    {
      path: '/(tabs)/race/add',
      name: 'Add Race',
      description: 'Log a new race event',
      component: 'app/(tabs)/race/add.tsx',
      requiresAuth: true,
      icon: '➕',
    },
    {
      path: '/(tabs)/race/strategy',
      name: 'Race Strategy',
      description: 'Pre-race strategy planning with AI assistance',
      component: 'app/(tabs)/race/strategy.tsx',
      requiresAuth: true,
      icon: '🎯',
    },
    {
      path: '/(tabs)/race/timer',
      name: 'Race Timer',
      description: 'GPS race timer with real-time tracking',
      component: 'app/(tabs)/race/timer.tsx',
      requiresAuth: true,
      icon: '⏱️',
    },
    {
      path: '/(tabs)/events',
      name: 'Events',
      description: 'Browse regattas and multi-day events',
      component: 'app/(tabs)/events.tsx',
      requiresAuth: true,
      icon: '📅',
    },
    {
      path: '/(tabs)/fleet',
      name: 'Fleet',
      description: 'Fleet management and member activity',
      component: 'app/(tabs)/fleet/index.tsx',
      requiresAuth: true,
      icon: '👥',
    },
    {
      path: '/(tabs)/boat',
      name: 'My Boat',
      description: 'Boat profile, setup, and tuning guides',
      component: 'app/(tabs)/boat/index.tsx',
      requiresAuth: true,
      icon: '⛵',
    },
    {
      path: '/(tabs)/boats',
      name: 'Boats',
      description: 'Manage multiple boats and configurations',
      component: 'app/(tabs)/boats.tsx',
      requiresAuth: true,
      icon: '🚢',
    },
    {
      path: '/(tabs)/venue',
      name: 'Venue Intelligence',
      description: 'Venue-specific knowledge and tactical insights',
      component: 'app/(tabs)/venue.tsx',
      requiresAuth: true,
      icon: '🗺️',
    },
    {
      path: '/(tabs)/strategy',
      name: 'Strategy',
      description: 'Race strategy planning and analysis',
      component: 'app/(tabs)/strategy.tsx',
      requiresAuth: true,
      icon: '🧠',
    },
    {
      path: '/(tabs)/coaching',
      name: 'AI Coaching',
      description: 'Personalized AI coaching and recommendations',
      component: 'app/(tabs)/coaching.tsx',
      requiresAuth: true,
      icon: '🎓',
    },
    {
      path: '/(tabs)/my-learning',
      name: 'My Learning',
      description: 'Track progress, view insights, and learning recommendations',
      component: 'app/(tabs)/my-learning.tsx',
      requiresAuth: true,
      icon: '📚',
    },
    {
      path: '/(tabs)/tuning-guides',
      name: 'Tuning Guides',
      description: 'Boat tuning guides for different conditions',
      component: 'app/(tabs)/tuning-guides.tsx',
      requiresAuth: true,
      icon: '🔧',
    },
    {
      path: '/(tabs)/dashboard',
      name: 'Dashboard',
      description: 'Performance dashboard with metrics and trends',
      component: 'app/(tabs)/dashboard.tsx',
      requiresAuth: true,
      icon: '📈',
    },
    {
      path: '/(tabs)/calendar',
      name: 'Calendar',
      description: 'Race calendar and event schedule',
      component: 'app/(tabs)/calendar.tsx',
      requiresAuth: true,
      icon: '📆',
    },
    {
      path: '/(tabs)/clubs',
      name: 'Clubs',
      description: 'Browse and join sailing clubs',
      component: 'app/(tabs)/clubs.tsx',
      requiresAuth: true,
      icon: '🏛️',
    },
    {
      path: '/club',
      name: 'Club Dashboard',
      description: 'Club management dashboard for race committees',
      component: 'app/club/index.tsx',
      requiresAuth: true,
      requiresRole: 'club-admin',
      icon: '🏛️',
    },
    {
      path: '/(tabs)/settings',
      name: 'Settings',
      description: 'Account and app settings',
      component: 'app/(tabs)/settings.tsx',
      requiresAuth: true,
      icon: '⚙️',
    },
  ],

  // --------------------------------------------------------------------------
  // PERMISSIONS
  // Role-based access control for yacht racing features
  // --------------------------------------------------------------------------
  permissions: [
    // Race Permissions
    {
      id: 'view:races',
      name: 'View Races',
      description: 'View race events and details',
      roles: ['sailor', 'coach', 'club-admin', 'race-committee'],
    },
    {
      id: 'create:races',
      name: 'Create Races',
      description: 'Log new race events',
      roles: ['sailor', 'coach'],
    },
    {
      id: 'edit:races',
      name: 'Edit Races',
      description: 'Edit race event details',
      roles: ['sailor', 'coach'],
    },
    {
      id: 'delete:races',
      name: 'Delete Races',
      description: 'Delete race events',
      roles: ['sailor', 'coach'],
    },
    {
      id: 'analyze:races',
      name: 'Analyze Races',
      description: 'Generate AI analysis for races',
      roles: ['sailor', 'coach'],
    },

    // Venue Permissions
    {
      id: 'view:venues',
      name: 'View Venues',
      description: 'View venue intelligence and tactics',
      roles: ['sailor', 'coach', 'club-admin', 'race-committee'],
    },
    {
      id: 'edit:venues',
      name: 'Edit Venues',
      description: 'Edit venue information and tactics',
      roles: ['coach', 'club-admin'],
    },

    // Results Permissions
    {
      id: 'view:results',
      name: 'View Results',
      description: 'View race results and standings',
      roles: ['sailor', 'coach', 'club-admin', 'race-committee', 'public'],
    },
    {
      id: 'manage:results',
      name: 'Manage Results',
      description: 'Enter and modify race results',
      roles: ['race-committee', 'club-admin'],
    },

    // Boat Permissions
    {
      id: 'manage:boats',
      name: 'Manage Boats',
      description: 'Add, edit, and delete boat profiles',
      roles: ['sailor', 'coach'],
    },

    // Fleet Permissions
    {
      id: 'manage:fleet',
      name: 'Manage Fleet',
      description: 'Manage fleet settings and members',
      roles: ['fleet-captain', 'coach', 'club-admin'],
    },
    {
      id: 'view:fleet',
      name: 'View Fleet',
      description: 'View fleet activity and members',
      roles: ['sailor', 'coach', 'fleet-captain', 'club-admin'],
    },

    // Club Permissions
    {
      id: 'view:club-events',
      name: 'View Club Events',
      description: 'View club-organized events and regattas',
      roles: ['sailor', 'coach', 'club-admin', 'race-committee', 'public'],
    },
    {
      id: 'manage:club-events',
      name: 'Manage Club Events',
      description: 'Create and manage club events',
      roles: ['race-committee', 'club-admin'],
    },
    {
      id: 'manage:club',
      name: 'Manage Club',
      description: 'Full club administration',
      roles: ['club-admin'],
    },

    // Coaching Permissions
    {
      id: 'view:coaching',
      name: 'View Coaching',
      description: 'Access AI coaching and recommendations',
      roles: ['sailor', 'coach'],
    },
    {
      id: 'coach:others',
      name: 'Coach Others',
      description: 'Provide coaching to other sailors',
      roles: ['coach'],
    },

    // Data Permissions
    {
      id: 'export:data',
      name: 'Export Data',
      description: 'Export GPS tracks and analysis data',
      roles: ['sailor', 'coach'],
    },
    {
      id: 'import:data',
      name: 'Import Data',
      description: 'Import race data from external sources',
      roles: ['sailor', 'coach', 'club-admin'],
    },
  ],

  // --------------------------------------------------------------------------
  // ROLES
  // Define user roles within the yacht racing domain
  // --------------------------------------------------------------------------
  roles: [
    {
      id: 'sailor',
      name: 'Sailor',
      description: 'Individual sailor tracking their own performance',
      isDefault: true,
    },
    {
      id: 'coach',
      name: 'Coach',
      description: 'Sailing coach with access to athlete data',
      isDefault: false,
    },
    {
      id: 'fleet-captain',
      name: 'Fleet Captain',
      description: 'Leader of a boat class fleet',
      isDefault: false,
    },
    {
      id: 'race-committee',
      name: 'Race Committee',
      description: 'Race officer managing events and results',
      isDefault: false,
    },
    {
      id: 'club-admin',
      name: 'Club Administrator',
      description: 'Sailing club administrator with full access',
      isDefault: false,
    },
  ],

  // --------------------------------------------------------------------------
  // INTEGRATIONS
  // External service integrations
  // --------------------------------------------------------------------------
  integrations: [
    {
      id: 'weather-api',
      name: 'Weather API',
      description: 'Real-time weather forecasts and observations',
      provider: 'openweathermap',
      required: false,
    },
    {
      id: 'tidal-api',
      name: 'Tidal API',
      description: 'Tidal predictions and current data',
      provider: 'xtide',
      required: false,
    },
    {
      id: 'gps-tracking',
      name: 'GPS Tracking',
      description: 'Mobile GPS tracking during races',
      provider: 'native',
      required: true,
    },
  ],

  // --------------------------------------------------------------------------
  // SETTINGS
  // Domain-specific configuration options
  // --------------------------------------------------------------------------
  settings: {
    // GPS Settings
    gpsAccuracy: {
      type: 'select',
      label: 'GPS Accuracy',
      description: 'GPS tracking accuracy level',
      options: ['high', 'medium', 'low'],
      default: 'high',
    },
    gpsUpdateInterval: {
      type: 'number',
      label: 'GPS Update Interval (seconds)',
      description: 'How often to record GPS position',
      min: 1,
      max: 30,
      default: 5,
    },

    // Analysis Settings
    autoAnalyzeRaces: {
      type: 'boolean',
      label: 'Auto-Analyze Completed Races',
      description: 'Automatically generate AI analysis when races complete',
      default: true,
    },
    analysisDetailLevel: {
      type: 'select',
      label: 'Analysis Detail Level',
      description: 'How detailed should AI analysis be',
      options: ['quick', 'standard', 'comprehensive'],
      default: 'standard',
    },

    // Display Settings
    defaultUnits: {
      type: 'select',
      label: 'Default Units',
      description: 'Preferred unit system',
      options: ['metric', 'imperial', 'nautical'],
      default: 'nautical',
    },
    showCompetitors: {
      type: 'boolean',
      label: 'Show Competitor Data',
      description: 'Display fleet and competitor performance data',
      default: true,
    },

    // Privacy Settings
    shareGPSTracks: {
      type: 'boolean',
      label: 'Share GPS Tracks',
      description: 'Allow others in your fleet to view your GPS tracks',
      default: false,
    },
    publicProfile: {
      type: 'boolean',
      label: 'Public Profile',
      description: 'Make your race results publicly visible',
      default: true,
    },
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Export the yacht racing domain configuration
 * This is imported by the BetterAt platform to register the domain
 */
export default yachtRacingDomain;

/**
 * Named export for explicit imports
 */
export { yachtRacingDomain };

/**
 * Export activity schemas for use in other modules
 */
export { raceEventSchema, regattaSchema, trainingSessionSchema };
