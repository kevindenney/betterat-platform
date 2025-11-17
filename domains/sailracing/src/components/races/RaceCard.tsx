// @ts-nocheck
/**
 * RaceCard Component
 * Mobile phone-sized race card showing critical race details with countdown timer
 * Dimensions: 375×667px (iPhone SE size) for primary card, scaled down for others
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, ActivityIndicator, Alert, Platform, type ViewStyle } from 'react-native';
import { MapPin, Wind, Waves, Radio, RefreshCw, CheckCircle2 } from 'lucide-react-native';
import { calculateCountdown } from '../../constants/mockData';
import { RaceTimer } from './RaceTimer';
import { StartSequenceTimer } from './StartSequenceTimer';
import { RaceWeatherService } from '../../services/RaceWeatherService';
import { supabase } from '../../services/supabase';
import { createLogger } from '../../utils/logger';
import { CardMenu, type CardMenuItem } from '../shared/CardMenu';

const logger = createLogger('RaceCard');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const platformShadow = ({ ios, android, web }: { ios?: ViewStyle; android?: ViewStyle; web?: string }) =>
  (Platform.select({
    ios: ios ?? {},
    android: android ?? {},
    web: web ? { boxShadow: web } : {},
    default: {},
  }) || {});

const palette = {
  background: '#FFFDF8',
  border: '#D8CCBA',
  text: '#1F1810',
  muted: '#7A6D5F',
  accent: '#0B3A60',
  highlight: '#2A5F7C',
};

const serifFont = Platform.select({ ios: 'Iowan Old Style', android: 'serif', default: 'Georgia' });
const sansFont = Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif-light', default: 'System' });

// Helper function to get weather status message
function getWeatherStatusMessage(status?: string): string {
  switch (status) {
    case 'loading':
      return 'Loading forecast...';
    case 'too_far':
      return 'Forecast not yet available';
    case 'past':
      return 'Race completed';
    case 'no_venue':
      return 'No venue specified';
    case 'unavailable':
      return 'Forecast unavailable';
    case 'error':
      return 'Unable to load forecast';
    case 'available':
      return ''; // Don't show message when data is available
    default:
      return 'Forecast pending';
  }
}

export interface RaceCardProps {
  id: string;
  name: string;
  venue: string;
  date: string; // ISO date
  startTime: string;
  locationName?: string | null;
  locationCoordinates?: { latitude: number; longitude: number } | null;
  wind?: {
    direction: string;
    speedMin: number;
    speedMax: number;
  } | null;
  tide?: {
    state: 'flooding' | 'ebbing' | 'slack';
    height: number;
    direction?: string;
  } | null;
  weatherStatus?: 'loading' | 'available' | 'unavailable' | 'error' | 'too_far' | 'past' | 'no_venue';
  weatherError?: string;
  weatherConditions?: Record<string, any> | null;
  strategy?: string;
  critical_details?: {
    vhf_channel?: string;
    warning_signal?: string;
    first_start?: string;
  };
  isPrimary?: boolean; // True for next race (largest card)
  isMock?: boolean; // True for mock data
  raceStatus?: 'past' | 'next' | 'future'; // Race timing status
  onRaceComplete?: (sessionId: string) => void; // Callback when race timer completes
  isSelected?: boolean; // True when card is selected for inline detail view
  onSelect?: () => void; // Callback when card is selected (replaces navigation for inline view)
  onEdit?: () => void;
  onDelete?: () => void;
  showTimelineIndicator?: boolean; // True to show the "now" timeline indicator on the left
  isDimmed?: boolean; // True when another race is selected and this one should recede
}

export function RaceCard({
  id,
  name,
  venue,
  date,
  startTime,
  locationName = null,
  locationCoordinates = null,
  wind,
  tide,
  weatherStatus,
  weatherError,
  weatherConditions = null,
  critical_details,
  isPrimary = false,
  isMock = false,
  raceStatus = 'future',
  onRaceComplete,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  showTimelineIndicator = false,
  isDimmed = false,
}: RaceCardProps) {
  console.log('🎴 [RaceCard RENDER]', {
    id,
    name,
    venue,
    locationName,
    wind,
    tide,
    weatherStatus,
  });

  const editHandler = onEdit ?? null;
  const deleteHandler = onDelete ?? null;

  const menuItems = useMemo<CardMenuItem[]>(() => {
    const items: CardMenuItem[] = [];
    if (editHandler) {
      items.push({
        label: 'Edit Race',
        icon: 'create-outline',
        onPress: editHandler,
      });
    }
    if (deleteHandler) {
      items.push({
        label: 'Delete Race',
        icon: 'trash-outline',
        onPress: deleteHandler,
        variant: 'destructive',
      });
    }
    return items;
  }, [deleteHandler, editHandler]);
  const [refreshingWeather, setRefreshingWeather] = useState(false);
  const [currentWind, setCurrentWind] = useState(wind);
  const [currentTide, setCurrentTide] = useState(tide);
  const [currentWeatherStatus, setCurrentWeatherStatus] = useState(weatherStatus);
  const [weatherMetadata, setWeatherMetadata] = useState(weatherConditions);

  // Sync props to state when they change (important for enrichment updates)
  useEffect(() => {
    setCurrentWind(wind);
    setCurrentTide(tide);
    setCurrentWeatherStatus(weatherStatus);
  }, [wind, tide, weatherStatus]);

  useEffect(() => {
    setWeatherMetadata(weatherConditions);
  }, [weatherConditions]);

  // Calculate countdown once per minute using useMemo
  // This prevents re-calculating on every render
  const currentMinute = useMemo(() => Math.floor(Date.now() / 60000), []);
  const [minuteTick, setMinuteTick] = useState(currentMinute);

  const countdown = useMemo(() => {
    return calculateCountdown(date, startTime);
  }, [date, startTime, minuteTick]);

  const weatherStatusMessage = useMemo(() => {
    return getWeatherStatusMessage(currentWeatherStatus);
  }, [currentWeatherStatus]);

  // Update countdown every minute (only for upcoming races to save CPU)
  useEffect(() => {
    // Don't run interval for past races
    if (raceStatus === 'past') return;

    const interval = setInterval(() => {
      setMinuteTick(Math.floor(Date.now() / 60000));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [raceStatus]);

  // Refresh weather data
  const handleRefreshWeather = async () => {
    if (isMock || refreshingWeather) return;

    setRefreshingWeather(true);
    try {
      const locationLabel = locationName || weatherMetadata?.location_name || venue;
      const coords = locationCoordinates || weatherMetadata?.location_coordinates;

      if (!locationLabel && !coords) {
        setCurrentWeatherStatus('no_venue');
        Alert.alert('Add a location', 'Set a course area or venue before refreshing weather.');
        return;
      }

      logger.debug('[RaceCard] Refreshing weather', {
        id,
        locationLabel,
        hasCoords: !!coords,
      });

      const warningSignalTime =
        critical_details?.warning_signal ||
        (typeof startTime === 'string' && startTime.includes(':') && startTime.length <= 8 ? startTime : null);

      const weatherData = coords
        ? await RaceWeatherService.fetchWeatherByCoordinates(
            coords.latitude,
            coords.longitude,
            `${date}T${startTime}`,
            locationLabel,
            { warningSignalTime }
          )
        : await RaceWeatherService.fetchWeatherByVenueName(locationLabel || venue, date, {
            warningSignalTime,
          });

      if (weatherData) {
        setCurrentWind(weatherData.wind);
        setCurrentTide(weatherData.tide);
        setCurrentWeatherStatus('available');

        const mergedWeather = {
          ...(weatherMetadata || {}),
          venue_name: venue,
          location_name: locationLabel,
          location_coordinates: coords || null,
          wind_speed: Math.round((weatherData.wind.speedMin + weatherData.wind.speedMax) / 2),
          wind_speed_min: weatherData.wind.speedMin,
          wind_speed_max: weatherData.wind.speedMax,
          wind_direction: weatherData.wind.direction,
          tide_state: weatherData.tide.state,
          tide_height: weatherData.tide.height,
          tide_direction: weatherData.tide.direction,
          fetched_at: weatherData.fetchedAt,
          provider: weatherData.provider,
          confidence: weatherData.confidence,
        };

        const { error } = await supabase
          .from('race_events')
          .update({
            weather_conditions: mergedWeather,
          })
          .eq('id', id);

        if (error) {
          console.error('[RaceCard] Error updating weather:', error);
          Alert.alert('Error', 'Failed to update weather data');
        } else {
          setWeatherMetadata(mergedWeather);
          logger.debug(`[RaceCard] Weather updated from ${weatherData.provider}`);
          Alert.alert('Success', `Weather updated from ${weatherData.provider}`);
        }
      } else {
        setCurrentWeatherStatus('unavailable');
        Alert.alert('No Data', 'Weather data not available for this race');
      }
    } catch (error: any) {
      console.error('[RaceCard] Error refreshing weather:', error);
      setCurrentWeatherStatus('error');
      Alert.alert('Error', error.message || 'Failed to refresh weather');
    } finally {
      setRefreshingWeather(false);
    }
  };

  const handlePress = () => {
    // If onSelect callback provided, use inline selection instead of navigation
    if (onSelect) {
      logger.debug('[RaceCard] Card selected for inline view!', { id, name });
      onSelect();
      return;
    }

    // Otherwise, navigation isn't wired up yet in the native wrapper
    logger.debug('[RaceCard] Card clicked but navigation is not implemented yet', {
      id,
      name,
      isMock,
    });
    Alert.alert(
      'Coming Soon',
      'Detailed race views are coming soon to the mobile app.'
    );
  };

  // Card dimensions - landscape layout matching yacht-racing horizontal carousel
  const cardWidth = 320; // Wider for landscape layout
  const cardHeight = 280; // Shorter for compact horizontal display

  const hasRaceStartedOrPassed =
    raceStatus === 'past' ||
    (countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0);

  const showIndicatorLeft = showTimelineIndicator && !hasRaceStartedOrPassed;

  const handleWrapperLayout = (event: any) => {
    const { width } = event.nativeEvent.layout || {};
    console.debug('[RaceCard layout]', name, {
      width,
      showTimelineIndicator,
      showIndicatorLeft,
      raceStatus,
    });
  };

  return (
    <View
      style={[
        styles.cardWrapper,
      ]}
      onLayout={handleWrapperLayout}
    >
      {showIndicatorLeft && (
        <View style={styles.timelineIndicatorContainer}>
          <Text style={styles.nowLabel}>NOW</Text>
          <View style={styles.timelineIndicator} />
        </View>
      )}

      <Pressable
        style={({ pressed }) => {
          const baseOpacity = raceStatus === 'past' ? 0.7 : 1;
          const selectionOpacity = isDimmed ? 0.45 : baseOpacity;
          const computedOpacity = pressed ? Math.max(selectionOpacity - 0.1, 0.35) : selectionOpacity;
          return [
            styles.card,
            {
              width: cardWidth,
              height: cardHeight,
              opacity: computedOpacity,
            },
            isPrimary && styles.primaryCard,
            isMock && styles.mockCard,
            raceStatus === 'past' && styles.pastCard,
            isSelected && styles.selectedCard,
          ];
        }}
        onPress={handlePress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${name}`}
        accessibilityState={{ selected: isSelected }}
        testID={`race-card-${id}`}
        hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >

      {isSelected && (
        <View style={styles.selectedPill}>
          <CheckCircle2 size={12} color="#1D4ED8" />
          <Text style={styles.selectedPillText}>Viewing</Text>
        </View>
      )}

      {/* Mock Badge */}
      {isMock && (
        <View style={[styles.mockBadge, menuItems.length > 0 && styles.badgeShifted]}>
          <Text style={styles.mockBadgeText}>DEMO</Text>
        </View>
      )}

      {/* Race Status Badge */}
      {!isMock && raceStatus === 'next' && (
        <View style={[styles.nextBadge, menuItems.length > 0 && styles.badgeShifted]}>
          <Text style={styles.nextBadgeText}>⚡ NEXT RACE</Text>
        </View>
      )}
      {!isMock && raceStatus === 'past' && (
        <View style={[styles.pastBadge, menuItems.length > 0 && styles.badgeShifted]}>
          <Text style={styles.pastBadgeText}>✓ COMPLETED</Text>
        </View>
      )}

     {/* Header */}
     <View style={styles.header}>
       <Text style={[styles.raceName, isPrimary && styles.primaryRaceName]} numberOfLines={2}>
         {name}
       </Text>
        {menuItems.length > 0 && (
          <View style={styles.menuTrigger}>
            <CardMenu items={menuItems} />
          </View>
        )}
        <View style={styles.venueRow}>
          <MapPin size={12} color="#64748B" />
          <Text style={styles.venueText}>{venue}</Text>
        </View>
      </View>

      {/* Race Timer (Countdown or Active Timer) - Only show on upcoming races */}
      {!isMock && raceStatus !== 'past' && onRaceComplete ? (
        <View style={styles.timerContainer}>
          <RaceTimer
            raceId={id}
            raceName={name}
            raceDate={date}
            raceTime={startTime}
            onRaceComplete={onRaceComplete}
          />
        </View>
      ) : (
        <View style={[styles.countdownSection, isPrimary && styles.primaryCountdownSection]}>
          <Text style={styles.countdownLabel}>STARTS IN</Text>
          <View style={styles.countdownRow}>
            <View style={styles.countdownBlock}>
              <Text style={[styles.countdownNumber, isPrimary && styles.primaryCountdownNumber]}>
                {countdown.days}
              </Text>
              <Text style={styles.countdownUnit}>{countdown.days === 1 ? 'DAY' : 'DAYS'}</Text>
            </View>
            <Text style={[styles.countdownSeparator, isPrimary && styles.primaryCountdownSeparator]}> </Text>
            <View style={styles.countdownBlock}>
              <Text style={[styles.countdownNumber, isPrimary && styles.primaryCountdownNumber]}>
                {String(countdown.hours).padStart(2, '0')}
              </Text>
              <Text style={styles.countdownUnit}>{countdown.hours === 1 ? 'HR' : 'HRS'}</Text>
            </View>
            <Text style={[styles.countdownSeparator, isPrimary && styles.primaryCountdownSeparator]}> </Text>
            <View style={styles.countdownBlock}>
              <Text style={[styles.countdownNumber, isPrimary && styles.primaryCountdownNumber]}>
                {String(countdown.minutes).padStart(2, '0')}
              </Text>
              <Text style={styles.countdownUnit}>{countdown.minutes === 1 ? 'MIN' : 'MINS'}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Critical Details - Compact horizontal layout */}
      <View style={styles.detailsSection}>
        {/* Wind Conditions - Compact row */}
        {currentWind ? (
          <View style={styles.detailRowCompact}>
            <Wind size={14} color="#64748B" strokeWidth={2} />
            <Text style={styles.detailLabelSmall}>WIND</Text>
            <Text style={styles.detailValueCompact}>
              {currentWind.direction} {currentWind.speedMin}-{currentWind.speedMax}kts
            </Text>
          </View>
        ) : (
          <View style={styles.detailRowCompact}>
            <Wind size={14} color="#64748B" strokeWidth={2} />
            <Text style={styles.detailLabelSmall}>WIND</Text>
            <Text style={styles.detailPlaceholder}>{weatherStatusMessage}</Text>
          </View>
        )}

        {/* Tide Conditions - Compact row */}
        {currentTide ? (
          <View style={styles.detailRowCompact}>
            <Waves size={14} color="#64748B" strokeWidth={2} />
            <Text style={styles.detailLabelSmall}>TIDE</Text>
            <Text style={styles.detailValueCompact}>
              {currentTide.state} {currentTide.height}m
            </Text>
          </View>
        ) : (
          <View style={styles.detailRowCompact}>
            <Waves size={14} color="#64748B" strokeWidth={2} />
            <Text style={styles.detailLabelSmall}>TIDE</Text>
            <Text style={styles.detailPlaceholder}>{weatherStatusMessage}</Text>
          </View>
        )}
      </View>

      {/* Start Sequence Timer - Only for upcoming races WITHOUT GPS tracking */}
      {!isMock && raceStatus !== 'past' && !onRaceComplete && (
        <View style={styles.startSequenceSection}>
          <StartSequenceTimer compact={!isPrimary} />
        </View>
      )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
    marginVertical: 6,
    position: 'relative',
  },
  card: {
    backgroundColor: palette.background,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexShrink: 0,
    ...platformShadow({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 4 },
      web: '0 12px 30px rgba(15,23,42,0.15)',
    }),
    borderWidth: 1,
    borderColor: palette.border,
    // @ts-ignore - cursor is web-only
    cursor: 'pointer',
    // @ts-ignore - userSelect is web-only
    userSelect: 'none',
  },
  primaryCard: {
    ...platformShadow({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 6 },
      web: '0 18px 45px rgba(30,64,175,0.25)',
    }),
    borderWidth: 2,
    borderColor: palette.accent,
    backgroundColor: '#F2F4F8',
  },
  mockCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  pastCard: {
    backgroundColor: '#F4EEE3',
    borderWidth: 1,
    borderColor: '#D5CAB7',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: palette.accent,
    backgroundColor: '#E8EFF4',
    ...platformShadow({
      ios: { shadowColor: '#0B3A60', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 16 },
      android: { elevation: 8 },
      web: '0 20px 45px rgba(11,58,96,0.3)',
    }),
    transform: [{ translateY: -4 }],
  },
  selectedPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2E8D9',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 12,
  },
  selectedPillText: {
    color: '#6C5643',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  mockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 10,
  },
  mockBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  nextBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#266D53',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
    ...platformShadow({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
      android: { elevation: 2 },
      web: '0 4px 10px rgba(15,23,42,0.25)',
    }),
  },
  nextBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pastBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#B7A48E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
  },
  pastBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  badgeShifted: {
    right: 44,
  },
  header: {
    marginBottom: 8,
    marginTop: 6,
    paddingRight: 90,
  },
  menuTrigger: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  raceName: {
    fontSize: 18,
    color: palette.text,
    marginBottom: 6,
    lineHeight: 22,
    fontFamily: serifFont,
  },
  primaryRaceName: {
    fontSize: 20,
    color: palette.accent,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  venueText: {
    fontSize: 12,
    letterSpacing: 1,
    color: palette.muted,
    textTransform: 'uppercase',
    fontFamily: sansFont,
  },
  countdownSection: {
    backgroundColor: palette.accent,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 10,
    alignItems: 'center',
    ...platformShadow({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
      web: '0 10px 25px rgba(15,23,42,0.35)',
    }),
  },
  primaryCountdownSection: {
    backgroundColor: palette.highlight,
  },
  countdownLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#F7F3EB',
    marginBottom: 10,
    textTransform: 'uppercase',
    fontFamily: sansFont,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countdownBlock: {
    alignItems: 'center',
    minWidth: 32,
  },
  countdownNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 32,
    fontVariant: ['tabular-nums'],
    fontFamily: sansFont,
  },
  primaryCountdownNumber: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  countdownUnit: {
    fontSize: 9,
    letterSpacing: 1,
    color: '#F2EBDD',
    marginTop: 2,
    textTransform: 'uppercase',
    fontFamily: sansFont,
  },
  countdownSeparator: {
    fontSize: 20,
    fontWeight: '300',
    color: '#D9CDBA',
    opacity: 0.5,
    marginHorizontal: 2,
  },
  primaryCountdownSeparator: {
    fontSize: 24,
    color: '#D9CDBA',
  },
  detailsSection: {
    marginBottom: 8,
    gap: 4,
  },
  // New compact row styles for yacht-racing layout
  detailRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  detailLabelSmall: {
    fontSize: 10,
    letterSpacing: 1,
    color: palette.muted,
    textTransform: 'uppercase',
    fontFamily: sansFont,
  },
  detailValueCompact: {
    fontSize: 13,
    color: palette.text,
    fontWeight: '600',
    flex: 1,
    fontFamily: sansFont,
  },
  detailPlaceholder: {
    fontSize: 11,
    color: '#C4B6A3',
    fontWeight: '500',
    fontStyle: 'italic',
    flex: 1,
  },
  // Legacy styles (keeping for compatibility)
  environmentalCard: {
    backgroundColor: '#F6F1E8',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E4D9C8',
  },
  detailRowEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: palette.muted,
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontFamily: sansFont,
  },
  detailValueLarge: {
    fontSize: 14,
    color: palette.text,
    fontWeight: '700',
    lineHeight: 18,
    fontFamily: sansFont,
  },
  detailValueMessage: {
    fontSize: 12,
    color: palette.muted,
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: palette.text,
    fontWeight: '500',
  },
  timerContainer: {
    marginBottom: 6,
  },
  startSequenceSection: {
    marginBottom: 6,
  },
  timelineIndicatorContainer: {
    position: 'absolute',
    left: -24,
    top: 24,
    alignItems: 'center',
  },
  nowLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#266D53',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  timelineIndicator: {
    width: 4,
    height: 200,
    borderRadius: 999,
    backgroundColor: '#266D53',
  },
});
