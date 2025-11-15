import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { DomainDashboardProps } from '@betterat/domain-sdk';
import { SegmentTabs } from '@betterat/ui';
import TimelineStrip from '@betterat/ui/components/shared/TimelineStrip';
import { useTimelineEvents } from '@betterat/core';
import theme from '../theme';
import RaceCard from '../components/RaceCard';
import RaceDetail from '../components/RaceDetail';
import RaceCardSkeleton from '../components/skeletons/RaceCardSkeleton';
import RaceDetailSkeleton from '../components/skeletons/RaceDetailSkeleton';
import AddRaceModal, { NewRaceData } from '../components/AddRaceModal';
import { createQuickRaceEvent, fetchRecentRaces } from '../services/raceService';
import type { RaceRow, RegattaRow } from '../services/raceService';
import { transformRacesToUI } from '../utils/transformRaceData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 280;
const CARD_SPACING = theme.spacing.xl;
const SKELETON_PLACEHOLDERS = ['race-skeleton-1', 'race-skeleton-2', 'race-skeleton-3'];

const QUICK_ACTIONS = [
  { id: 'import', label: 'Import', icon: '📅' },
  { id: 'ai-plan', label: 'AI Plan', icon: '🤖' },
  { id: 'quick-log', label: 'Quick Log', icon: '📋' },
  { id: 'practice', label: 'Practice', icon: '🎯' },
];

type TabKey = 'plan' | 'act' | 'analyze';

const TAB_OPTIONS = [
  { label: 'Plan', value: 'plan' },
  { label: 'Act', value: 'act' },
  { label: 'Analyze', value: 'analyze' },
];

interface RaceData {
  id: string;
  name: string;
  date: string;
  venue: string;
  weather: {
    windSpeed: number;
    windDirection: string;
    temperature: number;
    tide?: string;
  };
  status: 'upcoming' | 'active' | 'completed';
  position?: number;
  totalCompetitors?: number;
  boat?: string;
  duration?: number;
  courseType?: string;
  notes?: string;
  confidence?: number;
  aiStrategy?: string;
  rigTuning?: string;
  crewStatus?: string;
  documents?: string[];
}

const MOCK_RACES: RaceData[] = [
  {
    id: '1',
    name: 'Friday Night Series - Race 5',
    date: '2024-11-15T18:00:00Z',
    venue: 'Royal Hong Kong Yacht Club',
    weather: {
      windSpeed: 12,
      windDirection: 'SW',
      temperature: 24,
      tide: 'High at 18:30',
    },
    status: 'upcoming',
    totalCompetitors: 15,
    boat: 'J/70 "Velocity"',
    courseType: 'Windward-Leeward',
    confidence: 85,
    aiStrategy:
      'Focus on port tack bias at the start. Conservative approach recommended given predicted wind shifts in the second half.',
    rigTuning: 'Medium tension, spreaders at 18"',
    crewStatus: '4/4 confirmed',
    documents: ['Notice of Race', 'Sailing Instructions'],
  },
  {
    id: '2',
    name: 'Harbor Cup Qualifier',
    date: '2024-11-08T14:00:00Z',
    venue: 'Royal Hong Kong Yacht Club',
    weather: {
      windSpeed: 15,
      windDirection: 'W',
      temperature: 22,
    },
    status: 'completed',
    position: 1,
    totalCompetitors: 18,
    boat: 'J/70 "Velocity"',
    duration: 2.0,
    courseType: 'Triangle',
    notes: 'Perfect conditions, executed start flawlessly. Strong performance on all legs.',
    confidence: 92,
  },
  {
    id: '3',
    name: 'Fall Championship - Race 1',
    date: '2024-10-28T10:00:00Z',
    venue: 'Aberdeen Marina Club',
    weather: {
      windSpeed: 8,
      windDirection: 'NW',
      temperature: 20,
    },
    status: 'completed',
    position: 4,
    totalCompetitors: 22,
    boat: 'J/70 "Velocity"',
    duration: 2.5,
    courseType: 'Coastal',
    notes: 'Light winds, difficult to maintain speed. Lost ground on final downwind leg.',
  },
  {
    id: '4',
    name: 'Wednesday Training Session',
    date: '2024-11-13T16:00:00Z',
    venue: 'Royal Hong Kong Yacht Club',
    weather: {
      windSpeed: 10,
      windDirection: 'E',
      temperature: 23,
    },
    status: 'upcoming',
    boat: 'J/70 "Velocity"',
    courseType: 'Practice',
    confidence: 78,
    crewStatus: '3/4 confirmed',
  },
  {
    id: '5',
    name: 'Autumn Regatta - Day 2',
    date: '2024-10-15T09:00:00Z',
    venue: 'Hebe Haven Yacht Club',
    weather: {
      windSpeed: 18,
      windDirection: 'NE',
      temperature: 21,
    },
    status: 'completed',
    position: 2,
    totalCompetitors: 20,
    boat: 'J/70 "Velocity"',
    duration: 3.5,
    courseType: 'Offshore',
    notes: 'Strong winds, great performance on downwind legs. Narrow miss on first place.',
  },
];

