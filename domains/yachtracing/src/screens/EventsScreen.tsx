/**
 * EventsScreen Component
 * Event and regatta management screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { DomainDashboardProps } from '@betterat/domain-sdk';
import theme from '../theme';

// ============================================================================
// Types
// ============================================================================

interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
  boatClasses: string[];
  entries: number;
  status: 'upcoming' | 'ongoing' | 'past';
  isRegistered?: boolean;
  strategyReady?: boolean;
  documentsUploaded?: boolean;
  crewConfirmed?: boolean;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    name: 'Spring Championship',
    startDate: '2024-12-15',
    endDate: '2024-12-17',
    venue: 'Royal Hong Kong Yacht Club',
    boatClasses: ['Dragon'],
    entries: 47,
    status: 'upcoming',
    isRegistered: true,
    strategyReady: false,
    documentsUploaded: true,
    crewConfirmed: false,
  },
  {
    id: '2',
    name: 'Harbor Cup Series',
    startDate: '2024-11-20',
    endDate: '2024-11-20',
    venue: 'Aberdeen Marina Club',
    boatClasses: ['J/70', 'Laser'],
    entries: 32,
    status: 'upcoming',
    isRegistered: true,
    strategyReady: true,
    documentsUploaded: true,
    crewConfirmed: true,
  },
];

// ============================================================================
// EventsScreen Component
// ============================================================================

export const EventsScreen: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  const [events] = useState<Event[]>(MOCK_EVENTS);

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const nextEvent = upcomingEvents[0];

  const handleCreateEvent = () => {
    console.log('Create event clicked');
    services.analytics.trackEvent('create_event_clicked', { userId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Club Operations HQ</Text>
          <Text style={styles.heroSubtitle}>{upcomingEvents.length} upcoming events</Text>
          <TouchableOpacity style={styles.heroButton} onPress={handleCreateEvent}>
            <Text style={styles.heroButtonText}>Create Event</Text>
          </TouchableOpacity>
        </View>

        {/* QUICK ACTIONS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionIcon}>🏆</Text>
            <Text style={styles.quickActionText}>New Regatta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionIcon}>🎯</Text>
            <Text style={styles.quickActionText}>Training</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionIcon}>🎉</Text>
            <Text style={styles.quickActionText}>Social</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* NEXT EVENT */}
        {nextEvent && (
          <View style={styles.nextEventContainer}>
            <Text style={styles.sectionTitle}>Next Event</Text>
            <View style={styles.nextEventCard}>
              <Text style={styles.nextEventName}>{nextEvent.name}</Text>
              <Text style={styles.nextEventDate}>{nextEvent.startDate} - {nextEvent.endDate}</Text>
              <Text style={styles.nextEventVenue}>📍 {nextEvent.venue}</Text>
              <Text style={styles.nextEventInfo}>⛵ {nextEvent.boatClasses.join(', ')} • 👥 {nextEvent.entries} entries</Text>

              <View style={styles.checklist}>
                <Text style={styles.checklistTitle}>STATUS CHECKLIST:</Text>
                <View style={styles.checklistItem}>
                  <Text>{nextEvent.isRegistered ? '✅' : '⚪'} Registered</Text>
                </View>
                <View style={styles.checklistItem}>
                  <Text>{nextEvent.strategyReady ? '✅' : '⚠️'} Strategy {nextEvent.strategyReady ? 'ready' : 'pending'}</Text>
                </View>
                <View style={styles.checklistItem}>
                  <Text>{nextEvent.documentsUploaded ? '✅' : '⚪'} Documents uploaded</Text>
                </View>
                <View style={styles.checklistItem}>
                  <Text>{nextEvent.crewConfirmed ? '✅' : '⚪'} Crew confirmed</Text>
                </View>
              </View>

              <View style={styles.eventActions}>
                <TouchableOpacity style={styles.eventButton}>
                  <Text style={styles.eventButtonText}>View Details</Text>
                </TouchableOpacity>
                {!nextEvent.strategyReady && (
                  <TouchableOpacity style={[styles.eventButton, styles.eventButtonAI]}>
                    <Text style={styles.eventButtonText}>Plan Strategy</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* UPCOMING EVENTS */}
        {upcomingEvents.length > 1 && (
          <View style={styles.upcomingContainer}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            {upcomingEvents.slice(1).map(event => (
              <View key={event.id} style={styles.eventCard}>
                <Text style={styles.eventCardName}>{event.name}</Text>
                <Text style={styles.eventCardDate}>{event.startDate}</Text>
                <Text style={styles.eventCardVenue}>📍 {event.venue}</Text>
              </View>
            ))}
          </View>
        )}

        {upcomingEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📅</Text>
            <Text style={styles.emptyStateTitle}>No events scheduled</Text>
            <Text style={styles.emptyStateSubtitle}>Create your first event</Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateEvent}>
              <Text style={styles.emptyStateButtonText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateEvent} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default EventsScreen;

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundSecondary },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  hero: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  heroTitle: { ...theme.typography.h1, color: theme.colors.background, marginBottom: theme.spacing.md },
  heroSubtitle: { ...theme.typography.body, color: theme.colors.background, marginBottom: theme.spacing.xl },
  heroButton: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxxl,
    borderRadius: theme.borderRadius.large,
  },
  heroButtonText: { ...theme.typography.body, color: theme.colors.primary, fontWeight: '700' },

  quickActions: { paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.xl, gap: theme.spacing.lg },
  quickActionButton: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  quickActionIcon: { fontSize: 32, marginBottom: theme.spacing.sm },
  quickActionText: { ...theme.typography.caption, color: theme.colors.text, fontWeight: '600' },

  nextEventContainer: { padding: theme.spacing.xl },
  sectionTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: theme.spacing.lg },
  nextEventCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.xxl,
    ...theme.shadows.medium,
    borderWidth: 2,
    borderColor: theme.colors.warning,
  },
  nextEventName: { ...theme.typography.h1, fontSize: 24, color: theme.colors.text, marginBottom: theme.spacing.md },
  nextEventDate: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
  nextEventVenue: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
  nextEventInfo: { ...theme.typography.bodySmall, color: theme.colors.textTertiary, marginBottom: theme.spacing.xl },

  checklist: { gap: theme.spacing.md, marginBottom: theme.spacing.xl },
  checklistTitle: { ...theme.typography.caption, color: theme.colors.textSecondary, fontWeight: '700', textTransform: 'uppercase' },
  checklistItem: { paddingVertical: theme.spacing.sm },

  eventActions: { flexDirection: 'row', gap: theme.spacing.lg },
  eventButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  eventButtonAI: { backgroundColor: theme.colors.aiPurple },
  eventButtonText: { ...theme.typography.body, color: theme.colors.background, fontWeight: '600' },

  upcomingContainer: { padding: theme.spacing.xl, gap: theme.spacing.lg },
  eventCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.xl,
    ...theme.shadows.small,
  },
  eventCardName: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.sm },
  eventCardDate: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  eventCardVenue: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxxl,
    paddingVertical: theme.spacing.xxxl,
  },
  emptyStateIcon: { fontSize: 80, marginBottom: theme.spacing.xxl },
  emptyStateTitle: { ...theme.typography.h1, fontSize: 28, color: theme.colors.text, marginBottom: theme.spacing.md, textAlign: 'center' },
  emptyStateSubtitle: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.xxxl, textAlign: 'center' },
  emptyStateButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxxl,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.medium,
  },
  emptyStateButtonText: { ...theme.typography.body, color: theme.colors.background, fontWeight: '700' },

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
  fabIcon: { fontSize: 32, color: theme.colors.background, fontWeight: '600' },
});
