/**
 * EventsScreen Component
 * Event and regatta management screen
 */

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  EventOverviewDashboard,
  type QuickAction,
  type HighlightEvent,
  type UpcomingEvent,
} from '@betterat/ui';
import { DomainDashboardProps } from '@betterat/domain-sdk';
// TODO: Re-enable when eventService functions are implemented
// import { fetchUpcomingEvents, fetchPastEvents } from '../services/eventService';
// import type { RegattaRow } from '../services/eventService';

// Temporary type until eventService is updated
type RegattaRow = any;

// Temporary stub functions until eventService is updated
const fetchUpcomingEvents = async () => [];
const fetchPastEvents = async () => [];

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

export const EventsScreen: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  // Fetch upcoming events from Supabase
  const {
    data: upcomingEventsData,
    isLoading: isLoadingUpcoming,
    refetch: refetchUpcoming,
  } = useQuery<RegattaRow[]>({
    queryKey: ['upcoming-events', userId],
    queryFn: () => fetchUpcomingEvents(),
    refetchInterval: 60000,
    retry: 3,
  });

  // Fetch past events from Supabase
  const {
    data: pastEventsData,
    isLoading: isLoadingPast,
    refetch: refetchPast,
  } = useQuery<RegattaRow[]>({
    queryKey: ['past-events', userId],
    queryFn: () => fetchPastEvents(10),
    retry: 3,
  });

  // Transform events to UI format
  const events = useMemo(() => {
    const transformed: Event[] = [];

    if (upcomingEventsData && upcomingEventsData.length > 0) {
      transformed.push(
        ...upcomingEventsData.map((event) => ({
          id: event.id,
          name: event.name,
          startDate: event.start_date,
          endDate: event.end_date,
          venue: typeof event.venue === 'string' ? event.venue : event.venue?.name || 'Unknown Venue',
          boatClasses: [], // TODO: Extract from event metadata
          entries: 0, // TODO: Get from races
          status: 'upcoming' as const,
          isRegistered: true,
          strategyReady: false,
          documentsUploaded: event.documents && event.documents.length > 0,
          crewConfirmed: false,
        }))
      );
    }

    if (pastEventsData && pastEventsData.length > 0) {
      transformed.push(
        ...pastEventsData.map((event) => ({
          id: event.id,
          name: event.name,
          startDate: event.start_date,
          endDate: event.end_date,
          venue: typeof event.venue === 'string' ? event.venue : event.venue?.name || 'Unknown Venue',
          boatClasses: [],
          entries: 0,
          status: 'past' as const,
        }))
      );
    }

    // Fall back to mock data if no real data
    if (transformed.length === 0) {
      return MOCK_EVENTS;
    }

    return transformed;
  }, [upcomingEventsData, pastEventsData]);

  const hasRealData = (upcomingEventsData && upcomingEventsData.length > 0) || (pastEventsData && pastEventsData.length > 0);
  const isLoading = isLoadingUpcoming || isLoadingPast;

  const upcomingEvents = useMemo(() => events.filter((event) => event.status === 'upcoming'), [events]);
  const nextEvent = upcomingEvents[0];

  const handleCreateEvent = () => {
    services.analytics.trackEvent('create_event_clicked', { userId });
  };

  const quickActions: QuickAction[] = [
    { id: 'regatta', label: 'New Regatta', icon: '🏆', onPress: handleCreateEvent },
    { id: 'training', label: 'Training', icon: '🎯', onPress: handleCreateEvent },
    { id: 'social', label: 'Social', icon: '🎉', onPress: handleCreateEvent },
  ];

  const highlightEvent: HighlightEvent | undefined = nextEvent
    ? {
        name: nextEvent.name,
        dateRange: `${nextEvent.startDate} – ${nextEvent.endDate}`,
        venue: nextEvent.venue,
        info: `⛵ ${nextEvent.boatClasses.join(', ')} • 👥 ${nextEvent.entries} entries`,
        checklist: [
          { label: 'Registered', state: nextEvent.isRegistered ? 'complete' : 'pending' },
          { label: 'Strategy ready', state: nextEvent.strategyReady ? 'complete' : 'warning' },
          { label: 'Documents uploaded', state: nextEvent.documentsUploaded ? 'complete' : 'pending' },
          { label: 'Crew confirmed', state: nextEvent.crewConfirmed ? 'complete' : 'pending' },
        ],
        actions: [
          { label: 'View details', onPress: () => services.analytics.trackEvent('view_event', { userId, eventId: nextEvent.id }) },
          !nextEvent.strategyReady
            ? {
                label: 'Plan strategy',
                variant: 'secondary',
                onPress: () => services.analytics.trackEvent('plan_strategy', { userId, eventId: nextEvent.id }),
              }
            : undefined,
        ].filter(Boolean) as HighlightEvent['actions'],
      }
    : undefined;

  const upcomingList: UpcomingEvent[] = upcomingEvents.map((event) => ({
    id: event.id,
    name: event.name,
    date: event.startDate,
    venue: event.venue,
  }));

  const handleRefresh = async () => {
    await Promise.all([refetchUpcoming(), refetchPast()]);
  };

  return (
    <>
      {!hasRealData && !isLoading && (
        <div style={{ backgroundColor: '#3B82F6', padding: '12px', textAlign: 'center' }}>
          <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600' }}>
            ℹ️ No events yet. Showing demo data. Create your first event.
          </span>
        </div>
      )}
      <EventOverviewDashboard
        hero={{
          title: 'Club Operations HQ',
          subtitle: `${upcomingEvents.length} upcoming events`,
          primaryCtaLabel: 'Create Event',
          onPrimaryCta: handleCreateEvent,
        }}
        quickActions={quickActions}
        highlightEvent={highlightEvent}
        upcomingEvents={upcomingList}
        emptyState={{
          icon: '📅',
          title: 'No events scheduled',
          subtitle: 'Create your first event',
          actionLabel: 'Create Event',
          onAction: handleCreateEvent,
        }}
        fabLabel="+"
        onFabPress={handleCreateEvent}
      />
    </>
  );
};

export default EventsScreen;