export const RacesScreen: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('plan');
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedTimelineEventId, setSelectedTimelineEventId] = useState<string | null>(null);
  const [showAddRaceModal, setShowAddRaceModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const detailFadeAnim = useRef(new Animated.Value(0)).current;

  const {
    data: racesData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<Array<RaceRow & { regatta: RegattaRow }>>({
    queryKey: ['races', userId],
    queryFn: () => fetchRecentRaces(),
    refetchInterval: 30000,
    retry: 3,
  });

  const {
    data: timelineEvents = [],
    isLoading: isTimelineLoading,
    refetch: refetchTimeline,
  } = useTimelineEvents('sailracing');

  // Use real data if available, fall back to mock data only if no connection
  const races = useMemo(() => {
    if (racesData && racesData.length > 0) {
      return transformRacesToUI(racesData);
    }
    // If loading or error, still show mock data to prevent empty state
    if (isLoading || error) {
      return MOCK_RACES;
    }
    // No data yet, return empty array
    return [];
  }, [racesData, isLoading, error]);

  const isOffline = error !== null;
  const hasRealData = racesData && racesData.length > 0;

  // Debug logging
  useEffect(() => {
    console.log('[RacesScreen] timeline state:', {
      timelineEventsCount: timelineEvents.length,
      isTimelineLoading,
      firstEvent: timelineEvents[0],
    });
  }, [timelineEvents, isTimelineLoading]);

  useEffect(() => {
    if (timelineEvents.length > 0 && !selectedTimelineEventId) {
      setSelectedTimelineEventId(timelineEvents[0].id);
    }
  }, [timelineEvents, selectedTimelineEventId]);

  useEffect(() => {
    if (races.length > 0 && !selectedRaceId) {
      setSelectedRaceId(races[0].id);
    }
  }, [races, selectedRaceId]);

  useEffect(() => {
    if (selectedRaceId) {
      Animated.timing(detailFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      detailFadeAnim.setValue(0);
    }
  }, [selectedRaceId, detailFadeAnim]);

  const selectedRace = races.find((race) => race.id === selectedRaceId);
  const selectedTimelineEvent = useMemo(
    () => timelineEvents.find((event) => event.id === selectedTimelineEventId) ?? null,
    [timelineEvents, selectedTimelineEventId]
  );

  const handleQuickAction = (action: string) => {
    services.analytics.trackEvent('quick_action_clicked', { userId, action });
  };

  const handleAddRace = () => {
    setShowAddRaceModal(true);
    services.analytics.trackEvent('add_race_clicked', { userId });
  };

  const handleCreateRace = async (newRaceData: NewRaceData) => {
    try {
      await createQuickRaceEvent({
        ...newRaceData,
        userId,
      });
      services.analytics.trackEvent('race_created', { userId });
      setShowAddRaceModal(false);
      await Promise.all([refetch(), refetchTimeline()]);
    } catch (err) {
      console.error('Failed to create race', err);
      Alert.alert(
        'Could not create race',
        err instanceof Error ? err.message : 'Unknown error while saving.'
      );
    }
  };

  const handleAICoach = () => {
    services.analytics.trackEvent('ai_coach_clicked', { userId });
  };

  const handleNotifications = () => {
    services.analytics.trackEvent('notifications_clicked', { userId });
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const handleTimelineSelect = (eventId: string) => {
    setSelectedTimelineEventId(eventId);
    if (races.some((race) => race.id === eventId)) {
      setSelectedRaceId(eventId);
    }
  };

  const handleRacePress = (raceId: string, index: number) => {
    setSelectedRaceId(raceId);
    flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
  };

  const renderQuickActions = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
      {QUICK_ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={[styles.quickActionButton, action.id === 'ai-plan' && styles.quickActionButtonAI]}
          onPress={() => handleQuickAction(action.id)}
        >
          <Text style={styles.quickActionIcon}>{action.icon}</Text>
          <Text style={styles.quickActionText}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderRaceCarousel = () => (
    <View style={styles.carouselContainer}>
      {isLoading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent}>
          {SKELETON_PLACEHOLDERS.map((key) => (
            <View key={key} style={{ marginHorizontal: CARD_SPACING / 2 }}>
              <RaceCardSkeleton />
            </View>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          ref={flatListRef}
          horizontal
          data={races}
          renderItem={({ item, index }) => (
            <View style={{ marginHorizontal: CARD_SPACING / 2 }}>
              <RaceCard race={item} isSelected={selectedRaceId === item.id} onPress={() => handleRacePress(item.id, index)} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContent}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
            }, 400);
          }}
        />
      )}
    </View>
  );

  const renderRaceDetail = () => {
    if (isLoading) {
      return (
        <View style={styles.detailCanvas}>
          <RaceDetailSkeleton />
        </View>
      );
    }

    if (!selectedRace) {
      return (
        <View style={styles.emptyDetailState}>
          <Text style={styles.emptyDetailTitle}>Select a race to review</Text>
          <Text style={styles.emptyDetailSubtitle}>Timeline picks synced to this canvas.</Text>
        </View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.detailCanvas,
          {
            opacity: detailFadeAnim,
            transform: [
              {
                translateY: detailFadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
              },
            ],
          },
        ]}
      >
        <RaceDetail race={selectedRace} />
      </Animated.View>
    );
  };

  const renderPlanTab = () => (
    <>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        {renderQuickActions()}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Race prep focus</Text>
        <Text style={styles.sectionBody}>
          {selectedTimelineEvent
            ? `${selectedTimelineEvent.title} · ${new Date(selectedTimelineEvent.start_time).toLocaleString()}`
            : 'Add your next regatta to unlock auto-prioritized prep.'}
        </Text>
        <TouchableOpacity style={styles.planCTA} onPress={handleAddRace}>
          <Text style={styles.planCTAText}>Add race</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderActTab = () => (
    <>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Race queue</Text>
        {renderRaceCarousel()}
      </View>
    </>
  );

  const renderAnalyzeTab = () => (
    <View style={styles.sectionCard}>{renderRaceDetail()}</View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'plan':
        return renderPlanTab();
      case 'act':
        return renderActTab();
      case 'analyze':
        return renderAnalyzeTab();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={handleRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerVenueIcon}>🌍</Text>
            <Text style={styles.headerVenue}>Royal Hong Kong Yacht Club</Text>
          </View>
          <TouchableOpacity style={styles.headerNotifications} onPress={handleNotifications}>
            <Text style={styles.headerNotificationsIcon}>🔔</Text>
            {isOffline && <View style={styles.offlineDot} />}
          </TouchableOpacity>
        </View>

        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>⚠️ You're offline. Showing demo data.</Text>
          </View>
        )}

        {!isOffline && !hasRealData && !isLoading && (
          <View style={[styles.offlineBanner, styles.demoBanner]}>
            <Text style={styles.offlineBannerText}>ℹ️ No races yet. Showing demo data. Tap + to add your first race.</Text>
          </View>
        )}

        <TimelineStrip
          events={timelineEvents as any}
          domain="sailracing"
          selectedId={selectedTimelineEventId}
          loading={isTimelineLoading}
          onAdd={handleAddRace}
          onSelect={handleTimelineSelect}
        />

        <SegmentTabs options={TAB_OPTIONS} value={activeTab} onChange={(value) => setActiveTab(value as TabKey)} />

        <View style={styles.tabContent}>{renderTabContent()}</View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddRace} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.fabAI} onPress={handleAICoach} activeOpacity={0.8}>
        <Text style={styles.fabAIIcon}>🤖</Text>
      </TouchableOpacity>

      <AddRaceModal
        visible={showAddRaceModal}
        onClose={() => setShowAddRaceModal(false)}
        onCreateRace={handleCreateRace}
      />
    </SafeAreaView>
  );
};

