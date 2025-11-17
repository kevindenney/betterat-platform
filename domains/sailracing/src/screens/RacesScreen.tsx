/**
 * Races Screen - Using UnifiedDomainDashboard
 *
 * Refactored to use the shared UnifiedDomainDashboard component
 * for consistency across domains
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { useAuth } from '@betterat/core';
import {
  UnifiedDomainDashboard,
  WorkflowExecutionConsole,
  CollaborationBroadcastConsole,
  PostEventAnalysisConsole,
  type HighlightEvent,
  type QuickAction,
} from '@betterat/ui';
import { supabase } from '../services/supabase';
import { RaceCard, type RaceCardProps } from '../components/races/RaceCard';
import { SimpleAddRaceModal } from '../components/races/SimpleAddRaceModal';
import { StrategyPhaseCard, StrategyCollaborationPanel, type StrategyCardTheme, type StrategyCollaborationPanelProps } from '@betterat/ui';
import { Anchor, ClipboardList, Flag, Wind as WindIcon, Landmark, Feather, Compass, Trophy } from 'lucide-react-native';
import { getStrategyPhases, type StrategyPlanFields, type StrategyAISuggestion, type StrategyPhaseDefinition, fetchStrategyEntries, upsertStrategyEntry } from '@betterat/core';
import { raceStrategyEngine, type RaceStrategy, type RaceConditions } from '../services/ai/RaceStrategyEngine';
import { RaceWeatherService, type RaceWeatherMetadata } from '../services/RaceWeatherService';
import { postRaceLearningService } from '../services/PostRaceLearningService';
import { raceTuningService } from '../services/RaceTuningService';
import type { PerformancePattern } from '@betterat/core/types/raceLearning';
import { createLogger } from '../utils/logger';

const logger = createLogger('RacesScreen');

const RACE_TAB_LABELS = {
  gather: { label: 'Strategize', description: 'Course intel & huddles' },
  create: { label: 'Race', description: 'Run the start & legs' },
  share: { label: 'Share', description: 'Fleet comms + media' },
  reflect: { label: 'Analyze', description: 'Post-race review' },
} as const;

// Enable demo mode for testing
const DEMO_MODE = false;

// Demo races for testing
const DEMO_RACES: Race[] = [
  {
    id: 'demo-1',
    name: 'Champ of Champs',
    venue_name: 'Royal Hong Kong Yacht Club',
    race_date: '2025-11-16',
    start_time: '15:00:00',
    user_id: 'demo',
    venue_id: null,
    boat_id: null,
    finishing_position: null,
    weather_conditions: null,
    ai_strategy: 'Start on port tack to catch the favorable current on the eastern shore. Wind expected to veer 10° right during the race.',
    confidence_score: null,
    metadata: {
      wind: { direction: 'NE', speedMin: 12, speedMax: 18 },
      tide: { state: 'flooding', height: 1.2, direction: 'N' },
      vhf_channel: '72',
      warning_signal: '14:55',
      first_start: '15:00',
      weather_fetched_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-2',
    name: 'Croucher Series Race 5',
    venue_name: 'Repulse Bay',
    race_date: '2025-11-17',
    start_time: '13:30:00',
    user_id: 'demo',
    venue_id: null,
    boat_id: null,
    finishing_position: null,
    weather_conditions: null,
    ai_strategy: 'Light air race. Focus on boat speed and staying in the pressure. Avoid the western shore where wind tends to die.',
    confidence_score: null,
    metadata: {
      wind: { direction: 'E', speedMin: 8, speedMax: 14 },
      tide: { state: 'ebbing', height: 0.8, direction: 'S' },
      vhf_channel: '71',
      warning_signal: '13:25',
      first_start: '13:30',
      weather_fetched_at: new Date().toISOString(),
    },
  },
];

type RaceWeatherConditions = {
  wind_speed?: number;
  wind_speed_min?: number;
  wind_speed_max?: number;
  wind_direction?: string;
  tide_state?: string;
  tide_height?: number;
  tide_direction?: string;
  fetched_at?: string;
  provider?: string;
  confidence?: number;
  location_name?: string | null;
  location_coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
  venue_name?: string | null;
  [key: string]: any;
};

type Race = {
  id: string;
  name: string;
  race_date: string;
  start_time: string | null;
  user_id: string;
  venue_id: string | null;
  boat_id: string | null;
  finishing_position: number | null;
  status?: 'upcoming' | 'active' | 'completed';
  weather_conditions: RaceWeatherConditions | null;
  location_coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
  ai_strategy: string | null;
  confidence_score: number | null;
  metadata?: any;
  venue_name?: string;
};

type RaceWithStatus = Race & {
  raceStatus: 'past' | 'next' | 'future';
};

const STRATEGY_PHASES: StrategyPhaseDefinition[] = getStrategyPhases('sailracing');
const SAIL_STRATEGY_THEME: StrategyCardTheme = {
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
  iconBackground: '#F3E8D2',
  iconColor: '#4C3F32',
};
const SAIL_PHASE_ICONS: Record<string, React.ReactNode> = {
  rig: <Anchor size={18} color={SAIL_STRATEGY_THEME.iconColor} strokeWidth={1.6} />,
  pre_race: <ClipboardList size={18} color={SAIL_STRATEGY_THEME.iconColor} strokeWidth={1.6} />,
  start: <Flag size={18} color={SAIL_STRATEGY_THEME.iconColor} strokeWidth={1.6} />,
  upwind: <WindIcon size={18} color={SAIL_STRATEGY_THEME.iconColor} strokeWidth={1.6} />,
  top_mark: <Landmark size={18} color={SAIL_STRATEGY_THEME.iconColor} strokeWidth={1.6} />,
  downwind: <Feather size={18} color={SAIL_STRATEGY_THEME.iconColor} strokeWidth={1.6} />,
  bottom_mark: <Compass size={18} color={SAIL_STRATEGY_THEME.iconColor} strokeWidth={1.6} />,
  finish: <Trophy size={18} color={SAIL_STRATEGY_THEME.iconColor} strokeWidth={1.6} />,
};

type PhaseInsightPhase =
  | 'rigTuning'
  | 'prestart'
  | 'start'
  | 'upwind'
  | 'windwardMark'
  | 'downwind'
  | 'leewardMark'
  | 'finish';

type PhaseInsight = {
  pattern: PerformancePattern | null;
  aiSuggestion: string | null;
};

type PhaseInsightMap = Record<string, PhaseInsight>;

const STRATEGY_PHASE_TO_LEARNING_PHASE: Record<string, PhaseInsightPhase> = {
  rig: 'rigTuning',
  pre_race: 'prestart',
  start: 'start',
  upwind: 'upwind',
  top_mark: 'windwardMark',
  downwind: 'downwind',
  bottom_mark: 'leewardMark',
  finish: 'finish',
};

const createEmptyPlan = (): StrategyPlanFields => ({ what: '', why: '', how: '', who: '' });

type CrewBrief = {
  message: string;
  preview: string;
  meta: string;
};

const RACE_ACTIONS: QuickAction[] = [
  // Removed quick action buttons as requested
  // { id: 'strategy', label: 'Race Strategy', icon: '🧭' },
  // { id: 'weather', label: 'Weather', icon: '🌊' },
  // { id: 'timing', label: 'Start Sequence', icon: '⏱️' },
];

export function RacesScreen() {
  const { user } = useAuth();

  const [races, setRaces] = useState<RaceWithStatus[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [strategyPlans, setStrategyPlans] = useState<Record<string, StrategyPlanFields>>({});
  const [phaseSuggestions, setPhaseSuggestions] = useState<Record<string, StrategyAISuggestion>>({});
  const [planSaveStatus, setPlanSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'error'>>({});
  const [planSaveError, setPlanSaveError] = useState<Record<string, string | null>>({});
  const [refreshingAI, setRefreshingAI] = useState(false);
  const [phaseLearningInsights, setPhaseLearningInsights] = useState<PhaseInsightMap>({});
  const [trackingActive, setTrackingActive] = useState(false);
  const [lastTrackCompletedAt, setLastTrackCompletedAt] = useState<string | null>(null);
  const [analysisResponses, setAnalysisResponses] = useState<Record<string, string>>({});
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    if (!user?.id) {
      setPhaseLearningInsights({});
      return;
    }

    let cancelled = false;
    const loadPhaseInsights = async () => {
      try {
        const entries = await Promise.all(
          Object.entries(STRATEGY_PHASE_TO_LEARNING_PHASE).map(async ([phaseId, learningPhase]) => {
            try {
              const insight = await postRaceLearningService.getPhaseSpecificInsights(user.id!, learningPhase);
              return [phaseId, insight];
            } catch (error) {
              logger.debug('[RaceStrategyPlanner] Phase insight fetch failed', error);
              return [phaseId, { pattern: null, aiSuggestion: null }];
            }
          })
        );
        if (!cancelled) {
          setPhaseLearningInsights(Object.fromEntries(entries));
        }
      } catch (error) {
        logger.warn('[RaceStrategyPlanner] Failed to load phase learning insights', error);
        if (!cancelled) {
          setPhaseLearningInsights({});
        }
      }
    };

    void loadPhaseInsights();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const personalizedPhaseSuggestions = useMemo(
    () => mergeSuggestionsWithInsights(phaseSuggestions, phaseLearningInsights),
    [phaseSuggestions, phaseLearningInsights],
  );

  // Fetch races from Supabase
  const fetchRaces = useCallback(async () => {
    try {
      let data: Race[];

      if (DEMO_MODE) {
        data = DEMO_RACES;
      } else {
        const shouldFilterByUser = !!user?.id;

        let query = supabase
          .from('race_events')
          .select('*')
          .order('event_date', { ascending: true })
          .order('start_time', { ascending: true });

        if (shouldFilterByUser) {
          query = query.eq('club_id', user.id);
        }

        const { data: dbData, error } = await query;

        if (error) {
          logger.error('[fetchRaces] Error fetching races:', error);
          return;
        }

        if (!dbData || dbData.length === 0) {
          setRaces([]);
          setLoading(false);
          return;
        }

        data = dbData.map((race) => {
          const weatherMetadata = race.weather_conditions || {};
          const derivedVenueName =
            weatherMetadata.location_name ||
            weatherMetadata.venue_name ||
            race.metadata?.venue_name ||
            'TBD';

          return {
            ...race,
            race_date: race.event_date,
            venue_name: derivedVenueName,
            location_coordinates: weatherMetadata.location_coordinates || null,
          };
        });

        logger.debug('[fetchRaces] Loaded raw race_events:', data.length);
      }

      // Process races and determine statuses
      const now = new Date();
      let nextRaceIndex = -1;

      const racesWithStatus = data.map((race, index) => {
        const raceDateTime = new Date(`${race.race_date}T${race.start_time || '00:00:00'}`);
        let raceStatus: 'past' | 'next' | 'future';

        if (raceDateTime < now) {
          raceStatus = 'past';
        } else if (nextRaceIndex === -1) {
          nextRaceIndex = index;
          raceStatus = 'next';
        } else {
          raceStatus = 'future';
        }

        return {
          ...race,
          raceStatus,
        } as RaceWithStatus;
      });

      setRaces(racesWithStatus);

      // Auto-select the next race
      if (nextRaceIndex >= 0 && !selectedRaceId) {
        setSelectedRaceId(racesWithStatus[nextRaceIndex].id);
      } else if (racesWithStatus.length > 0 && !selectedRaceId) {
        setSelectedRaceId(racesWithStatus[0].id);
      }

      logger.debug('[fetchRaces] Loaded races:', racesWithStatus.length);
    } catch (error) {
      logger.error('[fetchRaces] Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedRaceId]);

  useEffect(() => {
    fetchRaces();
  }, [fetchRaces]);

  // Convert race data to RaceCard props
  const getRaceCardProps = useCallback((race: RaceWithStatus): RaceCardProps => {
    const metadata = race.metadata || {};
    const weather = race.weather_conditions || {};
    const locationCoordinates = race.location_coordinates || weather.location_coordinates || null;
    const venueLabel = race.venue_name || weather.location_name || weather.venue_name || 'No venue';

    const wind = metadata.wind || (weather.wind_speed ? {
      direction: weather.wind_direction || 'Variable',
      speedMin: weather.wind_speed,
      speedMax: weather.wind_speed,
    } : null);

    return {
      id: race.id,
      name: race.name || 'Untitled Race',
      venue: venueLabel,
      date: race.race_date,
      startTime: race.start_time || '00:00',
      wind,
      tide: metadata.tide || null,
      weatherStatus: race.weather_conditions
        ? 'available'
        : venueLabel && venueLabel !== 'TBD'
        ? 'unavailable'
        : 'no_venue',
      weatherConditions: race.weather_conditions,
      locationCoordinates,
      locationName: venueLabel,
      strategy: race.ai_strategy || metadata.strategy || null,
      critical_details: {
        vhf_channel: metadata.vhf_channel,
        warning_signal: metadata.warning_signal,
        first_start: metadata.first_start,
      },
      isPrimary: race.raceStatus === 'next',
      raceStatus: race.raceStatus,
      isSelected: selectedRaceId === race.id,
      isDimmed: selectedRaceId !== null && selectedRaceId !== race.id,
      showTimelineIndicator: race.raceStatus === 'next',
      onSelect: () => setSelectedRaceId(race.id),
    };
  }, [selectedRaceId]);

  // Get selected race
  const selectedRace = useMemo(() => {
    return races.find(r => r.id === selectedRaceId);
  }, [races, selectedRaceId]);

  const executionContextPills = useMemo(() => {
    if (!selectedRace) return [];
    const pills: string[] = [];
    if (selectedRace.metadata?.wind?.direction && selectedRace.metadata?.wind?.speedMin) {
      const max = selectedRace.metadata.wind.speedMax ?? selectedRace.metadata.wind.speedMin;
      pills.push(`${selectedRace.metadata.wind.direction} ${selectedRace.metadata.wind.speedMin}-${max}kts`);
    }
    if (selectedRace.metadata?.vhf_channel) {
      pills.push(`VHF ${selectedRace.metadata.vhf_channel}`);
    }
    if (selectedRace.location_coordinates) {
      pills.push('GPS ready');
    }
    return pills;
  }, [selectedRace]);

  const liveTrackingMetrics = useMemo(() => {
    const metrics = [
      {
        id: 'gps',
        label: 'GPS lock',
        value: trackingActive ? 'Recording • 0.8m acc' : selectedRace?.location_coordinates ? 'Ready' : 'Waiting for venue',
        status: trackingActive ? 'positive' : undefined,
      },
      {
        id: 'sync',
        label: 'Last sync',
        value: lastTrackCompletedAt
          ? new Date(lastTrackCompletedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'No track yet',
      },
    ];

    metrics.push({
      id: 'battery',
      label: 'Phone battery',
      value: '83%',
      status: 'warning',
    });

    metrics.push({
      id: 'coach-link',
      label: 'Coach visibility',
      value: 'Auto when saved',
    });

    return metrics;
  }, [selectedRace?.location_coordinates, trackingActive, lastTrackCompletedAt]);

  const aiInsightStatus: 'waiting' | 'tracking' | 'ready' = trackingActive
    ? 'tracking'
    : lastTrackCompletedAt
      ? 'ready'
      : 'waiting';

  const executionInsights = useMemo(() => {
    const baseDetail = 'AI tags every tack/gybe, layline call, and speed mode.';
    return [
      {
        id: 'laylines',
        label: 'Left vs right bias',
        detail: 'Tracks time outside laylines + recovery legs.',
        status: aiInsightStatus,
        metric: 'Goal ±15m',
      },
      {
        id: 'tacks',
        label: 'Tacking cadence',
        detail: 'Number of maneuvers + avg loss per tack.',
        status: aiInsightStatus,
        metric: 'Target < 6s',
      },
      {
        id: 'strategy',
        label: 'Strategy adherence',
        detail: selectedRace?.ai_strategy
          ? `Compares GPS to pre-race brief: “${selectedRace.ai_strategy.slice(0, 42)}…”`
          : baseDetail,
        status: aiInsightStatus,
        metric: 'Coach review',
      },
    ];
  }, [aiInsightStatus, selectedRace?.ai_strategy]);

  const shareTargets = useMemo(() => ([
    {
      id: 'betterat-coach',
      label: 'BetterAt coach',
      description: 'Full GPS track, notes, & AI summary drop into the shared workspace.',
      channel: 'BetterAt DM',
      enabled: true,
    },
    {
      id: 'club-roc',
      label: 'Yacht club PRO',
      description: 'Share compliance evidence and timing if you are in an official start.',
      channel: 'Club console',
      enabled: false,
    },
    {
      id: 'personal-coach',
      label: 'Personal coach',
      description: 'Send practice track + comments for remote debrief.',
      channel: 'Email + link',
      enabled: true,
    },
  ]), []);

  const evidencePrompts = useMemo(() => ([
    {
      id: 'gate-video',
      label: 'Leeward gate video',
      description: 'Record the rounding for AI heel angle + roll rate checks.',
      acceptedTypes: ['Video', 'Link'],
    },
    {
      id: 'sail-shape',
      label: 'Sail shape photos',
      description: 'Upload main + jib photos for trim benchmarking vs tune plan.',
      acceptedTypes: ['Photo'],
    },
    {
      id: 'strategy-board',
      label: 'Pre-race strategy',
      description: 'Capture your dock talk notes so AI can score execution.',
      acceptedTypes: ['Photo', 'PDF'],
    },
  ]), []);

  const sequenceOptions = useMemo(() => {
    const warning = selectedRace?.metadata?.warning_signal;
    const startTime = selectedRace?.start_time;
    return [
      {
        id: 'regatta',
        label: 'Start 5-min sequence',
        description: warning ? `Warning signal ${warning}` : 'Default US Sailing timer',
        durationSeconds: 300,
      },
      {
        id: 'practice',
        label: '3-min practice',
        description: startTime ? `Aligns with ${startTime}` : 'Rolling starts on demand',
        durationSeconds: 180,
      },
      {
        id: 'short',
        label: '1-min drills',
        description: 'Rapid accelerations for boathandling reps',
        durationSeconds: 60,
      },
    ];
  }, [selectedRace?.metadata?.warning_signal, selectedRace?.start_time]);

  const shareContextPills = useMemo(() => {
    if (!selectedRace) return [];
    const pills: string[] = [];
    pills.push(selectedRace.name || 'Unnamed race');
    if (selectedRace.metadata?.vhf_channel) {
      pills.push(`VHF ${selectedRace.metadata.vhf_channel}`);
    }
    if (selectedRace.metadata?.wind?.direction) {
      const min = selectedRace.metadata.wind.speedMin;
      const max = selectedRace.metadata.wind.speedMax ?? min;
      pills.push(`${selectedRace.metadata.wind.direction} ${min}-${max}kts`);
    }
    return pills;
  }, [selectedRace]);

  const shareAudiences = useMemo(() => ([
    {
      id: 'crew',
      label: 'Crew thread',
      description: 'Push dock-out timing, sail choices, and last-minute reminders.',
      channel: 'BetterAt Crew Chat',
      defaultEnabled: true,
      badge: 'Primary',
    },
    {
      id: 'fleet',
      label: 'Fleet list',
      description: 'Post to your class/fleet group for coordination.',
      channel: 'Fleet WhatsApp + email',
      defaultEnabled: false,
    },
    {
      id: 'coach',
      label: 'Personal coach',
      description: 'Send track link + goals for remote feedback.',
      channel: 'Direct DM',
      defaultEnabled: true,
    },
    {
      id: 'club',
      label: 'Club PRO',
      description: 'Share schedule, safety confirmations, or requests.',
      channel: 'Club Console',
      defaultEnabled: false,
    },
  ]), []);

  const shareTemplates = useMemo(() => {
    const raceName = selectedRace?.name || 'today’s race';
    return [
      {
        id: 'crew-brief',
        label: 'Crew briefing',
        summary: `Crew briefing for ${raceName}`,
        body: 'Dock-out + warm-up timing\nInventory focus\nStart game plan + backup lane\nRoles and comms reminders',
      },
      {
        id: 'coach-update',
        label: 'Coach update',
        summary: `Coaching notes for ${raceName}`,
        body: 'Goal for the session\nSpecific skill to capture on video\nAny tuning questions',
      },
      {
        id: 'fleet-notes',
        label: 'Fleet update',
        summary: 'Sharing course + tide observations',
        body: 'Course notes\nPressure/tide callouts\nAny coordination requests',
      },
    ];
  }, [selectedRace?.name]);

  const shareAttachments = useMemo(() => ([
    {
      id: 'strategy',
      label: 'Attach strategy board',
      helper: 'Photo or PDF so the crew sees the latest priorities.',
      actionLabel: 'Upload',
      onAttach: () => logger.debug('[ShareTab] attach strategy board'),
    },
    {
      id: 'track',
      label: 'Attach GPS track',
      helper: trackingActive ? 'Recording...' : lastTrackCompletedAt ? 'Last track ready to share.' : 'Start a sequence to capture a track.',
      actionLabel: trackingActive ? 'Recording' : 'Attach',
      onAttach: () => logger.debug('[ShareTab] attach track'),
    },
    {
      id: 'media',
      label: 'Add media',
      helper: 'Drop photos/video for the fleet social recap.',
      actionLabel: 'Add',
      onAttach: () => logger.debug('[ShareTab] attach media'),
    },
  ]), [trackingActive, lastTrackCompletedAt]);

  const analysisContext = useMemo(() => {
    if (!selectedRace) return [];
    const contextItems: { label: string; value: string }[] = [];
    if (selectedRace.venue_name) {
      contextItems.push({ label: 'Venue', value: selectedRace.venue_name });
    }
    contextItems.push({
      label: 'Race date',
      value: new Date(`${selectedRace.race_date}T${selectedRace.start_time || '00:00:00'}`).toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
    if (selectedRace.metadata?.fleet) {
      contextItems.push({ label: 'Fleet', value: selectedRace.metadata.fleet });
    }
    return contextItems;
  }, [selectedRace]);

  const analysisWeatherSummary = useMemo(() => {
    const wind = selectedRace?.metadata?.wind;
    const tide = selectedRace?.metadata?.tide;
    const summary: { label: string; value: string }[] = [];
    if (wind?.direction && wind?.speedMin) {
      const max = wind.speedMax ?? wind.speedMin;
      summary.push({ label: 'Wind', value: `${wind.direction} ${wind.speedMin}-${max}kts` });
    }
    if (tide?.state) {
      summary.push({ label: 'Tide', value: `${tide.state} ${tide.height ?? ''}m` });
    }
    return summary;
  }, [selectedRace?.metadata?.wind, selectedRace?.metadata?.tide]);

  const trackSummary = useMemo(() => {
    if (trackingActive) {
      return 'GPS + sensors actively recording.';
    }
    if (lastTrackCompletedAt) {
      return `Track captured at ${new Date(lastTrackCompletedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Ready for AI scoring.`;
    }
    return 'Run a sequence to capture a GPS track.';
  }, [trackingActive, lastTrackCompletedAt]);

  const phaseQuestions = useMemo(() => {
    const windDirection = selectedRace?.metadata?.wind?.direction;
    return [
      {
        id: 'pre_race',
        label: 'On-water recon',
        prompt: 'What did you confirm about pressure, tide, and traffic before sequence?',
        helper: windDirection ? `Wind watch noted ${windDirection}. Did that hold?` : undefined,
        aiFinding: phaseLearningInsights.pre_race?.pattern ? `${phaseLearningInsights.pre_race.pattern.label} avg ${phaseLearningInsights.pre_race.pattern.average?.toFixed(1) ?? ''}` : null,
      },
      {
        id: 'start',
        label: 'Start execution',
        prompt: 'How did you hit the line vs. your burn plan?',
        helper: 'Include transit timing, acceleration, and lane protection.',
        aiFinding: 'Anthropic grading pending',
      },
      {
        id: 'upwind',
        label: 'Upwind legs',
        prompt: 'Where did you gain/lose vs. your upwind ladder?',
        helper: 'Note shift timing, mode changes, and traffic calls.',
      },
      {
        id: 'top_mark',
        label: 'Windward mark',
        prompt: 'Was the approach disciplined? Did you hit target layline?',
      },
      {
        id: 'downwind',
        label: 'Downwind legs',
        prompt: 'How was VMG mode selection? Include pressure choices.',
      },
      {
        id: 'bottom_mark',
        label: 'Leeward gate',
        prompt: 'Call out choreography, exit lane, and communication.',
      },
      {
        id: 'finish',
        label: 'Finish mechanics',
        prompt: 'Line call accuracy + any rules situations?',
      },
      {
        id: 'rules',
        label: 'Rules / other notes',
        prompt: 'Document protests, whistle moments, or safety events.',
      },
    ];
  }, [phaseLearningInsights, selectedRace?.metadata?.wind?.direction]);

  const analysisMetrics = useMemo(() => {
    const metricPhases: { id: string; label: string }[] = [
      { id: 'start', label: 'Start quality' },
      { id: 'upwind', label: 'Upwind pace' },
      { id: 'downwind', label: 'Downwind flow' },
    ];
    return metricPhases.map((phase) => {
      const planSummary = personalizedPhaseSuggestions[phase.id]?.summary || 'Plan TBD';
      const response = analysisResponses[phase.id];
      return {
        id: phase.id,
        label: phase.label,
        plan: planSummary,
        actual: response ? (response.length > 60 ? `${response.slice(0, 60)}…` : response) : 'Awaiting debrief note',
        delta: response ? 'Queued for AI comparison to GPS + video evidence.' : undefined,
        suggestion: personalizedPhaseSuggestions[phase.id]?.bullets?.[0],
      };
    });
  }, [analysisResponses, personalizedPhaseSuggestions]);

  const improvementIdeas = useMemo(() => {
    const entries = Object.entries(phaseLearningInsights)
      .filter(([, insight]) => insight?.pattern || insight?.aiSuggestion)
      .slice(0, 3);
    return entries.map(([phaseId, insight], index) => {
      const fallbackDetail = insight?.pattern ? buildPatternBullet(insight.pattern) : 'AI review queued once you submit notes.';
      return {
        id: `${phaseId}-${index}`,
        title: insight?.pattern?.label || `Focus: ${phaseId}`,
        detail: insight?.aiSuggestion || fallbackDetail,
        aiTag: insight?.pattern ? `${insight.pattern.trend === 'improving' ? '↗' : insight.pattern.trend === 'declining' ? '↘' : '↔'} trend` : 'AI note',
      };
    });
  }, [phaseLearningInsights]);

  const aiRecap = useMemo(() => {
    if (!selectedRace?.ai_strategy) return null;
    return `Baseline plan: ${selectedRace.ai_strategy}. Anthropic will compare your notes + GPS track to score adherence and surface playbook drills.`;
  }, [selectedRace?.ai_strategy]);

  const handleAnalysisResponseChange = useCallback((id: string, value: string) => {
    setAnalysisResponses((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!selectedRace) {
      setStrategyPlans({});
      setPhaseSuggestions({});
      return () => {
        cancelled = true;
      };
    }

    const basePlans: Record<string, StrategyPlanFields> = {};
    STRATEGY_PHASES.forEach((phase) => {
      basePlans[phase.id] = createEmptyPlan();
    });

    const defaultSuggestions = buildAllPhaseSuggestions(selectedRace);
    setStrategyPlans(basePlans);
    setPhaseSuggestions(defaultSuggestions);

    fetchStrategyEntries('sailracing', selectedRace.id)
      .then((entries) => {
        if (cancelled) return;
        const plansFromDb = { ...basePlans };
        const suggestionsFromDb = { ...defaultSuggestions };

        entries.forEach((entry) => {
          if (entry.plan) {
            plansFromDb[entry.phase] = {
              ...createEmptyPlan(),
              ...entry.plan,
            } as StrategyPlanFields;
          }
          if (entry.ai_suggestion) {
            suggestionsFromDb[entry.phase] = entry.ai_suggestion as StrategyAISuggestion;
          }
        });

        setStrategyPlans(plansFromDb);
        setPhaseSuggestions(suggestionsFromDb);
      })
      .catch((err) => {
        console.warn('[RaceStrategyPlanner] failed to load strategy entries', err);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRace?.id]);

  useEffect(() => {
    setAnalysisResponses({});
    setShareMessage('');
  }, [selectedRace?.id]);

  const handlePlanChange = useCallback((phaseId: string, next: StrategyPlanFields) => {
    setStrategyPlans((prev) => ({
      ...prev,
      [phaseId]: next,
    }));
    setPlanSaveStatus((prev) => ({ ...prev, [phaseId]: 'saving' }));
    setPlanSaveError((prev) => ({ ...prev, [phaseId]: null }));

    if (selectedRaceId) {
      upsertStrategyEntry({ domain: 'sailracing', entityId: selectedRaceId, phase: phaseId, plan: next })
        .then(() => {
          setPlanSaveStatus((prev) => ({ ...prev, [phaseId]: 'idle' }));
        })
        .catch((err) => {
          console.warn('[RaceStrategyPlanner] failed to save plan', err);
          setPlanSaveStatus((prev) => ({ ...prev, [phaseId]: 'error' }));
          setPlanSaveError((prev) => ({ ...prev, [phaseId]: 'Could not save. Try again.' }));
        });
    } else {
      setPlanSaveStatus((prev) => ({ ...prev, [phaseId]: 'idle' }));
    }
  }, [selectedRaceId]);

  const handleRefreshSuggestion = useCallback(async () => {
    if (!selectedRace) return;
    try {
      setRefreshingAI(true);
      const aiMap = await generateAIStrategyFromEngine(selectedRace);
      setPhaseSuggestions(aiMap);

      if (selectedRaceId) {
        await Promise.all(
          Object.entries(aiMap).map(([phase, suggestion]) =>
            upsertStrategyEntry({ domain: 'sailracing', entityId: selectedRaceId, phase, aiSuggestion: suggestion })
          ),
        );
      }
    } catch (error) {
      console.warn('[RaceStrategyPlanner] AI refresh failed, falling back', error);
      const fallbackMap = buildAllPhaseSuggestions(selectedRace);
      setPhaseSuggestions(fallbackMap);
      if (selectedRaceId) {
        await Promise.all(
          Object.entries(fallbackMap).map(([phase, suggestion]) =>
            upsertStrategyEntry({ domain: 'sailracing', entityId: selectedRaceId, phase, aiSuggestion: suggestion }).catch((err) =>
              console.warn('[RaceStrategyPlanner] failed to persist fallback AI suggestion', err),
            )
          ),
        );
      }
    }
    finally {
      setRefreshingAI(false);
    }
  }, [selectedRace, selectedRaceId]);

  const handleExecutionStart = useCallback(() => {
    setTrackingActive(true);
  }, []);

  const handleExecutionStop = useCallback(() => {
    setTrackingActive(false);
    setLastTrackCompletedAt(new Date().toISOString());
  }, []);

  const handleShareMessageChange = useCallback((value: string) => {
    setShareMessage(value);
  }, []);

  const handleSendShare = useCallback(() => {
    logger.debug('[ShareTab] send briefing', {
      raceId: selectedRaceId,
      excerpt: shareMessage.slice(0, 120),
    });
  }, [selectedRaceId, shareMessage]);

  // Generate highlight event from selected race
  // Removed to hide the "Next Event" section
  const highlightEvent: HighlightEvent | undefined = undefined;

  // Quick actions
  const quickActions = RACE_ACTIONS.map((action) => ({
    ...action,
    onPress: () => logger.debug('[RaceAction]', action.id),
  }));

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading races...</Text>
      </View>
    );
  }

  return (
    <>
      <UnifiedDomainDashboard
        items={races}
        selectedItemId={selectedRaceId}
        onItemSelect={setSelectedRaceId}
        renderCard={(race: RaceWithStatus) => <RaceCard {...getRaceCardProps(race)} />}
        carouselTitle="Your Races"
        carouselSubtitle={`${races.length} ${races.length === 1 ? 'race' : 'races'} scheduled`}
        cardWidth={320}
        cardSpacing={32}
        onAddPress={() => setShowAddModal(true)}
        addCardLabel="Add Race"
        addCardSubtitle="Create a new race entry"
        tabBarLabels={RACE_TAB_LABELS}
        quickActions={quickActions}
        highlightEvent={highlightEvent}
        upcomingEvents={[]}
        renderGatherTab={() => (
          <RaceStrategyPlanner
            race={selectedRace}
            plans={strategyPlans}
            suggestions={personalizedPhaseSuggestions}
            onPlanChange={handlePlanChange}
            onRefreshSuggestion={handleRefreshSuggestion}
            planStatus={planSaveStatus}
            planErrors={planSaveError}
            refreshingAI={refreshingAI}
          />
        )}
        renderShareTab={() => (
          <CollaborationBroadcastConsole
            title="Share with crew, fleet, and coaches"
            subtitle="Keep everyone aligned with the latest plan, track, and media."
            briefingContext={shareContextPills}
            audiences={shareAudiences}
            message={shareMessage}
            onMessageChange={handleShareMessageChange}
            templates={shareTemplates}
            attachments={shareAttachments}
            onSend={handleSendShare}
          />
        )}
        renderCreateTab={() => (
          <WorkflowExecutionConsole
            title={selectedRace ? `${selectedRace.name} • Race console` : 'Race execution'}
            subtitle="Start the countdown, capture GPS, and cue AI scoring for the start & legs."
            contextPills={executionContextPills}
            sequenceOptions={sequenceOptions}
            liveMetrics={liveTrackingMetrics}
            insights={executionInsights}
            shareTargets={shareTargets}
            evidencePrompts={evidencePrompts}
            onSequenceStart={handleExecutionStart}
            onSequenceStop={handleExecutionStop}
          />
        )}
        renderReflectTab={() => (
          <PostEventAnalysisConsole
            title="Analyze & debrief"
            subtitle="Log how the race actually unfolded so AI can score adherence."
            context={analysisContext}
            weatherSummary={analysisWeatherSummary}
            strategySummary={selectedRace?.ai_strategy || undefined}
            trackSummary={trackSummary}
            metrics={analysisMetrics}
            questions={phaseQuestions}
            responses={analysisResponses}
            onResponseChange={handleAnalysisResponseChange}
            improvementIdeas={improvementIdeas}
            aiSummary={aiRecap ?? undefined}
            callToAction={{
              label: 'Share recap with coach',
              helper: 'Sends the analysis + AI notes to your BetterAt coach',
              onPress: () => logger.debug('[PostRaceAnalysis] share recap'),
            }}
          />
        )}
      >
        {/* Race-specific content */}
        {selectedRace && (selectedRace.metadata?.wind || selectedRace.ai_strategy || selectedRace.metadata?.vhf_channel) && (
          <>
            {/* Weather Conditions */}
            {selectedRace.metadata?.wind && (
              <View style={styles.weatherCard}>
                <Text style={styles.cardTitle}>Weather Conditions</Text>
                <View style={styles.weatherGrid}>
                  <View style={styles.weatherItem}>
                    <Text style={styles.weatherLabel}>Wind</Text>
                    <Text style={styles.weatherValue}>
                      {selectedRace.metadata.wind.direction} {selectedRace.metadata.wind.speedMin}-{selectedRace.metadata.wind.speedMax}kts
                    </Text>
                  </View>
                  {selectedRace.metadata.tide && (
                    <View style={styles.weatherItem}>
                      <Text style={styles.weatherLabel}>Tide</Text>
                      <Text style={styles.weatherValue}>
                        {selectedRace.metadata.tide.state} {selectedRace.metadata.tide.height}m
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Race Strategy */}
            {selectedRace.ai_strategy && (
              <View style={styles.strategyCard}>
                <Text style={styles.cardTitle}>Race Strategy</Text>
                <Text style={styles.strategyText}>{selectedRace.ai_strategy}</Text>
              </View>
            )}

            {/* Communications */}
            {selectedRace.metadata?.vhf_channel && (
              <View style={styles.commsCard}>
                <Text style={styles.cardTitle}>Communications</Text>
                <View style={styles.commsRow}>
                  <Text style={styles.commsLabel}>VHF Channel:</Text>
                  <Text style={styles.commsValue}>{selectedRace.metadata.vhf_channel}</Text>
                </View>
                {selectedRace.metadata.warning_signal && (
                  <View style={styles.commsRow}>
                    <Text style={styles.commsLabel}>Warning Signal:</Text>
                    <Text style={styles.commsValue}>{selectedRace.metadata.warning_signal}</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </UnifiedDomainDashboard>

      {/* Add Race Modal */}
      <SimpleAddRaceModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onRaceAdded={fetchRaces}
      />
    </>
  );
}

type PlannerProps = {
  race?: RaceWithStatus | null;
  plans: Record<string, StrategyPlanFields>;
  suggestions: Record<string, StrategyAISuggestion | null>;
  onPlanChange: (phaseId: string, plan: StrategyPlanFields) => void;
  onRefreshSuggestion: (phaseId: string) => void;
  planStatus: Record<string, 'idle' | 'saving' | 'error'>;
  planErrors: Record<string, string | null>;
  refreshingAI: boolean;
};

const RaceStrategyPlanner: React.FC<PlannerProps> = ({ race, plans, suggestions, onPlanChange, onRefreshSuggestion, planStatus, planErrors, refreshingAI }) => {
  if (!race) {
    return <Text style={styles.strategyPlaceholder}>Select a race to begin crafting your tactical brief.</Text>;
  }

  const collaborationModel = useMemo(() => buildFleetCollaborationModel(race, plans, suggestions), [race, plans, suggestions]);
  const crewBrief = useMemo(() => buildCrewBrief(race, plans, suggestions), [race, plans, suggestions]);
  const handleJoinFleet = useCallback(() => {
    if (race) {
      logger.debug('[RaceStrategyPlanner] Join fleet tapped', { raceId: race.id, venue: race.venue_name });
    }
  }, [race]);
  const handleShareWithCrew = useCallback(async () => {
    if (!crewBrief) return;
    try {
      await Share.share({
        title: `${race.name ?? 'Race'} crew brief`,
        message: crewBrief.message,
      });
      logger.debug('[RaceStrategyPlanner] Shared crew brief', { raceId: race.id });
    } catch (error: any) {
      if (error?.message?.includes('dismissed') || error?.message?.includes('cancelled')) {
        return;
      }
      logger.warn('[RaceStrategyPlanner] Crew brief share failed', error);
    }
  }, [crewBrief, race.id, race.name]);

  return (
    <View style={styles.strategyContainer}>
      <Text style={styles.strategyIntro}>
        Flesh out your plan by phase. Anthropic intel updates automatically as weather shifts; log your commitment so the crew knows the playbook.
      </Text>
      {crewBrief ? (
        <View style={styles.crewShareCard}>
          <View style={styles.crewShareHeader}>
            <Text style={styles.crewShareEyebrow}>Crew broadcast</Text>
            <Text style={styles.crewShareMeta}>{crewBrief.meta}</Text>
          </View>
          <Text style={styles.crewSharePreview}>{crewBrief.preview}</Text>
          <TouchableOpacity style={styles.crewShareButton} onPress={handleShareWithCrew}>
            <Text style={styles.crewShareButtonText}>Share pre-race strategy</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {collaborationModel ? (
        <StrategyCollaborationPanel
          heading={collaborationModel.heading}
          description={collaborationModel.description}
          connectionLabel={collaborationModel.connectionLabel}
          connectionDescription={collaborationModel.connectionDescription}
          collaborators={collaborationModel.collaborators}
          topics={collaborationModel.topics}
          onConnect={handleJoinFleet}
        />
      ) : null}
      {STRATEGY_PHASES.map((phase) => (
        <StrategyPhaseCard
          key={phase.id}
          phaseId={phase.id}
          title={phase.title}
          subtitle={phase.subtitle}
          aiSuggestion={suggestions?.[phase.id]}
          plan={plans?.[phase.id] ?? createEmptyPlan()}
          onPlanChange={onPlanChange}
          onRefreshSuggestion={onRefreshSuggestion}
          saving={planStatus?.[phase.id] === 'saving'}
          errorMessage={planErrors?.[phase.id] ?? null}
          refreshInFlight={refreshingAI}
          theme={SAIL_STRATEGY_THEME}
          icon={SAIL_PHASE_ICONS[phase.id]}
        />
      ))}
    </View>
  );
};

function buildAllPhaseSuggestions(race: RaceWithStatus): Record<string, StrategyAISuggestion> {
  const map: Record<string, StrategyAISuggestion> = {};
  STRATEGY_PHASES.forEach((phase) => {
    map[phase.id] = buildPhaseSuggestion(phase.id, race);
  });
  return map;
}

function buildFleetCollaborationModel(
  race: RaceWithStatus,
  plans: Record<string, StrategyPlanFields>,
  suggestions: Record<string, StrategyAISuggestion | null>,
): StrategyCollaborationPanelProps | null {
  if (!race) return null;

  const windMeta = race.metadata?.wind;
  const tideMeta = race.metadata?.tide;
  const fleetLabel = race.metadata?.fleet_name || `${race.metadata?.boat_type ?? 'One-design'} fleet`;
  const connectionLabel = `Join the ${fleetLabel}`;
  const planFor = (phaseId: string, field: keyof StrategyPlanFields, fallback: string) => {
    const value = plans?.[phaseId]?.[field];
    return value?.trim() ? value.trim() : fallback;
  };

  const collaborators = [
    {
      id: 'orion-36',
      name: 'Orion 36 • Vince',
      subtitle: 'Clearwater Bay 36 trim lead',
      status: 'Synced 5 min ago',
      planFocus: '18 uppers / lowers 9.5',
    },
    {
      id: 'talia',
      name: 'Talia • Navigator',
      subtitle: 'Focus on ebb current lanes',
      status: 'Needs brief',
      planFocus: 'Favor eastern relief',
    },
    {
      id: 'silverwing',
      name: 'Silverwing • Coach',
      subtitle: 'Shared polar deltas + heel data',
      status: 'Reviewing',
      planFocus: 'Send CCTV of rig before dock-out',
    },
    {
      id: 'fleet-intel',
      name: 'Fleet Intel Bot',
      subtitle: 'Aggregates matched hull updates',
      status: 'Auto-sync',
      planFocus: 'Push new tide overlays',
    },
  ];

  const windRange = windMeta ? `${windMeta.direction} ${windMeta.speedMin ?? windMeta.speed ?? 12}-${windMeta.speedMax ?? windMeta.speed ?? 16}kts` : 'posted range';
  const tideSummary = tideMeta ? `${tideMeta.state} • ${tideMeta.direction}` : 'log tide intel';

  const topics = [
    {
      id: 'rig',
      title: 'Rig & ballast check',
      detail: 'Compare headstay, lowers, and ballast moves with the boats rated closest to you before buttoning up the dock box.',
      ourPlanLabel: 'Your setup',
      ourPlan: planFor('rig', 'what', 'Log rig trim to unlock comparisons'),
      peerPlanLabel: `${fleetLabel} baseline`,
      peerPlan: '18 uppers / lowers 9.5 with -0.5 turn on the uppers for puffs',
      peerSource: 'Shared by Orion 36 (Vince)',
      callout: 'Fleet asked for your vang marks once you confirm final bend numbers.',
      tags: ['Rig tuning', windRange],
    },
    {
      id: 'wind-current',
      title: 'Wind + current lane pairing',
      detail: 'Fleet channel is surfacing the fastest combination of breeze lines and relief from Clearwater Bay gap to mark 1.',
      ourPlanLabel: 'Your read',
      ourPlan: planFor('upwind', 'why', 'Capture where you want to put the boat in the first beat'),
      peerPlanLabel: 'Peer signal',
      peerPlan: suggestions?.upwind?.summary ?? 'Pressure ladder through Kowloon side, tack on veer at 5 min.',
      peerSource: 'Pinged from Silverwing navigator',
      callout: `Fleet intel shows ${windRange} with ${tideSummary}. Borrow their tracker overlay to stress-test your lane.`,
      tags: ['Wind', 'Current'],
    },
    {
      id: 'start',
      title: 'Start line choreography',
      detail: 'Huddle with matched boats on triggers, burn lanes, and who is protecting which end so everyone can stagger practice runs.',
      ourPlanLabel: 'Your burn math',
      ourPlan: planFor('start', 'how', 'Capture timing + communication cues'),
      peerPlanLabel: 'Fleet support',
      peerPlan: 'Fleet bot suggests: burn 2:10, protect pin to exit onto right shift',
      peerSource: 'Fleet Intel Bot • Clearwater 36s',
      callout: 'Tag another skipper if you need a final check on transit and current shear before 5-min.',
      tags: ['Start', 'Crew help'],
    },
  ];

  return {
    heading: 'Fleet intel exchange',
    description: `Strategize with ${fleetLabel} skippers also lining up for ${race.venue_name ?? 'this course'}.`,
    connectionLabel,
    connectionDescription: 'Join a fleet of similar sailboats to swap rig, wind, and current plans before you lock the playbook.',
    collaborators,
    topics,
  };
}

function buildCrewBrief(
  race: RaceWithStatus,
  plans: Record<string, StrategyPlanFields>,
  suggestions: Record<string, StrategyAISuggestion | null>,
): CrewBrief {
  const wind = race.metadata?.wind;
  const tide = race.metadata?.tide;
  const windRange = wind
    ? `${wind.direction ?? '—'} ${wind.speedMin ?? wind.speed ?? '?'}-${wind.speedMax ?? wind.speed ?? '?'}kts`
    : null;
  const tideLine = tide ? `${tide.state ?? '—'} ${tide.direction ?? ''}`.trim() : null;
  const venue = race.venue_name ?? 'Course TBD';
  const warning = race.metadata?.warning_signal;
  const start = race.start_time ?? warning ?? null;
  const meta = [venue, start ? `Warning ${start}` : null, windRange].filter(Boolean).join(' • ') || venue;

  const header = `${race.name ?? 'Upcoming race'} • ${venue}`;
  const lines: string[] = [header];
  const conditionLine = [windRange ? `Wind ${windRange}` : null, tideLine ? `Tide ${tideLine}` : null]
    .filter(Boolean)
    .join(' | ');
  if (conditionLine) {
    lines.push(conditionLine);
  }
  lines.push('Crew focus:');

  const sectionConfig: Array<{ id: string; label: string; fallback: string }> = [
    { id: 'rig', label: 'Rig + ballast', fallback: 'Log rig plan' },
    { id: 'pre_race', label: 'Recon / dock', fallback: 'Capture recon tasks' },
    { id: 'start', label: 'Start', fallback: 'Note burn + lane' },
    { id: 'upwind', label: 'Upwind', fallback: 'Pressure + current plan' },
    { id: 'downwind', label: 'Downwind', fallback: 'VMG targets' },
    { id: 'finish', label: 'Finish', fallback: 'Final approach' },
  ];

  const previewLines: string[] = [];

  sectionConfig.forEach(({ id, label, fallback }) => {
    const plan = plans?.[id];
    const summary = plan?.what?.trim() || suggestions?.[id]?.summary;
    const how = plan?.how?.trim() || suggestions?.[id]?.bullets?.[0];
    if (!summary && !how) {
      return;
    }
    const detail = summary || how || fallback;
    const extended = summary && how ? `${detail} — ${how}` : detail;
    const entry = `${label}: ${extended}`;
    lines.push(`- ${entry}`);
    if (previewLines.length < 3) {
      previewLines.push(entry);
    }
  });

  if (race.metadata?.vhf_channel) {
    lines.push(`Comms: VHF ${race.metadata.vhf_channel}`);
  }
  if (warning) {
    lines.push(`Warning signal ${warning}`);
  }

  const message = lines.join('\n');
  const preview = previewLines.join(' • ') || 'Add at least one phase plan to broadcast it to the crew.';

  return {
    message,
    preview,
    meta,
  };
}

async function generateAIStrategyFromEngine(race: RaceWithStatus) {
  const venueId = race.venue_id || 'hong-kong';
  let conditions = buildConditionsFromRace(race);
  const venueName = race.venue_name || 'Victoria Harbour';
  try {
    const weather = await RaceWeatherService.fetchWeatherByVenueName(
      venueName,
      race.race_date || new Date().toISOString(),
      { warningSignalTime: race.start_time || null },
    );
    if (weather) {
      conditions = buildConditionsFromWeatherMetadata(weather);
    }
  } catch (err) {
    console.warn('[RaceStrategyPlanner] Weather fetch failed, using metadata', err);
  }
  const raceContext = {
    raceName: race.name || 'Upcoming Race',
    raceDate: new Date(race.race_date || new Date().toISOString()),
    raceTime: race.start_time || '10:00:00',
    boatType: race.metadata?.boat_type,
    fleetSize: race.metadata?.fleet_size,
    importance: 'series' as const,
  };

  const aiStrategy = await raceStrategyEngine.generateVenueBasedStrategy(venueId, conditions, raceContext);
  const phaseMap = mapRaceStrategyToPhases(aiStrategy);

  try {
    const rigSuggestion = await buildRigPhaseSuggestionFromTuning(race);
    if (rigSuggestion) {
      phaseMap['rig'] = rigSuggestion;
    }
  } catch (error) {
    logger.warn('[RaceStrategyPlanner] Rig tuning suggestion failed', error);
  }

  return phaseMap;
}

function buildConditionsFromRace(race: RaceWithStatus): RaceConditions {
  const windMetadata = race.metadata?.wind;
  const tideMetadata = race.metadata?.tide;

  const directionToDegrees: Record<string, number> = {
    N: 0,
    NE: 45,
    E: 90,
    SE: 135,
    S: 180,
    SW: 225,
    W: 270,
    NW: 315,
  };

  const parseDirection = (dir?: string) => {
    if (!dir) return 0;
    const upper = dir.toUpperCase();
    if (directionToDegrees[upper] !== undefined) {
      return directionToDegrees[upper];
    }
    const numeric = Number(dir);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  return {
    wind: {
      speed: windMetadata?.speedMin ?? windMetadata?.speed ?? 12,
      direction: parseDirection(windMetadata?.direction ?? 'NE'),
      forecast: {
        nextHour: { speed: (windMetadata?.speedMax ?? 14), direction: parseDirection(windMetadata?.direction ?? 'NE') },
        nextThreeHours: { speed: (windMetadata?.speedMax ?? 14), direction: parseDirection(windMetadata?.direction ?? 'NE') },
      },
      confidence: 0.7,
    },
    current: {
      speed: tideMetadata?.speed ?? 0.8,
      direction: parseDirection(tideMetadata?.direction ?? 'N'),
      tidePhase: (tideMetadata?.state === 'flooding' ? 'flood' : tideMetadata?.state === 'ebbing' ? 'ebb' : 'slack'),
    },
    waves: {
      height: race.metadata?.wave_height ?? 0.8,
      period: race.metadata?.wave_period ?? 6,
      direction: parseDirection(race.metadata?.wave_direction ?? 'NE'),
    },
    visibility: race.metadata?.visibility ?? 8,
    temperature: race.metadata?.temperature ?? 24,
    weatherRisk: race.metadata?.weather_risk ?? 'low',
  } as RaceConditions;
}

function buildConditionsFromWeatherMetadata(weather: RaceWeatherMetadata): RaceConditions {
  const parseDirection = (dir?: string) => {
    const lookup: Record<string, number> = {
      N: 0,
      NE: 45,
      E: 90,
      SE: 135,
      S: 180,
      SW: 225,
      W: 270,
      NW: 315,
    };
    if (!dir) return 0;
    const upper = dir.toUpperCase();
    if (lookup[upper] !== undefined) return lookup[upper];
    const numeric = Number(dir);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  return {
    wind: {
      speed: weather.wind.speedMin,
      direction: parseDirection(weather.wind.direction),
      forecast: {
        nextHour: { speed: weather.wind.speedMax, direction: parseDirection(weather.wind.direction) },
        nextThreeHours: { speed: weather.wind.speedMax, direction: parseDirection(weather.wind.direction) },
      },
      confidence: weather.confidence ?? 0.8,
    },
    current: {
      speed: 1,
      direction: parseDirection(weather.tide?.direction ?? 'N'),
      tidePhase: weather.tide?.state === 'ebbing' ? 'ebb' : weather.tide?.state === 'flooding' ? 'flood' : 'slack',
    },
    waves: {
      height: 1,
      period: 6,
      direction: parseDirection(weather.wind.direction),
    },
    visibility: 8,
    temperature: 24,
    weatherRisk: 'low',
  } as RaceConditions;
}

function mapRaceStrategyToPhases(strategy: RaceStrategy): Record<string, StrategyAISuggestion> {
  const suggestions: Record<string, StrategyAISuggestion> = {};
  const s = strategy.strategy;

  const recToSuggestion = (rec: any, fallbackSummary: string): StrategyAISuggestion => {
    const bullets = [rec?.theory, rec?.execution, rec?.rationale]
      .filter(Boolean)
      .map((text: string) => text.trim());
    if (!bullets.length && rec?.conditions) {
      bullets.push(...rec.conditions);
    }
    return {
      summary: rec?.action || fallbackSummary,
      bullets: bullets.length ? bullets : [fallbackSummary],
      confidence: mapConfidenceScore(rec?.confidence),
      dataPoints: rec?.conditions,
    };
  };

  suggestions['rig'] = {
    summary: s.overallApproach,
    bullets: [s.overallApproach, 'Tune rig for projected breeze window', 'Align inventory with course rhythm'],
    confidence: 'medium',
  };

  suggestions['pre_race'] = {
    summary: 'Pre-race strategy run: sail the course + lock timing cues',
    bullets: [
      s.startStrategy?.theory ?? 'Sail a mini-lap to validate shifts and compression zones before sequence',
      'Ping committee boat + pin to lock burn time and confirm start-line transit',
      'Check both laylines for set/drift and rehearse bail-out lanes with the bow team',
    ],
    confidence: 'medium',
  };

  suggestions['start'] = recToSuggestion(s.startStrategy, 'Dial the start execution');

  const firstBeat = Array.isArray(s.beatStrategy) ? s.beatStrategy[0] : null;
  suggestions['upwind'] = recToSuggestion(firstBeat, 'Structure the upwind leg around pressure and tide');

  const firstMark = Array.isArray(s.markRoundings) ? s.markRoundings[0] : null;
  suggestions['top_mark'] = recToSuggestion(firstMark, 'Layline + hoist choreography');

  const runRec = Array.isArray(s.runStrategy) ? s.runStrategy[0] : null;
  suggestions['downwind'] = recToSuggestion(runRec, 'VMG positioning plan');

  const secondMark = Array.isArray(s.markRoundings) && s.markRoundings.length > 1 ? s.markRoundings[1] : firstMark;
  suggestions['bottom_mark'] = recToSuggestion(secondMark, 'Drop + exit strategy');

  suggestions['finish'] = recToSuggestion(s.finishStrategy, 'Secure the finish lane');

  return suggestions;
}

function mapConfidenceScore(value?: number): StrategyAISuggestion['confidence'] {
  if (typeof value !== 'number') return undefined;
  if (value >= 0.7 || value >= 70) return 'high';
  if (value >= 0.4 || value >= 40) return 'medium';
  return 'low';
}

async function buildRigPhaseSuggestionFromTuning(
  race: RaceWithStatus
): Promise<StrategyAISuggestion | null> {
  const { classId, className } = extractRaceClassReference(race);
  if (!classId && !className) {
    logger.debug('[RigPhase] No class reference available for tuning fetch');
    return null;
  }

  const wind = race.metadata?.wind;
  const avgWind =
    typeof wind?.speed === 'number'
      ? wind.speed
      : typeof wind?.speedMin === 'number' && typeof wind?.speedMax === 'number'
        ? (wind.speedMin + wind.speedMax) / 2
        : wind?.speedMin ?? wind?.speedMax;

  try {
    const [recommendation] = await raceTuningService.getRecommendations({
      classId: classId ?? undefined,
      className: className ?? undefined,
      averageWindSpeed: avgWind ?? undefined,
      windMin: wind?.speedMin,
      windMax: wind?.speedMax,
      windDirection: wind?.direction ? parseDirectionLabelToDegrees(wind.direction) : undefined,
      pointsOfSail: 'upwind',
      limit: 1,
    });

    if (!recommendation) {
      logger.debug('[RigPhase] RaceTuningService returned no recommendation');
      return null;
    }

    const bullets = buildRigBulletsFromRecommendation(recommendation);
    return {
      summary:
        recommendation.sectionTitle ||
        recommendation.conditionSummary ||
        'Dial rig & sail plan to match forecast window',
      bullets: bullets.length ? bullets : ['Validate rig tension vs. expected breeze window.'],
      confidence: mapConfidenceScore(recommendation.confidence),
      dataPoints: [
        recommendation.conditionSummary,
        recommendation.guideTitle ? `Guide: ${recommendation.guideTitle}` : null,
        recommendation.guideSource ? `Source: ${recommendation.guideSource}` : null,
      ].filter(Boolean) as string[],
    };
  } catch (error) {
    logger.warn('[RigPhase] Failed to fetch tuning recommendation', error);
    return null;
  }
}

function buildRigBulletsFromRecommendation(recommendation: Awaited<ReturnType<typeof raceTuningService.getRecommendations>>[number]): string[] {
  const bullets: string[] = [];
  if (recommendation.conditionSummary) {
    bullets.push(recommendation.conditionSummary);
  }
  if (recommendation.weatherSpecificNotes?.length) {
    bullets.push(...recommendation.weatherSpecificNotes);
  }

  const topSettings = recommendation.settings?.slice(0, 3) ?? [];
  topSettings.forEach(setting => {
    if (setting?.label && setting?.value) {
      bullets.push(`${setting.label}: ${setting.value}`);
    }
  });

  if (recommendation.notes) {
    bullets.push(recommendation.notes);
  }
  if (recommendation.caveats?.length) {
    bullets.push(...recommendation.caveats);
  }

  return bullets.filter(Boolean);
}

function extractRaceClassReference(race: RaceWithStatus): { classId?: string | null; className?: string | null } {
  const metadata = race.metadata ?? {};
  return {
    classId: metadata.boat_class_id || metadata.class_id || metadata?.boat?.class_id || race.boat_id || null,
    className:
      metadata.boat_class ||
      metadata.class_name ||
      metadata.boat_type ||
      metadata?.boat?.class_name ||
      null,
  };
}

function parseDirectionLabelToDegrees(direction?: string): number | undefined {
  if (!direction) return undefined;
  const dirMap: Record<string, number> = {
    N: 0,
    NNE: 22.5,
    NE: 45,
    ENE: 67.5,
    E: 90,
    ESE: 112.5,
    SE: 135,
    SSE: 157.5,
    S: 180,
    SSW: 202.5,
    SW: 225,
    WSW: 247.5,
    W: 270,
    WNW: 292.5,
    NW: 315,
    NNW: 337.5,
  };
  const upper = direction.toUpperCase();
  if (dirMap[upper] !== undefined) return dirMap[upper];
  const numeric = Number(direction);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function buildPhaseSuggestion(phaseId: string, race: RaceWithStatus): StrategyAISuggestion {
  const metadata = race.metadata || {};
  const wind = metadata.wind;
  const tide = metadata.tide;
  const venue = race.venue_name || 'course';

  const windLabel = wind ? `${wind.direction} ${wind.speedMin}-${wind.speedMax}kts` : 'variable breeze';
  const tideLabel = tide ? `${tide.state} tide at ${tide.height ?? '?'}m` : 'standard tide cycle';

  const baseBullets = [
    wind ? `Expect ${windLabel} for most of the leg.` : 'Monitor live wind readings for final adjustments.',
    tide ? `Tide: ${tideLabel}.` : 'Check tide boards before the start for set/ drift.',
  ];

  switch (phaseId) {
    case 'rig':
      return {
        summary: `Target a rig tune that keeps the platform balanced for ${windLabel}.`,
        bullets: [
          wind ? `Set shrouds for ${wind.speedMin >= 15 ? 'heavy-air stability' : 'medium-power acceleration'}.` : 'Dial base tune and re-check after first beat.',
          'Confirm sail inventory and label likely headsail/ kite selection.',
        ],
        confidence: 'medium',
      };
    case 'pre_race':
      return {
        summary: `Run the on-water rehearsal at ${venue} before the sequence.`,
        bullets: [
          wind ? `Sail a mini-course to feel the ${windLabel} rhythm and note compression zones.` : 'Sail a short lap to read the pressure map.',
          tide ? `Ping the RC boat and pin while the ${tideLabel} pushes burn time.` : 'Ping committee + pin to lock burn time and transit.',
          'Check both laylines and rehearse bailout lanes so the crew knows the escape routes.',
        ],
        confidence: 'medium',
      };
    case 'start':
      return {
        summary: 'Establish the start play to own the favored lane.',
        bullets: [
          wind ? `Plan to start on the ${wind.direction.startsWith('N') ? 'right' : 'left'} side if pressure stays ${wind.direction}.` : 'Standby for AP flag updates and track gusts.',
          tide ? `Account for ${tide.state} set pushing the fleet ${tide.direction ?? ''}.` : 'Recheck current at centerline.',
        ],
        confidence: 'high',
      };
    case 'upwind':
      return {
        summary: 'Define the first beat priorities.',
        bullets: [
          wind ? `Expect shifts of ±5°; sail the longer tack toward ${wind.direction}.` : 'Sail high mode until we read the first oscillation.',
          'Assign callouts for knees, traffic, and pressure updates every 30 seconds.',
        ],
        confidence: 'medium',
      };
    case 'top_mark':
      return {
        summary: 'Organize the layline and hoist choreography.',
        bullets: [
          'Call layline three lengths out; tactician confirms cross/duck decisions.',
          'Bow + pit own halyard tensions, trimmers prep vang ease schedule.',
        ],
        confidence: 'medium',
      };
    case 'downwind':
      return {
        summary: 'Pick the pressure lanes down the run.',
        bullets: [
          wind ? `Look for puffs rolling in from ${wind.direction}.` : 'Hunt for darker water and sail lower in pressure.',
          'Commit to early gybe if leverage builds over 150m.',
        ],
        confidence: 'medium',
      };
    case 'bottom_mark':
      return {
        summary: 'Plan the drop + transition into the next beat.',
        bullets: [
          'Confirm drop side two minutes out and rehearse comms.',
          tide ? `Beware ${tide.state} set when selecting gate.` : 'Prioritize clean exit with low traffic.',
        ],
        confidence: 'medium',
      };
    case 'finish':
      return {
        summary: 'Lock the finish and immediate recovery.',
        bullets: [
          'Assign timekeeper for finish call and note protest windows.',
          'Begin debrief checklist: sail damage, electronics notes, next-race adjustments.',
        ],
        confidence: 'medium',
      };
    default:
      return {
        summary: `Outline tactics for ${phaseId}.`,
        bullets: baseBullets,
        confidence: 'low',
      };
  }
}

function mergeSuggestionsWithInsights(
  suggestions: Record<string, StrategyAISuggestion>,
  insights: PhaseInsightMap
): Record<string, StrategyAISuggestion> {
  if (!suggestions || !Object.keys(suggestions).length || !Object.keys(insights).length) {
    return suggestions;
  }

  const mergedEntries = Object.entries(suggestions).map(([phaseId, suggestion]) => {
    const insight = insights[phaseId];
    if (!suggestion || !insight) {
      return [phaseId, suggestion];
    }

    const bullets = Array.isArray(suggestion.bullets) ? [...suggestion.bullets] : [];

    if (insight.pattern) {
      bullets.push(buildPatternBullet(insight.pattern));
    }

    if (insight.aiSuggestion) {
      bullets.push(insight.aiSuggestion);
    }

    return [phaseId, { ...suggestion, bullets }];
  });

  return Object.fromEntries(mergedEntries);
}

function buildPatternBullet(pattern: PerformancePattern): string {
  const avgLabel = typeof pattern.average === 'number' ? pattern.average.toFixed(1) : 'n/a';
  const trendSymbol =
    pattern.trend === 'improving'
      ? '↗ improving'
      : pattern.trend === 'declining'
        ? '↘ slipping'
        : '↔ steady';
  const base = `${pattern.label} history: avg ${avgLabel}/5 (${trendSymbol}).`;
  const needsCoaching =
    typeof pattern.average === 'number' ? pattern.average < 3.8 || pattern.trend === 'declining' : true;
  const message = pattern.message ? ` ${pattern.message.trim()}` : '';

  if (needsCoaching) {
    return `${base} Persistent gap—drill this every dock-out:${message || ' practice timing until it is automatic.'}`;
  }

  return `${base} Keep leaning on this strength and codify it in your phase brief.${message ? ` ${message}` : ''}`;
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  weatherGrid: {
    gap: 12,
  },
  weatherItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  weatherValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  strategyCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  strategyText: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
  },
  commsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commsLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  commsValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  strategyContainer: {
    paddingVertical: 20,
    gap: 12,
  },
  strategyIntro: {
    fontSize: 14,
    color: '#6B6258',
    marginBottom: 8,
  },
  crewShareCard: {
    borderWidth: 1,
    borderColor: '#F2D4C4',
    backgroundColor: '#FFF7F1',
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
  },
  crewShareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  crewShareEyebrow: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#B45309',
    fontWeight: '600',
  },
  crewShareMeta: {
    fontSize: 12,
    color: '#92400E',
  },
  crewSharePreview: {
    fontSize: 14,
    color: '#7C2D12',
    lineHeight: 20,
    marginBottom: 12,
  },
  crewShareButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#EA580C',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  crewShareButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  strategyPlaceholder: {
    fontSize: 14,
    color: '#8B7965',
    paddingVertical: 12,
  },
});
