// @ts-nocheck

import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { ThemedText } from '@betterat/ui/components/themed-text';
import EventService, { ClubEvent, EventRegistrationStats } from '@/services/eventService';
import {
  EventOverviewDashboard,
  type HighlightEvent,
  type QuickAction,
  type UpcomingEvent,
} from '@betterat/ui';

const QUICK_ACTIONS = [
  { key: 'regatta', icon: '🏆', label: 'New Regatta', route: '/club/event/create?type=regatta' },
  { key: 'training', icon: '🎯', label: 'Training Session', route: '/club/event/create?type=training' },
  { key: 'social', icon: '🎉', label: 'Social Night', route: '/club/event/create?type=social' },
] as const;

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventStats, setEventStats] = useState<Record<string, EventRegistrationStats>>({});

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await EventService.getUpcomingEvents(20);
      setEvents(data);

      const statsPromises = data.map(async (event) => {
        try {
          const stats = await EventService.getRegistrationStats(event.id);
          return { id: event.id, stats };
        } catch (error) {
          return { id: event.id, stats: null };
        }
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<string, EventRegistrationStats> = {};
      statsResults.forEach(({ id, stats }) => {
        if (stats) statsMap[id] = stats;
      });
      setEventStats(statsMap);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const upcomingEvents = useMemo(() => events.filter((event) => event.status !== 'completed'), [events]);
  const highlightEvent = upcomingEvents[0];

  const metrics = useMemo(() => {
    if (!events.length) {
      return [
        {
          key: 'launch',
          label: 'Next Step',
          value: 'Create your first regatta',
          helper: 'Open registration, invite members, and publish docs.',
          icon: 'rocket-outline',
        },
        {
          key: 'payments',
          label: 'Payments',
          value: 'Connect Stripe',
          helper: 'Enable entry fees and automate payouts.',
          icon: 'card-outline',
        },
        {
          key: 'documents',
          label: 'Documents',
          value: 'Centralize NOR / SI',
          helper: 'Keep notices in one place for sailors.',
          icon: 'document-text-outline',
        },
      ];
    }

    const totalRegistrations = events.reduce((sum, event) => {
      const stats = eventStats[event.id];
      return sum + (stats?.approved_count ?? 0);
    }, 0);

    const openRegistration = events.filter((event) => event.status === 'registration_open').length;
    const publishedEvents = events.filter((event) => event.status === 'published').length;

    return [
      {
        key: 'upcoming',
        label: 'Upcoming',
        value: `${upcomingEvents.length}`,
        helper: 'Events scheduled for the next 60 days.',
        icon: 'calendar-outline',
      },
      {
        key: 'entries',
        label: 'Confirmed Entries',
        value: `${totalRegistrations}`,
        helper: 'Approved registrations across all events.',
        icon: 'people-outline',
      },
      {
        key: 'status',
        label: 'Live Status',
        value: `${openRegistration} open • ${publishedEvents} published`,
        helper: 'Keep registration momentum going.',
        icon: 'flag-outline',
      },
    ];
  }, [eventStats, events, upcomingEvents.length]);

  const operationsChecklist = [
    { key: 'collect-fees', label: 'Connect payouts & set entry fees' },
    { key: 'invite-team', label: 'Invite PRO / scorer to collaborate' },
    { key: 'publish-docs', label: 'Upload latest NOR & SIs' },
    { key: 'notify-sailors', label: 'Send kickoff email to entrants' },
  ];

  const quickActionConfig: QuickAction[] = QUICK_ACTIONS.map((action) => ({
    id: action.key,
    label: action.label,
    icon: action.icon,
    onPress: () => router.push(action.route),
  }));

  const highlightConfig: HighlightEvent | undefined = !loading && highlightEvent
    ? {
        name: highlightEvent.title,
        dateRange: formatEventDateRange(highlightEvent.start_date, highlightEvent.end_date),
        venue: highlightEvent.venue?.name || 'Venue TBC',
        info: highlightEvent.boat_class
          ? `⛵ ${highlightEvent.boat_class} • ${eventStats[highlightEvent.id]?.approved_count ?? 0} confirmed`
          : undefined,
        checklist: [
          { label: 'Registration open', state: highlightEvent.status === 'registration_open' ? 'complete' : 'pending' },
          { label: 'Documents uploaded', state: highlightEvent.documents?.length ? 'complete' : 'pending' },
          { label: 'Crew confirmed', state: 'pending' },
        ],
        actions: [
          { label: 'View details', onPress: () => router.push(`/club/event/${highlightEvent.id}`) },
          { label: 'Plan strategy', variant: 'secondary', onPress: () => router.push(`/club/event/${highlightEvent.id}`) },
        ],
      }
    : undefined;

  const upcomingList: UpcomingEvent[] = !loading
    ? upcomingEvents.map((event) => ({
        id: event.id,
        name: event.title,
        date: formatEventDateRange(event.start_date, event.end_date),
        venue: event.venue?.name || 'Venue TBC',
        badge: getStatusLabel(event.status),
      }))
    : [];

  const emptyState = loading
    ? undefined
    : {
        icon: '📅',
        title: 'No events on the horizon',
        subtitle: 'Start a regatta or training block to populate your calendar and notify sailors.',
        actionLabel: 'Plan an Event',
        onAction: () => router.push('/club/event/create'),
      };

  return (
    <EventOverviewDashboard
      hero={{
        title: 'Club Operations HQ',
        subtitle: highlightConfig
          ? `Next up: ${highlightConfig.name} ${formatDistanceToNow(new Date(highlightEvent.start_date), { addSuffix: true })}`
          : `${upcomingEvents.length} upcoming events`,
        primaryCtaLabel: 'Create Event',
        onPrimaryCta: () => router.push('/club/event/create'),
      }}
      quickActions={quickActionConfig}
      highlightEvent={highlightConfig}
      upcomingEvents={upcomingList}
      emptyState={emptyState}
      fabLabel="+"
      onFabPress={() => router.push('/club/event/create')}
    >
      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color="#2563EB" />
          <ThemedText style={styles.loadingText}>Syncing with RegattaFlow…</ThemedText>
        </View>
      ) : (
        <View style={styles.metricsRow}>
          {metrics.map((metric) => (
            <View key={metric.key} style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Ionicons name={metric.icon as any} size={18} color="#2563EB" />
              </View>
              <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
              <ThemedText style={styles.metricValue}>{metric.value}</ThemedText>
              {metric.helper ? <ThemedText style={styles.metricHelper}>{metric.helper}</ThemedText> : null}
            </View>
          ))}
        </View>
      )}

      <View style={styles.splitRow}>
        <View style={[styles.sectionCard, styles.splitCard]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Calendar</ThemedText>
            <ThemedText style={styles.sectionHelper}>Preview the month at a glance</ThemedText>
          </View>
          <View style={styles.calendarShell}>
            <View style={styles.calendarRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <ThemedText key={day} style={styles.calendarDayLabel}>
                  {day}
                </ThemedText>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {Array.from({ length: 35 }).map((_, index) => {
                const day = (index % 30) + 1;
                const hasEvent = upcomingEvents.some(
                  (event) => new Date(event.start_date).getDate() === day
                );
                return (
                  <View
                    key={`${index}-${day}`}
                    style={[styles.calendarCell, hasEvent && styles.calendarCellActive]}
                  >
                    <ThemedText style={[styles.calendarDay, hasEvent && styles.calendarDayActive]}>
                      {day}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
            <TouchableOpacity style={styles.calendarFooter} onPress={loadEvents}>
              <ThemedText style={styles.calendarLink}>Refresh / Open full calendar</ThemedText>
              <Ionicons name="refresh" size={16} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.sectionCard, styles.splitCard]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Operations checklist</ThemedText>
            <ThemedText style={styles.sectionHelper}>
              Keep race committee and members aligned
            </ThemedText>
          </View>
          {operationsChecklist.map((item, index) => (
            <View key={item.key} style={styles.checklistItem}>
              <View style={styles.checklistBadge}>
                <ThemedText style={styles.checklistNumber}>{index + 1}</ThemedText>
              </View>
              <ThemedText style={styles.checklistLabel}>{item.label}</ThemedText>
            </View>
          ))}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/club/event/create')}
          >
            <Ionicons name="sparkles-outline" size={18} color="#2563EB" />
            <ThemedText style={styles.secondaryButtonText}>View onboarding guide</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </EventOverviewDashboard>
  );
}

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginVertical: 4,
  },
  metricHelper: {
    fontSize: 13,
    color: '#475569',
  },
  loadingCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#1E3A8A',
  },
  splitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  splitCard: {
    flex: 1,
    minWidth: 260,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionHelper: {
    fontSize: 13,
    color: '#475569',
  },
  calendarShell: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    overflow: 'hidden',
  },
  calendarRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  calendarDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: `${100 / 7}%`,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCellActive: {
    backgroundColor: '#DBEAFE',
  },
  calendarDay: {
    fontSize: 14,
    color: '#1F2937',
  },
  calendarDayActive: {
    fontWeight: '700',
    color: '#1D4ED8',
  },
  calendarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  calendarLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  checklistBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  checklistLabel: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
    fontWeight: '500',
  },
  secondaryButton: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontWeight: '600',
  },
});

function formatEventDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
    return format(start, 'MMM dd, yyyy');
  }

  return `${format(start, 'MMM dd')} – ${format(end, 'MMM dd, yyyy')}`;
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'registration_open':
      return 'Registration Open';
    case 'registration_closed':
      return 'Registration Closed';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'published':
      return 'Published';
    default:
      return 'Draft';
  }
}
