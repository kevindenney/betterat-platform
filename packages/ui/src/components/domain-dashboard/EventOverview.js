import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, } from 'react-native';
const palette = {
    background: '#F7F3EB',
    card: '#FFFFFF',
    border: '#DED3C2',
    text: '#1F1810',
    muted: '#6D6357',
    primary: '#8C5D2A',
    accent: '#0B3A60',
};
const serifFont = Platform.select({
    ios: 'Iowan Old Style',
    android: 'serif',
    default: 'Georgia',
});
const sansFont = Platform.select({
    ios: 'Helvetica Neue',
    android: 'sans-serif-light',
    default: 'System',
});
const ChecklistStateIcon = {
    complete: '✅',
    pending: '⚪',
    warning: '⚠️',
};
export const EventOverviewSurface = ({ hero, quickActions = [], highlightEvent, upcomingEvents = [], emptyState, children, }) => {
    const hasUpcoming = upcomingEvents.length > (highlightEvent ? 1 : 0);
    return (<View style={styles.surface}>
      {hero && (<View style={styles.hero}>
          <Text style={styles.heroEyebrow}>INTELLIGENCE REPORT</Text>
          <Text style={styles.heroTitle}>{hero.title}</Text>
          <Text style={styles.heroSubtitle}>{hero.subtitle}</Text>
          <TouchableOpacity style={styles.heroButton} onPress={hero.onPrimaryCta}>
            <Text style={styles.heroButtonText}>{hero.primaryCtaLabel}</Text>
          </TouchableOpacity>
        </View>)}

      {quickActions.length > 0 && (<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
          {quickActions.map((action) => (<TouchableOpacity key={action.id} style={styles.quickActionButton} onPress={action.onPress}>
              {action.icon ? <Text style={styles.quickActionIcon}>{action.icon}</Text> : null}
              <Text style={styles.quickActionText}>{action.label}</Text>
            </TouchableOpacity>))}
        </ScrollView>)}

      {highlightEvent && (<View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Event</Text>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightName}>{highlightEvent.name}</Text>
            <Text style={styles.highlightDate}>{highlightEvent.dateRange}</Text>
            <Text style={styles.highlightVenue}>📍 {highlightEvent.venue}</Text>
            {highlightEvent.info ? <Text style={styles.highlightInfo}>{highlightEvent.info}</Text> : null}

            {highlightEvent.checklist && highlightEvent.checklist.length > 0 && (<View style={styles.checklist}>
                <Text style={styles.checklistTitle}>Status checklist:</Text>
                {highlightEvent.checklist.map((item) => (<View key={item.label} style={styles.checklistRow}>
                    <Text>{ChecklistStateIcon[item.state]} {item.label}</Text>
                  </View>))}
              </View>)}

            {highlightEvent.actions && highlightEvent.actions.length > 0 && (<View style={styles.actionRow}>
                {highlightEvent.actions.map((action) => (<TouchableOpacity key={action.label} style={[
                        styles.eventActionButton,
                        action.variant === 'secondary' ? styles.eventActionSecondary : undefined,
                    ]} onPress={action.onPress}>
                    <Text style={styles.eventActionText}>{action.label}</Text>
                  </TouchableOpacity>))}
              </View>)}
          </View>
        </View>)}

      {hasUpcoming && (<View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {upcomingEvents
                .slice(highlightEvent ? 1 : 0)
                .map((event) => (<View key={event.id} style={styles.eventCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>
                  <Text style={styles.eventVenue}>📍 {event.venue}</Text>
                </View>
                {event.badge ? (<View style={styles.badge}>
                    <Text style={styles.badgeText}>{event.badge}</Text>
                  </View>) : null}
              </View>))}
        </View>)}

      {!highlightEvent && upcomingEvents.length === 0 && emptyState ? (<View style={styles.emptyState}>
          {emptyState.icon ? <Text style={styles.emptyIcon}>{emptyState.icon}</Text> : null}
          <Text style={styles.emptyTitle}>{emptyState.title}</Text>
          {emptyState.subtitle ? <Text style={styles.emptySubtitle}>{emptyState.subtitle}</Text> : null}
          {emptyState.actionLabel ? (<TouchableOpacity style={styles.emptyButton} onPress={emptyState.onAction}>
              <Text style={styles.emptyButtonText}>{emptyState.actionLabel}</Text>
            </TouchableOpacity>) : null}
        </View>) : null}

      {children ? <View style={styles.childrenWrapper}>{children}</View> : null}
    </View>);
};
export const EventOverviewDashboard = (props) => {
    const { fabLabel = '+', onFabPress } = props;
    return (<SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <EventOverviewSurface {...props}/>
      </ScrollView>

      {onFabPress ? (<TouchableOpacity style={styles.fab} onPress={onFabPress}>
          <Text style={styles.fabText}>{fabLabel}</Text>
        </TouchableOpacity>) : null}
    </SafeAreaView>);
};
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: palette.background,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    surface: {
        flex: 1,
    },
    hero: {
        borderRadius: 20,
        padding: 28,
        backgroundColor: palette.card,
        borderWidth: 1,
        borderColor: palette.border,
        marginBottom: 24,
    },
    heroEyebrow: {
        fontFamily: sansFont,
        fontSize: 11,
        letterSpacing: 3,
        color: palette.muted,
        marginBottom: 10,
    },
    heroTitle: {
        fontFamily: serifFont,
        fontSize: 34,
        lineHeight: 40,
        color: palette.text,
    },
    heroSubtitle: {
        marginTop: 8,
        fontFamily: sansFont,
        fontSize: 16,
        lineHeight: 24,
        color: palette.muted,
    },
    heroButton: {
        marginTop: 16,
        alignSelf: 'flex-start',
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: palette.primary,
    },
    heroButtonText: {
        color: '#FFFFFF',
        fontFamily: sansFont,
        fontWeight: '600',
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
        paddingBottom: 4,
    },
    quickActionButton: {
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderRadius: 18,
        backgroundColor: '#FBF8F2',
        borderWidth: 1,
        borderColor: palette.border,
        alignItems: 'center',
    },
    quickActionIcon: {
        fontSize: 20,
        marginBottom: 6,
    },
    quickActionText: {
        fontFamily: sansFont,
        fontSize: 12,
        letterSpacing: 1,
        color: palette.text,
        textTransform: 'uppercase',
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontFamily: sansFont,
        fontSize: 13,
        letterSpacing: 2,
        color: palette.muted,
        marginBottom: 14,
        textTransform: 'uppercase',
    },
    highlightCard: {
        borderRadius: 20,
        padding: 22,
        backgroundColor: palette.card,
        borderWidth: 1,
        borderColor: palette.border,
    },
    highlightName: {
        fontFamily: serifFont,
        fontSize: 26,
        color: palette.text,
    },
    highlightDate: {
        fontFamily: sansFont,
        fontSize: 14,
        color: palette.muted,
        marginVertical: 6,
    },
    highlightVenue: {
        fontFamily: sansFont,
        fontSize: 13,
        color: palette.muted,
        marginBottom: 12,
    },
    highlightInfo: {
        fontFamily: sansFont,
        fontSize: 14,
        lineHeight: 22,
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
        fontFamily: sansFont,
        fontSize: 11,
        letterSpacing: 2,
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
        fontFamily: sansFont,
        fontWeight: '600',
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 16,
        backgroundColor: palette.card,
        borderWidth: 1,
        borderColor: palette.border,
        marginBottom: 12,
    },
    eventName: {
        fontFamily: serifFont,
        fontSize: 20,
        color: palette.text,
    },
    eventDate: {
        fontFamily: sansFont,
        fontSize: 13,
        color: palette.muted,
    },
    eventVenue: {
        fontFamily: sansFont,
        fontSize: 13,
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
        fontFamily: sansFont,
        fontWeight: '600',
    },
    emptyState: {
        padding: 32,
        borderRadius: 20,
        backgroundColor: palette.card,
        borderWidth: 1,
        borderColor: palette.border,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    emptyTitle: {
        fontFamily: serifFont,
        fontSize: 24,
        color: palette.text,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontFamily: sansFont,
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
        fontFamily: sansFont,
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
