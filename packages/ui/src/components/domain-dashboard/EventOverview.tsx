import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const palette = {
  background: '#F5F7FB',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  primary: '#4338CA',
  accent: '#312E81',
};

export interface QuickAction {
  id: string;
  label: string;
  icon?: string;
  onPress?: () => void;
}

export interface ChecklistRow {
  label: string;
  state: 'complete' | 'pending' | 'warning';
}

export interface EventAction {
  label: string;
  onPress?: () => void;
  variant?: 'default' | 'secondary';
}

export interface HighlightEvent {
  name: string;
  dateRange: string;
  venue: string;
  info?: string;
  checklist?: ChecklistRow[];
  actions?: EventAction[];
}

export interface UpcomingEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  badge?: string;
}

export interface EmptyStateConfig {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface EventOverviewProps {
  hero: {
    title: string;
    subtitle: string;
    primaryCtaLabel: string;
    onPrimaryCta?: () => void;
  };
  quickActions?: QuickAction[];
  highlightEvent?: HighlightEvent | null;
  upcomingEvents?: UpcomingEvent[];
  emptyState?: EmptyStateConfig;
  fabLabel?: string;
  onFabPress?: () => void;
  children?: React.ReactNode;
}

const ChecklistStateIcon: Record<ChecklistRow['state'], string> = {
  complete: '✅',
  pending: '⚪',
  warning: '⚠️',
};

export const EventOverviewSurface = ({
  hero,
  quickActions = [],
  highlightEvent,
  upcomingEvents = [],
  emptyState,
  children,
}: EventOverviewProps) => {
  const hasUpcoming = upcomingEvents.length > (highlightEvent ? 1 : 0);

  return (
    <View style={styles.surface}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{hero.title}</Text>
        <Text style={styles.heroSubtitle}>{hero.subtitle}</Text>
        <TouchableOpacity style={styles.heroButton} onPress={hero.onPrimaryCta}>
          <Text style={styles.heroButtonText}>{hero.primaryCtaLabel}</Text>
        </TouchableOpacity>
      </View>

      {quickActions.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.quickActionButton} onPress={action.onPress}>
              {action.icon ? <Text style={styles.quickActionIcon}>{action.icon}</Text> : null}
              <Text style={styles.quickActionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {highlightEvent && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Event</Text>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightName}>{highlightEvent.name}</Text>
            <Text style={styles.highlightDate}>{highlightEvent.dateRange}</Text>
            <Text style={styles.highlightVenue}>📍 {highlightEvent.venue}</Text>
            {highlightEvent.info ? <Text style={styles.highlightInfo}>{highlightEvent.info}</Text> : null}

            {highlightEvent.checklist && highlightEvent.checklist.length > 0 && (
              <View style={styles.checklist}>
                <Text style={styles.checklistTitle}>Status checklist:</Text>
                {highlightEvent.checklist.map((item) => (
                  <View key={item.label} style={styles.checklistRow}>
                    <Text>{ChecklistStateIcon[item.state]} {item.label}</Text>
                  </View>
                ))}
              </View>
            )}

            {highlightEvent.actions && highlightEvent.actions.length > 0 && (
              <View style={styles.actionRow}>
                {highlightEvent.actions.map((action) => (
                  <TouchableOpacity
                    key={action.label}
                    style={[
                      styles.eventActionButton,
                      action.variant === 'secondary' ? styles.eventActionSecondary : undefined,
                    ]}
                    onPress={action.onPress}
                  >
                    <Text style={styles.eventActionText}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      {hasUpcoming && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {upcomingEvents
            .slice(highlightEvent ? 1 : 0)
            .map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>
                  <Text style={styles.eventVenue}>📍 {event.venue}</Text>
                </View>
                {event.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{event.badge}</Text>
                  </View>
                ) : null}
              </View>
            ))}
        </View>
      )}

      {!highlightEvent && upcomingEvents.length === 0 && emptyState ? (
        <View style={styles.emptyState}>
          {emptyState.icon ? <Text style={styles.emptyIcon}>{emptyState.icon}</Text> : null}
          <Text style={styles.emptyTitle}>{emptyState.title}</Text>
          {emptyState.subtitle ? <Text style={styles.emptySubtitle}>{emptyState.subtitle}</Text> : null}
          {emptyState.actionLabel ? (
            <TouchableOpacity style={styles.emptyButton} onPress={emptyState.onAction}>
              <Text style={styles.emptyButtonText}>{emptyState.actionLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {children ? <View style={styles.childrenWrapper}>{children}</View> : null}
    </View>
  );
};

export const EventOverviewDashboard = (props: EventOverviewProps) => {
  const { fabLabel = '+', onFabPress } = props;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <EventOverviewSurface {...props} />
      </ScrollView>

      {onFabPress ? (
        <TouchableOpacity style={styles.fab} onPress={onFabPress}>
          <Text style={styles.fabText}>{fabLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    padding: 20,
  },
  surface: {
    flex: 1,
  },
  hero: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.text,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 15,
    color: palette.muted,
  },
  heroButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: palette.primary,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 12,
  },
  highlightCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
  },
  highlightName: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text,
  },
  highlightDate: {
    fontSize: 16,
    color: palette.muted,
    marginVertical: 4,
  },
  highlightVenue: {
    fontSize: 15,
    color: palette.muted,
    marginBottom: 8,
  },
  highlightInfo: {
    fontSize: 14,
    color: palette.text,
    marginBottom: 16,
  },
  checklist: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  checklistTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.muted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  checklistRow: {
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  eventActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: palette.accent,
  },
  eventActionSecondary: {
    backgroundColor: '#1E1B4B',
  },
  eventActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    marginBottom: 12,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
  },
  eventDate: {
    fontSize: 14,
    color: palette.muted,
  },
  eventVenue: {
    fontSize: 14,
    color: palette.muted,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  badgeText: {
    color: palette.accent,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    borderRadius: 20,
    backgroundColor: palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: palette.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: palette.primary,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  childrenWrapper: {
    marginTop: 24,
    gap: 20,
  },
});

export default EventOverviewDashboard;
