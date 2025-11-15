/**
 * RaceCard Component
 * Enhanced horizontal carousel card for displaying race information
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Easing,
} from 'react-native';
import theme from '../theme';

const AnimatedCardPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedButtonPressable = Animated.createAnimatedComponent(Pressable);
const QUICK_START_BG = 'rgba(59, 130, 246, 0.08)';
const QUICK_START_BG_PRESSED = 'rgba(59, 130, 246, 0.14)';
const QUICK_START_BORDER = 'rgba(59, 130, 246, 0.2)';
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

type CountdownState = {
  label: string;
  color: string;
  icon?: string;
  isPulsing: boolean;
  showLiveDot?: boolean;
};

const formatFutureCountdown = (diffMs: number): string => {
  const days = Math.floor(diffMs / DAY_MS);
  const hours = Math.floor((diffMs % DAY_MS) / HOUR_MS);
  const minutes = Math.max(
    1,
    Math.floor((diffMs % HOUR_MS) / MINUTE_MS),
  );

  if (days > 0) {
    return `Starts in ${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `Starts in ${hours}h ${minutes}m`;
  }
  return `Starts in ${minutes}m`;
};

const formatPastCountdown = (diffMs: number): string => {
  const absDiff = Math.abs(diffMs);
  if (absDiff < HOUR_MS) {
    const minutes = Math.max(1, Math.floor(absDiff / MINUTE_MS));
    return `Started ${minutes}m ago`;
  }
  if (absDiff < DAY_MS) {
    const hours = Math.floor(absDiff / HOUR_MS);
    return `Started ${hours}h ago`;
  }
  const days = Math.floor(absDiff / DAY_MS);
  return `Started ${days}d ago`;
};

const getCountdownState = (race: RaceCardProps['race']): CountdownState => {
  if (race.status === 'completed') {
    return {
      label: '✅ Completed',
      color: theme.colors.gray500,
      icon: undefined,
      isPulsing: false,
    };
  }

  if (race.status === 'active') {
    return {
      label: 'Race in progress',
      color: theme.colors.primary,
      showLiveDot: true,
      isPulsing: false,
    };
  }

  const raceDate = new Date(race.date);
  const now = new Date();
  const diffMs = raceDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    if (Math.abs(diffMs) <= 5 * MINUTE_MS) {
      return {
        label: 'Starting now!',
        color: theme.colors.error,
        icon: '⏰',
        isPulsing: true,
      };
    }

    return {
      label: formatPastCountdown(diffMs),
      color: theme.colors.gray500,
      icon: '🕐',
      isPulsing: false,
    };
  }

  let color = theme.colors.gray500;
  if (diffMs <= 30 * MINUTE_MS) {
    color = theme.colors.error;
  } else if (diffMs <= 2 * HOUR_MS) {
    color = theme.colors.warning;
  } else if (diffMs <= 24 * HOUR_MS) {
    color = theme.colors.primary;
  }

  const isPulsing = diffMs <= 5 * MINUTE_MS;

  return {
    label: formatFutureCountdown(diffMs),
    color,
    icon: '⏰',
    isPulsing,
  };
};

// ============================================================================
// Types
// ============================================================================

export interface RaceCardProps {
  race: {
    id: string;
    name: string;
    date: string;
    venue: string;
    weather?: {
      windSpeed: number;
      windDirection: string;
      temperature: number;
    };
    status: 'upcoming' | 'active' | 'completed';
    position?: number;
    confidence?: number; // AI confidence score
  };
  isSelected: boolean;
  onPress: () => void;
}

// ============================================================================
// RaceCard Component
// ============================================================================

const RaceCard: React.FC<RaceCardProps> = ({ race, isSelected, onPress }) => {
  const selectionAnim = React.useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const pressAnim = React.useRef(new Animated.Value(0)).current;
  const buttonScale = React.useRef(new Animated.Value(0)).current;
  const [isButtonPressed, setIsButtonPressed] = React.useState(false);
  const countdownPulse = React.useRef(new Animated.Value(1)).current;
  const [countdownState, setCountdownState] = React.useState<CountdownState>(
    () => getCountdownState(race),
  );

  React.useEffect(() => {
    Animated.timing(selectionAnim, {
      toValue: isSelected ? 1 : 0,
      duration: 200,
      easing: isSelected ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      useNativeDriver: false, // border/shadow animation needs JS driver
    }).start();
  }, [isSelected, selectionAnim]);

  React.useEffect(() => {
    setCountdownState(getCountdownState(race));

    if (race.status === 'upcoming') {
      const interval = setInterval(() => {
        setCountdownState(getCountdownState(race));
      }, 60000);

      return () => clearInterval(interval);
    }

    return undefined;
  }, [race.date, race.status]);

  React.useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation | undefined;

    if (countdownState.isPulsing) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(countdownPulse, {
            toValue: 1.05,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(countdownPulse, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );

      pulseAnimation.start();
    } else {
      countdownPulse.stopAnimation?.();
      countdownPulse.setValue(1);
    }

    return () => {
      pulseAnimation?.stop();
    };
  }, [countdownPulse, countdownState.isPulsing]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get status color
  const getStatusColor = (status: RaceCardProps['race']['status']) => {
    switch (status) {
      case 'upcoming':
        return theme.colors.primary;
      case 'active':
        return theme.colors.success;
      case 'completed':
        return theme.colors.gray500;
      default:
        return theme.colors.gray500;
    }
  };

  // Get status text
  const getStatusText = (status: RaceCardProps['race']['status']) => {
    switch (status) {
      case 'upcoming':
        return '📋 Strategy Ready';
      case 'active':
        return '🏁 Race Active';
      case 'completed':
        return '✅ Completed';
      default:
        return '';
    }
  };

  // Get position suffix
  const getPositionSuffix = (position: number) => {
    const j = position % 10;
    const k = position % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const handleCardPressIn = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 100,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleCardPressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 0,
      duration: 100,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressIn = () => {
    setIsButtonPressed(true);
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 160,
    }).start();
  };

  const handleButtonPressOut = () => {
    setIsButtonPressed(false);
    Animated.spring(buttonScale, {
      toValue: 0,
      useNativeDriver: true,
      friction: 6,
      tension: 160,
    }).start();
  };

  const buttonScaleStyle = {
    transform: [
      {
        scale: buttonScale.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05],
        }),
      },
    ],
  };

  const selectionScale = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const pressScale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });

  const cardAnimatedStyle = {
    transform: [
      {
        scale: Animated.multiply(selectionScale, pressScale),
      },
    ],
    borderWidth: selectionAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 3],
    }),
    shadowOpacity: selectionAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.12, 0.25],
    }),
    shadowRadius: selectionAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [6, 10],
    }),
    elevation: selectionAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 6],
    }),
  };

  const cardBorderColor = isSelected ? theme.colors.primary : theme.colors.gray200;

  return (
    <AnimatedCardPressable
      onPress={onPress}
      onPressIn={handleCardPressIn}
      onPressOut={handleCardPressOut}
      style={[
        styles.card,
        { borderColor: cardBorderColor },
        cardAnimatedStyle,
      ]}
    >
      {/* Top Row: Date + AI Badge */}
      <View style={styles.topRow}>
        <Text style={styles.date}>{formatDate(race.date)}</Text>
        {race.confidence && race.confidence > 0 && (
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>
              AI {Math.round(race.confidence)}%
            </Text>
          </View>
        )}
      </View>

      {/* Race Name */}
      <Text style={styles.raceName} numberOfLines={2}>
        {race.name}
      </Text>

      {/* Countdown */}
      <Animated.View
        style={[
          styles.countdownRow,
          countdownState.isPulsing && {
            transform: [{ scale: countdownPulse }],
          },
        ]}
      >
        {countdownState.showLiveDot ? (
          <View style={styles.liveDot} />
        ) : (
          countdownState.icon && (
            <Text style={styles.countdownIcon}>{countdownState.icon}</Text>
          )
        )}
        <Text
          style={[
            styles.countdownText,
            { color: countdownState.color },
          ]}
        >
          {countdownState.label}
        </Text>
      </Animated.View>

      {/* Venue */}
      <Text style={styles.venue} numberOfLines={1}>
        📍 {race.venue}
      </Text>

      {/* Weather Section */}
      {race.weather && (
        <View style={styles.weatherRow}>
          <Text style={styles.weatherText}>
            🌬️ {race.weather.windSpeed}kt {race.weather.windDirection}
          </Text>
          <Text style={styles.weatherText}>
            🌡️ {race.weather.temperature}°C
          </Text>
        </View>
      )}

      {/* Status Chip */}
      <View
        style={[
          styles.statusChip,
          { backgroundColor: getStatusColor(race.status) + '20' },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            { color: getStatusColor(race.status) },
          ]}
        >
          {getStatusText(race.status)}
        </Text>
      </View>

      {/* Position (if completed) */}
      {race.position && race.status === 'completed' && (
        <Text style={styles.position}>
          Position: {race.position}{getPositionSuffix(race.position)}
        </Text>
      )}

      {/* Action Button */}
      <AnimatedButtonPressable
        onPress={onPress}
        onPressIn={handleButtonPressIn}
        onPressOut={handleButtonPressOut}
        style={[
          styles.actionButton,
          {
            backgroundColor: isButtonPressed
              ? QUICK_START_BG_PRESSED
              : QUICK_START_BG,
          },
          buttonScaleStyle,
        ]}
      >
        <Text style={styles.actionButtonText}>Quick Start</Text>
        <Text style={styles.actionButtonIcon}>▶</Text>
      </AnimatedButtonPressable>
    </AnimatedCardPressable>
  );
};

export default RaceCard;

// ============================================================================
// Styles
// ============================================================================

const CARD_WIDTH = 280;
const CARD_HEIGHT = 180;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.xl,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    justifyContent: 'space-between',
  },
  // Top Row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  aiBadge: {
    backgroundColor: theme.colors.aiPurple,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
  },
  aiBadgeText: {
    ...theme.typography.tiny,
    color: theme.colors.background,
    fontWeight: '700',
  },

  // Race Name
  raceName: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    minHeight: 44,
  },

  // Venue
  venue: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  // Countdown
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  countdownIcon: {
    fontSize: 14,
  },
  countdownText: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },

  // Weather
  weatherRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  weatherText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },

  // Status Chip
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.sm,
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },

  // Position
  position: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },

  // Action Button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: QUICK_START_BG,
    borderWidth: 1,
    borderColor: QUICK_START_BORDER,
    borderRadius: theme.borderRadius.medium,
    gap: theme.spacing.sm,
    marginTop: 'auto',
    marginBottom: theme.spacing.xs,
  },
  actionButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  actionButtonIcon: {
    fontSize: 16,
    color: theme.colors.primary,
  },
});
