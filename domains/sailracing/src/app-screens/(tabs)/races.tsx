/**
 * Races Screen - Horizontal Carousel Pattern
 *
 * This is the signature UX pattern for RegattaFlow:
 * - Horizontal swipeable carousel of race cards at the top
 * - Selected card centers and shows inline detail expansion below
 * - Cards dim when unselected
 * - Detail canvas appears below carousel (not navigation)
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Dimensions,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@betterat/core';
import { supabase } from '@/services/supabase';
import { RaceCard, type RaceCardProps } from '@/components/races/RaceCard';
import { RaceOverviewCard } from '@/components/race-detail/RaceOverviewCard';
import { StrategyCard } from '@/components/race-detail/StrategyCard';
import { WeatherCard } from '@/components/race-detail/WeatherCard';
import { TimingCard } from '@/components/race-detail/TimingCard';
import { CommunicationsCard } from '@/components/race-detail/CommunicationsCard';
import { StartStrategyCard } from '@/components/race-detail/StartStrategyCard';
import { UpwindStrategyCard } from '@/components/race-detail/UpwindStrategyCard';
import { MarkRoundingCard } from '@/components/race-detail/MarkRoundingCard';
import { DownwindStrategyCard } from '@/components/race-detail/DownwindStrategyCard';
import { ExecutionEvaluationCard } from '@/components/race-detail/ExecutionEvaluationCard';
import { PostRaceAnalysisCard } from '@/components/race-detail/PostRaceAnalysisCard';
import { RaceDetailMapHero } from '@/components/race-detail/RaceDetailMapHero';
// Temporarily disabled until dependencies are fixed:
// import { WindWeatherCard } from '@/components/race-detail/WindWeatherCard';
// import { CourseCard } from '@/components/race-detail/CourseCard';
import { RaceWeatherService } from '@/services/RaceWeatherService';
import { createLogger } from '@/utils/logger';

const logger = createLogger('RacesScreen');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Card dimensions from RaceCard component
const CARD_WIDTH = 240;
const CARD_MARGIN = 12; // 6px on each side
const CARD_TOTAL_WIDTH = CARD_WIDTH + CARD_MARGIN * 2;

// Enable demo mode for testing (updated for cache bust)
const DEMO_MODE = true;

// Demo races for testing the carousel
const DEMO_RACES: Race[] = [
  {
    id: 'demo-1',
    name: 'Champ of Champs',
    venue_name: 'Royal Hong Kong Yacht Club',
    race_date: '2025-11-16',
    start_time: '15:00:00',
    metadata: {
      wind: { direction: 'NE', speedMin: 12, speedMax: 18 },
      tide: { state: 'flooding', height: 1.2, direction: 'N' },
      vhf_channel: '72',
      warning_signal: '14:55',
      first_start: '15:00',
      strategy: 'Start on port tack to catch the favorable current on the eastern shore. Wind expected to veer 10° right during the race.',
      weather_fetched_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-2',
    name: 'Croucher Series Race 5',
    venue_name: 'Repulse Bay',
    race_date: '2025-11-17',
    start_time: '13:30:00',
    metadata: {
      wind: { direction: 'E', speedMin: 8, speedMax: 14 },
      tide: { state: 'ebbing', height: 0.8, direction: 'S' },
      vhf_channel: '71',
      warning_signal: '13:25',
      first_start: '13:30',
      strategy: 'Light air race. Focus on boat speed and staying in the pressure. Avoid the western shore where wind tends to die.',
      weather_fetched_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-3',
    name: 'Bay Challenge',
    venue_name: 'Causeway Bay',
    race_date: '2025-11-10',
    start_time: '10:00:00',
    metadata: {
      wind: { direction: 'SE', speedMin: 15, speedMax: 22 },
      tide: { state: 'slack', height: 1.0 },
      vhf_channel: '72',
      warning_signal: '09:55',
      first_start: '10:00',
      strategy: 'Strong breeze expected. Consider reef early if gusts exceed 25 knots. Favor the right side of the course.',
      weather_fetched_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-4',
    name: 'Island Series Race 3',
    venue_name: 'Middle Island',
    race_date: '2025-11-23',
    start_time: '11:00:00',
    metadata: {
      wind: { direction: 'NW', speedMin: 10, speedMax: 16 },
      tide: { state: 'flooding', height: 1.5, direction: 'NE' },
      vhf_channel: '73',
      warning_signal: '10:55',
      first_start: '11:00',
      weather_fetched_at: new Date().toISOString(),
    },
  },
];

type Race = {
  id: string;
  name: string;
  venue_name: string;
  race_date: string;
  start_time: string;
  metadata?: any;
};

type RaceWithStatus = Race & {
  raceStatus: 'past' | 'next' | 'future';
};

export default function RacesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const carouselRef = useRef<ScrollView>(null);

  const [races, setRaces] = useState<RaceWithStatus[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate race status (past, next, future)
  const calculateRaceStatus = useCallback((race: Race): 'past' | 'next' | 'future' => {
    const raceDateTime = new Date(`${race.race_date}T${race.start_time || '00:00:00'}`);
    const now = new Date();

    if (raceDateTime < now) {
      return 'past';
    }

    // Find if this is the next upcoming race
    return 'future'; // Will be determined in the list processing
  }, []);

  // Fetch races from Supabase
  const fetchRaces = useCallback(async () => {
    try {
      let data: Race[];

      // Use demo data in demo mode
      if (DEMO_MODE) {
        logger.debug('[fetchRaces] Using demo data');
        console.log('🔍 [RACES_DEBUG] DEMO_MODE is TRUE');
        console.log('🔍 [RACES_DEBUG] DEMO_RACES length:', DEMO_RACES.length);
        console.log('🔍 [RACES_DEBUG] DEMO_RACES data:', JSON.stringify(DEMO_RACES, null, 2));
        data = DEMO_RACES;
      } else {
        if (!user?.id) {
          logger.debug('[fetchRaces] No user ID, skipping fetch');
          return;
        }

        logger.debug('[fetchRaces] Fetching races for user', user.id);

        const { data: dbData, error } = await supabase
          .from('regattas')
          .select('*')
          .eq('user_id', user.id)
          .order('race_date', { ascending: true })
          .order('start_time', { ascending: true });

        if (error) {
          logger.error('[fetchRaces] Error fetching races:', error);
          return;
        }

        if (!dbData || dbData.length === 0) {
          logger.debug('[fetchRaces] No races found');
          setRaces([]);
          return;
        }

        data = dbData;
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
          // This is the first upcoming race
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

      console.log('🔍 [RACES_DEBUG] racesWithStatus length:', racesWithStatus.length);
      console.log('🔍 [RACES_DEBUG] racesWithStatus data:', JSON.stringify(racesWithStatus.slice(0, 2), null, 2));

      setRaces(racesWithStatus);

      // Auto-select the next race
      if (nextRaceIndex >= 0 && !selectedRaceId) {
        console.log('🔍 [RACES_DEBUG] Auto-selecting next race at index:', nextRaceIndex);
        setSelectedRaceId(racesWithStatus[nextRaceIndex].id);
      } else if (racesWithStatus.length > 0 && !selectedRaceId) {
        console.log('🔍 [RACES_DEBUG] Auto-selecting first race');
        setSelectedRaceId(racesWithStatus[0].id);
      }

      logger.debug('[fetchRaces] Loaded races:', racesWithStatus.length);
    } catch (error) {
      logger.error('[fetchRaces] Unexpected error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, selectedRaceId]);

  // Initial fetch
  useEffect(() => {
    fetchRaces();
  }, [fetchRaces]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRaces();
  }, [fetchRaces]);

  // Handle race selection
  const handleSelectRace = useCallback((raceId: string, index: number) => {
    logger.debug('[handleSelectRace] Selected race:', raceId, 'at index:', index);
    setSelectedRaceId(raceId);

    // Scroll to center the selected card
    const scrollOffset = index * CARD_TOTAL_WIDTH - (SCREEN_WIDTH / 2 - CARD_TOTAL_WIDTH / 2);
    carouselRef.current?.scrollTo({
      x: Math.max(0, scrollOffset),
      animated: true,
    });
  }, []);

  // Convert race data to RaceCard props
  const getRaceCardProps = useCallback((race: RaceWithStatus): RaceCardProps => {
    const metadata = race.metadata || {};

    return {
      id: race.id,
      name: race.name || 'Untitled Race',
      venue: race.venue_name || 'No venue',
      date: race.race_date,
      startTime: race.start_time || '00:00',
      wind: metadata.wind || null,
      tide: metadata.tide || null,
      weatherStatus: metadata.weather_fetched_at ? 'available' : 'unavailable',
      strategy: metadata.strategy,
      critical_details: {
        vhf_channel: metadata.vhf_channel,
        warning_signal: metadata.warning_signal,
        first_start: metadata.first_start,
      },
      isPrimary: race.raceStatus === 'next',
      raceStatus: race.raceStatus,
      isSelected: selectedRaceId === race.id,
      isDimmed: selectedRaceId !== null && selectedRaceId !== race.id,
      showTimelineIndicator: race.raceStatus === 'next', // Show "now" bar for next race
      onSelect: () => handleSelectRace(race.id, races.indexOf(race)),
    };
  }, [selectedRaceId, handleSelectRace, races]);

  // Get selected race data for detail canvas
  const selectedRace = useMemo(() => {
    return races.find(r => r.id === selectedRaceId);
  }, [races, selectedRaceId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading races...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Races</Text>
          <Text style={styles.headerSubtitle}>
            {races.length} {races.length === 1 ? 'race' : 'races'} scheduled
          </Text>
        </View>

        {/* Horizontal Race Carousel */}
        <View style={styles.carouselSection}>
          <ScrollView
            ref={carouselRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_TOTAL_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            style={styles.carousel}
          >
            {(() => {
              console.log('🔍 [RENDER_DEBUG] About to render races. Count:', races.length);
              console.log('🔍 [RENDER_DEBUG] races array:', JSON.stringify(races.map(r => ({ id: r.id, name: r.name })), null, 2));
              return races.map((race, index) => {
                console.log(`🔍 [RENDER_DEBUG] Rendering race ${index}:`, race.id, race.name);
                const props = getRaceCardProps(race);
                console.log(`🔍 [RENDER_DEBUG] Props for race ${index}:`, JSON.stringify(props, null, 2));
                return (
                  <RaceCard
                    key={race.id}
                    {...props}
                  />
                );
              });
            })()}

            {/* Add Race CTA Card */}
            <Pressable
              style={styles.addRaceCard}
              onPress={() => {
                logger.debug('[AddRace] Navigating to add race screen');
                router.push('/race/add');
              }}
            >
              <View style={styles.addRaceIcon}>
                <Plus size={32} color="#3B82F6" strokeWidth={3} />
              </View>
              <Text style={styles.addRaceText}>Add Race</Text>
              <Text style={styles.addRaceSubtext}>Create a new race entry</Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Inline Detail Canvas */}
        {selectedRace && (
          <View style={styles.detailCanvas}>
            {/* Map Hero */}
            <RaceDetailMapHero
              race={{
                id: selectedRace.id,
                race_name: selectedRace.name,
                start_time: selectedRace.start_time,
                venue: {
                  name: selectedRace.venue_name,
                },
                racing_area_polygon: selectedRace.metadata?.racing_area_polygon,
                boat_class: selectedRace.metadata?.boat_class,
              }}
              racingAreaPolygon={selectedRace.metadata?.racing_area_polygon}
              compact={false}
            />

            {/* Race Overview */}
            <RaceOverviewCard
              raceId={selectedRace.id}
              raceName={selectedRace.name}
              startTime={selectedRace.start_time}
              venue={{ name: selectedRace.venue_name }}
              weather={selectedRace.metadata}
              boatClass={selectedRace.metadata?.boat_class}
            />

            {/* Wind & Weather */}
            {selectedRace.metadata?.wind && (
              <WeatherCard
                windConditions={{
                  speed: selectedRace.metadata.wind.speedMin,
                  direction: (() => {
                    const dirMap: Record<string, number> = {
                      'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
                      'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
                      'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
                      'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
                    };
                    return dirMap[selectedRace.metadata.wind.direction] || 0;
                  })(),
                  gusts: selectedRace.metadata.wind.speedMax,
                }}
                showLiveIndicator={false}
              />
            )}

            {/* AI Strategy */}
            <StrategyCard
              icon="lightbulb-on-outline"
              title="AI Strategy"
              status={selectedRace.metadata?.strategy ? 'ready' : 'not_set'}
              statusMessage={selectedRace.metadata?.strategy ? undefined : 'Tap to generate'}
              onAction={() => {
                logger.debug('[Strategy] Generate strategy for race', selectedRace.id);
                // TODO: Implement strategy generation
              }}
              actionLabel={selectedRace.metadata?.strategy ? 'Regenerate' : 'Generate'}
              actionIcon="magic-staff"
            >
              {selectedRace.metadata?.strategy ? (
                <Text style={{ fontSize: 14, color: '#334155', lineHeight: 22 }}>
                  {selectedRace.metadata.strategy}
                </Text>
              ) : (
                <Text style={{ fontSize: 14, color: '#94A3B8', fontStyle: 'italic' }}>
                  Generate an AI-powered race strategy based on weather conditions and venue characteristics.
                </Text>
              )}
            </StrategyCard>

            {/* Timing & Start Sequence */}
            <TimingCard
              startSequence={[
                { time: selectedRace.metadata?.warning_signal || '08:00', label: 'Warning Signal', type: 'warning' },
                { time: '08:04', label: 'Prep Signal', type: 'prep' },
                { time: selectedRace.metadata?.first_start || selectedRace.start_time, label: 'Start', type: 'start' },
              ]}
              signals={['Flag U', 'Black Flag']}
            />

            {/* Communications */}
            {selectedRace.metadata?.vhf_channel && (
              <CommunicationsCard
                vhfChannel={selectedRace.metadata.vhf_channel}
                contacts={[
                  { id: '1', name: 'Race Committee', role: 'Principal Race Officer', phone: '+1234567890' },
                ]}
              />
            )}

            {/* Start Strategy */}
            <StartStrategyCard
              raceId={selectedRace.id}
              raceName={selectedRace.name}
              raceStartTime={selectedRace.start_time}
              venueName={selectedRace.venue_name}
              weather={selectedRace.metadata}
            />

            {/* Upwind Strategy */}
            <UpwindStrategyCard
              raceId={selectedRace.id}
              raceName={selectedRace.name}
            />

            {/* Mark Rounding Strategy */}
            <MarkRoundingCard
              raceId={selectedRace.id}
              raceName={selectedRace.name}
            />

            {/* Downwind Strategy */}
            <DownwindStrategyCard
              raceId={selectedRace.id}
              raceName={selectedRace.name}
            />

            {/* On-Water Execution Evaluation */}
            <ExecutionEvaluationCard
              raceId={selectedRace.id}
              sailorId={user?.id || 'demo-sailor'}
            />

            {/* Post-Race Analysis */}
            <PostRaceAnalysisCard
              raceId={selectedRace.id}
              raceName={selectedRace.name}
              raceStartTime={selectedRace.start_time}
            />

            {/* TODO: Add more detail cards when dependencies are resolved:
                - WindWeatherCard (needs dependencies fixed)
                - CourseCard
                - RigTuningCard
                - CrewEquipmentCard
                - RaceDocumentsCard
            */}
          </View>
        )}

        {/* Empty State */}
        {races.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Races Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first race to get started with race preparation and strategy
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => {
                logger.debug('[EmptyState] Navigating to add race screen');
                router.push('/race/add');
              }}
            >
              <Text style={styles.emptyButtonText}>Add Your First Race</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
  },
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
  header: {
    padding: 20,
    paddingTop: 60, // Account for status bar
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  carouselSection: {
    marginVertical: 20,
  },
  carousel: {
    flexGrow: 0,
  },
  carouselContent: {
    paddingHorizontal: 12,
  },
  addRaceCard: {
    width: CARD_WIDTH,
    height: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  addRaceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  addRaceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  addRaceSubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  detailCanvas: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
