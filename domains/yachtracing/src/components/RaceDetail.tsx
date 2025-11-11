/**
 * RaceDetail Component
 * Contextual detail view based on race status (upcoming/active/completed)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import theme from '../theme';

// ============================================================================
// Types
// ============================================================================

export interface RaceDetailProps {
  race: {
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
    aiStrategy?: string;
    rigTuning?: string;
    crewStatus?: string;
    documents?: string[];
    notes?: string;
    duration?: number;
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const getCountdown = (dateString: string) => {
  const now = new Date();
  const raceDate = new Date(dateString);
  const diff = raceDate.getTime() - now.getTime();

  if (diff <= 0) return 'Race started';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const getPositionSuffix = (position: number) => {
  const j = position % 10;
  const k = position % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

// ============================================================================
// Card Component
// ============================================================================

interface CardProps {
  children: React.ReactNode;
  style?: any;
  elevated?: boolean;
}

const Card: React.FC<CardProps> = ({ children, style, elevated = false }) => (
  <View style={[styles.card, elevated && styles.cardElevated, style]}>
    {children}
  </View>
);

// ============================================================================
// Collapsible Section Component
// ============================================================================

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  defaultExpanded = true,
  children,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          {icon && <Text style={styles.sectionIcon}>{icon}</Text>}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Text style={[styles.chevron, expanded && styles.chevronExpanded]}>
          ▼
        </Text>
      </TouchableOpacity>
      {expanded && <View style={styles.sectionContent}>{children}</View>}
    </Card>
  );
};

// ============================================================================
// RaceDetail Component
// ============================================================================

const RaceDetail: React.FC<RaceDetailProps> = ({ race }) => {
  const [countdown, setCountdown] = useState(getCountdown(race.date));

  useEffect(() => {
    if (race.status === 'upcoming') {
      const interval = setInterval(() => {
        setCountdown(getCountdown(race.date));
      }, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [race.date, race.status]);

  // ============================================================================
  // UPCOMING RACE LAYOUT
  // ============================================================================

  if (race.status === 'upcoming') {
    const shouldAutoExpandAiStrategy = Boolean(race.aiStrategy && race.aiStrategy.trim().length > 0);

    return (
      <View style={styles.container}>
        {/* Overview Card */}
        <Card elevated>
          <Text style={styles.raceName}>{race.name}</Text>
          <Text style={styles.raceDate}>{formatDate(race.date)}</Text>
          <Text style={styles.raceTime}>{formatTime(race.date)}</Text>

          <View style={styles.countdownContainer}>
            <Text style={styles.countdownLabel}>Starts in</Text>
            <Text style={styles.countdownValue}>{countdown}</Text>
          </View>

          <View style={styles.venueRow}>
            <Text style={styles.venueIcon}>📍</Text>
            <Text style={styles.venueText}>{race.venue}</Text>
          </View>
        </Card>

        {/* AI Strategy Section - PRIORITY: Auto-expanded for immediate visibility */}
        <CollapsibleSection
          key={`ai-strategy-${race.id}-${shouldAutoExpandAiStrategy ? 'expanded' : 'collapsed'}`}
          title="AI-Generated Strategy"
          icon="🤖"
          defaultExpanded={shouldAutoExpandAiStrategy}
        >
          <View style={styles.aiStrategyContainer}>
            <Text style={styles.strategyText}>
              {race.aiStrategy ||
                'Based on wind forecast and course layout, focus on port tack bias at the start. ' +
                'Conservative approach recommended given predicted wind shifts.'}
            </Text>
            <TouchableOpacity style={styles.aiButton}>
              <Text style={styles.aiButtonText}>View Full Strategy</Text>
            </TouchableOpacity>
          </View>
        </CollapsibleSection>

        {/* Weather & Conditions */}
        <CollapsibleSection title="Weather & Conditions" icon="🌤️" defaultExpanded={false}>
          <View style={styles.weatherGrid}>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherLabel}>Wind</Text>
              <Text style={styles.weatherValue}>
                {race.weather.windSpeed} kts {race.weather.windDirection}
              </Text>
            </View>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherLabel}>Temperature</Text>
              <Text style={styles.weatherValue}>{race.weather.temperature}°C</Text>
            </View>
            {race.weather.tide && (
              <View style={styles.weatherItem}>
                <Text style={styles.weatherLabel}>Tide</Text>
                <Text style={styles.weatherValue}>{race.weather.tide}</Text>
              </View>
            )}
          </View>
        </CollapsibleSection>

        {/* Crew & Boat Section */}
        <CollapsibleSection title="Crew & Boat" icon="⛵" defaultExpanded={false}>
          {race.boat && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Boat</Text>
              <Text style={styles.infoValue}>{race.boat}</Text>
            </View>
          )}
          {race.rigTuning && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rig Tuning</Text>
              <Text style={styles.infoValue}>{race.rigTuning}</Text>
            </View>
          )}
          {race.crewStatus && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Crew Status</Text>
              <Text style={styles.infoValue}>{race.crewStatus}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Confirm Crew</Text>
          </TouchableOpacity>
        </CollapsibleSection>

        {/* Documents */}
        {race.documents && race.documents.length > 0 && (
          <CollapsibleSection title="Documents" icon="📄" defaultExpanded={false}>
            {race.documents.map((doc, index) => (
              <TouchableOpacity key={index} style={styles.documentRow}>
                <Text style={styles.documentText}>📎 {doc}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.buttonOutline}>
              <Text style={styles.buttonOutlineText}>Upload Document</Text>
            </TouchableOpacity>
          </CollapsibleSection>
        )}

        {/* Notes */}
        {race.notes && (
          <Card>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{race.notes}</Text>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>✏️</Text>
              <Text style={styles.actionButtonText}>Edit Race</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>🗑️</Text>
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>🔔</Text>
              <Text style={styles.actionButtonText}>Reminders</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    );
  }

  // ============================================================================
  // ACTIVE RACE LAYOUT
  // ============================================================================

  if (race.status === 'active') {
    return (
      <View style={styles.container}>
        {/* Live Tracking */}
        <Card elevated>
          <Text style={styles.liveIndicator}>🔴 LIVE</Text>
          <Text style={styles.raceName}>{race.name}</Text>

          <View style={styles.liveStatsContainer}>
            <View style={styles.liveStat}>
              <Text style={styles.liveStatLabel}>Current Position</Text>
              <Text style={styles.liveStatValue}>
                {race.position || '-'}
              </Text>
            </View>
            <View style={styles.liveStat}>
              <Text style={styles.liveStatLabel}>Race Time</Text>
              <Text style={styles.liveStatValue}>
                {race.duration ? `${race.duration}h` : '-'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Tracking Map</Text>
          </TouchableOpacity>
        </Card>

        {/* Quick Actions Drawer */}
        <Card>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>✓</Text>
              <Text style={styles.actionButtonText}>Mark Rounding</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>🎤</Text>
              <Text style={styles.actionButtonText}>Voice Note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>⚠️</Text>
              <Text style={styles.actionButtonText}>Emergency</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Minimized Sections */}
        <CollapsibleSection title="Strategy" icon="🤖" defaultExpanded={false}>
          <Text style={styles.strategyText}>
            {race.aiStrategy || 'Strategy summary available...'}
          </Text>
        </CollapsibleSection>

        <CollapsibleSection title="Weather" icon="🌤️" defaultExpanded={false}>
          <View style={styles.weatherGrid}>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherLabel}>Wind</Text>
              <Text style={styles.weatherValue}>
                {race.weather.windSpeed} kts {race.weather.windDirection}
              </Text>
            </View>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherLabel}>Temperature</Text>
              <Text style={styles.weatherValue}>{race.weather.temperature}°C</Text>
            </View>
          </View>
        </CollapsibleSection>
      </View>
    );
  }

  // ============================================================================
  // COMPLETED RACE LAYOUT
  // ============================================================================

  if (race.status === 'completed') {
    return (
      <View style={styles.container}>
        {/* Results Card */}
        <Card elevated>
          <Text style={styles.raceName}>{race.name}</Text>
          <Text style={styles.raceDate}>{formatDate(race.date)}</Text>

          {race.position && race.totalCompetitors && (
            <View style={styles.resultsContainer}>
              <Text style={styles.positionLabel}>Final Position</Text>
              <Text style={[
                styles.positionValue,
                race.position === 1 && styles.position1st,
                race.position === 2 && styles.position2nd,
                race.position === 3 && styles.position3rd,
              ]}>
                {race.position}{getPositionSuffix(race.position)}
              </Text>
              <Text style={styles.totalCompetitors}>
                out of {race.totalCompetitors} boats
              </Text>
              {race.duration && (
                <Text style={styles.raceTime}>
                  Race time: {race.duration}h
                </Text>
              )}
            </View>
          )}
        </Card>

        {/* Performance Analytics */}
        <CollapsibleSection title="Performance Analytics" icon="📊" defaultExpanded={true}>
          <Text style={styles.analyticsPlaceholder}>
            Detailed performance metrics coming soon...
          </Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Avg Speed</Text>
              <Text style={styles.metricValue}>6.5 kts</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>VMG</Text>
              <Text style={styles.metricValue}>5.2 kts</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Tacks</Text>
              <Text style={styles.metricValue}>12</Text>
            </View>
          </View>
        </CollapsibleSection>

        {/* AI Debrief */}
        <CollapsibleSection title="Post-Race Analysis" icon="🤖" defaultExpanded={true}>
          <View style={styles.aiStrategyContainer}>
            <Text style={styles.strategyText}>
              Strong performance on upwind legs. Consider more aggressive tactics at start
              line for future races. Weather reading was excellent.
            </Text>
            <TouchableOpacity style={styles.aiButton}>
              <Text style={styles.aiButtonText}>View Full Debrief</Text>
            </TouchableOpacity>
          </View>
        </CollapsibleSection>

        {/* Notes */}
        {race.notes && (
          <Card>
            <Text style={styles.sectionTitle}>Race Notes</Text>
            <Text style={styles.notesText}>{race.notes}</Text>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>✏️</Text>
              <Text style={styles.actionButtonText}>Edit Results</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>📤</Text>
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>📊</Text>
              <Text style={styles.actionButtonText}>Analysis</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    );
  }

  return null;
};

export default RaceDetail;

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },

  // Card
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.xl,
    ...theme.shadows.small,
  },
  cardElevated: {
    ...theme.shadows.medium,
  },

  // Collapsible Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    transform: [{ rotate: '-90deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '0deg' }],
  },
  sectionContent: {
    marginTop: theme.spacing.lg,
  },

  // Race Name & Date
  raceName: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  raceDate: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  raceTime: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },

  // Countdown
  countdownContainer: {
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.medium,
    marginVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  countdownLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  countdownValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  // Venue
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  venueIcon: {
    fontSize: 20,
  },
  venueText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },

  // AI Strategy
  aiStrategyContainer: {
    gap: theme.spacing.lg,
  },
  strategyText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
  },
  aiButton: {
    backgroundColor: theme.colors.aiPurple,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  aiButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: '600',
  },

  // Weather
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
  },
  weatherItem: {
    flex: 1,
    minWidth: 100,
  },
  weatherLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  weatherValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  infoLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },

  // Buttons
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: '600',
  },
  buttonOutline: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  buttonOutlineText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Documents
  documentRow: {
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  documentText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },

  // Notes
  notesText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
    marginTop: theme.spacing.md,
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.borderRadius.medium,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  actionButtonText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Live Race
  liveIndicator: {
    ...theme.typography.caption,
    color: theme.colors.error,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  liveStatsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    marginVertical: theme.spacing.xl,
  },
  liveStat: {
    flex: 1,
  },
  liveStatLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  liveStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  // Results
  resultsContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  positionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
  },
  positionValue: {
    fontSize: 64,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  position1st: {
    color: theme.colors.warning,
  },
  position2nd: {
    color: theme.colors.gray500,
  },
  position3rd: {
    color: '#92400E',
  },
  totalCompetitors: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },

  // Analytics
  analyticsPlaceholder: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.borderRadius.medium,
  },
  metricLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  metricValue: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontWeight: '700',
  },
});
