import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  RefreshControl,
} from 'react-native';
import { DomainDashboardProps } from '@betterat/domain-sdk';
import theme from '../theme';
import RaceCard from '../components/RaceCard';
import RaceDetail from '../components/RaceDetail';
import RaceCardSkeleton from '../components/skeletons/RaceCardSkeleton';
import RaceDetailSkeleton from '../components/skeletons/RaceDetailSkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 280;
const CARD_SPACING = theme.spacing.xl;
const SKELETON_PLACEHOLDERS = ['race-skeleton-1', 'race-skeleton-2', 'race-skeleton-3'];

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Mock Data
// ============================================================================

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
    aiStrategy: 'Focus on port tack bias at the start. Conservative approach recommended given predicted wind shifts in the second half.',
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

// ============================================================================
// RacesScreen Component
// ============================================================================

export const RacesScreen: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [races, setRaces] = useState<RaceData[]>([]);
  const [isOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailFadeAnim = useRef(new Animated.Value(0)).current;

  const selectedRace = races.find(race => race.id === selectedRaceId);

  const loadRaces = useCallback((delay = 1500) => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    loadTimeoutRef.current = setTimeout(() => {
      setRaces(MOCK_RACES);
      setSelectedRaceId(MOCK_RACES.length > 0 ? MOCK_RACES[0].id : null);
      setIsLoading(false);
      setRefreshing(false);
    }, delay);
  }, []);

  useEffect(() => {
    loadRaces();
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [loadRaces]);

  // Fade in detail canvas when race is selected
  useEffect(() => {
    if (selectedRace) {
      Animated.timing(detailFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      detailFadeAnim.setValue(0);
    }
  }, [selectedRace, detailFadeAnim]);

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    services.analytics.trackEvent('quick_action_clicked', { userId, action });
  };

  const handleAddRace = () => {
    console.log('Add race clicked');
    services.analytics.trackEvent('add_race_clicked', { userId });
  };

  const handleAICoach = () => {
    console.log('AI coach clicked');
    services.analytics.trackEvent('ai_coach_clicked', { userId });
  };

  const handleNotifications = () => {
    console.log('Notifications clicked');
    services.analytics.trackEvent('notifications_clicked', { userId });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setIsLoading(true);
    setRaces([]);
    setSelectedRaceId(null);
    loadRaces(1500);
  };

  const handleRacePress = (raceId: string, index: number) => {
    setSelectedRaceId(raceId);

    // Scroll to center the selected card
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5, // Center the card
    });
  };

  const renderRaceCard = ({ item, index }: { item: RaceData; index: number }) => {
    const isSelected = selectedRaceId === item.id;
    return (
      <View style={{ marginHorizontal: CARD_SPACING / 2 }}>
        <RaceCard
          race={item}
          isSelected={isSelected}
          onPress={() => handleRacePress(item.id, index)}
        />
      </View>
    );
  };

  // Empty state (after loading completes)
  if (!isLoading && races.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIllustration}>⛵</Text>
          <Text style={styles.emptyStateTitle}>No races yet</Text>
          <Text style={styles.emptyStateSubtitle}>
            Let's get you on the water!
          </Text>
          <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddRace}>
            <Text style={styles.emptyStateButtonText}>Log Your First Race</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerVenueIcon}>🌍</Text>
            <Text style={styles.headerVenue}>Royal Hong Kong Yacht Club</Text>
          </View>
          <TouchableOpacity
            style={styles.headerNotifications}
            onPress={handleNotifications}
          >
            <Text style={styles.headerNotificationsIcon}>🔔</Text>
            {isOffline && <View style={styles.offlineDot} />}
          </TouchableOpacity>
        </View>

        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>
              ⚠️ You're offline. Some features may be limited.
            </Text>
          </View>
        )}

        {/* QUICK ACTIONS STRIP */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActions}
          >
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleQuickAction('import')}
            >
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>Import</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, styles.quickActionButtonAI]}
              onPress={() => handleQuickAction('ai-plan')}
            >
              <Text style={styles.quickActionIcon}>🤖</Text>
              <Text style={styles.quickActionText}>AI Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleQuickAction('quick-log')}
            >
              <Text style={styles.quickActionIcon}>📋</Text>
              <Text style={styles.quickActionText}>Quick Log</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleQuickAction('practice')}
            >
              <Text style={styles.quickActionIcon}>🎯</Text>
              <Text style={styles.quickActionText}>Practice</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* HORIZONTAL CAROUSEL */}
        <View style={styles.carouselContainer}>
          <Text style={styles.sectionTitle}>Your Races</Text>
          {isLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
            >
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
              renderItem={renderRaceCard}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              onScrollToIndexFailed={(info) => {
                // Handle scroll failure gracefully
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({
                    index: info.index,
                    animated: true,
                    viewPosition: 0.5,
                  });
                });
              }}
            />
          )}
        </View>

        {/* DETAIL CANVAS */}
        {isLoading ? (
          <View style={styles.detailCanvas}>
            <RaceDetailSkeleton />
          </View>
        ) : (
          selectedRace && (
            <Animated.View
              style={[
                styles.detailCanvas,
                {
                  opacity: detailFadeAnim,
                  transform: [
                    {
                      translateY: detailFadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <RaceDetail race={selectedRace} />
            </Animated.View>
          )
        )}
      </ScrollView>

      {/* FLOATING ACTION BUTTON - Add Race */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddRace}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* AI COACH FAB */}
      <TouchableOpacity
        style={styles.fabAI}
        onPress={handleAICoach}
        activeOpacity={0.8}
      >
        <Text style={styles.fabAIIcon}>🤖</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default RacesScreen;

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },

  // Offline Banner
  offlineBanner: {
    backgroundColor: theme.colors.warning,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  offlineBannerText: {
    ...theme.typography.bodySmall,
    color: theme.colors.background,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Section Title
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },

  // Quick Actions
  quickActionsContainer: {
    paddingTop: theme.spacing.xxl,
  },
  quickActions: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.small,
    gap: theme.spacing.md,
  },
  quickActionButtonAI: {
    backgroundColor: theme.colors.aiPurple,
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
  },

  // Carousel
  carouselContainer: {
    paddingTop: theme.spacing.xxl,
  },
  carouselContent: {
    paddingHorizontal: CARD_SPACING / 2,
  },

  // Detail Canvas
  detailCanvas: {
    marginTop: theme.spacing.xxl,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.cardLarge,
    borderTopRightRadius: theme.borderRadius.cardLarge,
    ...theme.shadows.large,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxxl,
  },
  emptyStateIllustration: {
    fontSize: 80,
    marginBottom: theme.spacing.xxl,
  },
  emptyStateTitle: {
    ...theme.typography.h1,
    fontSize: 28,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxxl,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxxl,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.medium,
  },
  emptyStateButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: '700',
  },

  // Floating Action Buttons
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xxl,
    right: theme.spacing.xxl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.large,
  },
  fabIcon: {
    fontSize: 32,
    color: theme.colors.background,
    fontWeight: '600',
  },
  fabAI: {
    position: 'absolute',
    bottom: theme.spacing.xxl,
    left: theme.spacing.xxl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.aiPurple,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.large,
  },
  fabAIIcon: {
    fontSize: 28,
  },
});