export default RacesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    ...theme.shadows.small,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerVenueIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  headerVenue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 1,
  },
  headerNotifications: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerNotificationsIcon: {
    fontSize: 24,
  },
  offlineDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F97316',
  },
  offlineBanner: {
    marginHorizontal: theme.spacing.xl,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
  },
  offlineBannerText: {
    color: '#92400E',
  },
  quickActions: {
    paddingVertical: 8,
    gap: 12,
    paddingHorizontal: theme.spacing.xl,
  },
  quickActionButton: {
    width: 90,
    height: 96,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 2,
  },
  quickActionButtonAI: {
    backgroundColor: '#1D4ED8',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 6,
    color: '#0F172A',
  },
  quickActionText: {
    color: '#0F172A',
    fontWeight: '600',
  },
  carouselContainer: {
    paddingVertical: theme.spacing.md,
  },
  carouselContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    paddingHorizontal: theme.spacing.xl,
  },
  sectionBody: {
    color: '#475569',
    fontSize: 15,
    paddingHorizontal: theme.spacing.xl,
  },
  tabContent: {
    gap: 16,
    paddingHorizontal: theme.spacing.xl,
  },
  planCTA: {
    backgroundColor: '#1D4ED8',
    alignSelf: 'flex-start',
    marginHorizontal: theme.spacing.xl,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  planCTAText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  detailCanvas: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
  },
  emptyDetailState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyDetailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyDetailSubtitle: {
    color: '#64748B',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 5,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    marginTop: -2,
  },
  fabAI: {
    position: 'absolute',
    bottom: 110,
    right: 30,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 4,
  },
  fabAIIcon: {
    fontSize: 24,
  },
  demoBanner: {
    backgroundColor: '#3B82F6',
  },
});
