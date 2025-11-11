/**
 * RaceCard Component
 * Enhanced horizontal carousel card for displaying race information
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import theme from '../theme';

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

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
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
      <View style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Quick Start</Text>
        <Text style={styles.actionButtonIcon}>▶</Text>
      </View>
    </TouchableOpacity>
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
  cardSelected: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
    ...theme.shadows.large,
    transform: [{ scale: 1.02 }],
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
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.medium,
    gap: theme.spacing.sm,
    marginTop: 'auto',
  },
  actionButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  actionButtonIcon: {
    fontSize: 12,
    color: theme.colors.primary,
  },
});
