import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ScrollView,
} from 'react-native';
import { DomainDashboardProps } from '@betterat/domain-sdk';
import {
  EventOverviewDashboard,
  type HighlightEvent,
  type QuickAction,
  type UpcomingEvent,
} from '@betterat/ui';

const palette = {
  background: '#F5F7FB',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  primary: '#4338CA',
};

const SHIFT_ACTIONS: QuickAction[] = [
  { id: 'log-shift', label: 'Log shift', icon: '🩺' },
  { id: 'start-huddle', label: 'Start huddle', icon: '👥' },
  { id: 'escalate', label: 'Rapid response', icon: '⚡' },
];

type DrawerChecklistState = 'ready' | 'warning' | 'info';

type DrawerContentConfig = {
  title: string;
  summary: string;
  capsule: string;
  checklist: { label: string; state: DrawerChecklistState }[];
  insights: { label: string; value: string; meta?: string }[];
  noteLabel: string;
  notePlaceholder: string;
  primaryCtaLabel: string;
};

const ACTION_DRAWER_CONTENT: Record<string, DrawerContentConfig> = {
  'log-shift': {
    title: 'Shift signal intake',
    summary: 'Capture acuity + staffing deltas for telemetry day shift. Charge nurse sees this instantly.',
    capsule: 'Telemetry · Day shift · 07:00 – 19:00',
    checklist: [
      { label: 'Vitals sync completed', state: 'ready' },
      { label: 'ICU step-down slots confirmed', state: 'ready' },
      { label: 'Pain rounds gap identified (Room 412)', state: 'warning' },
    ],
    insights: [
      { label: 'Acuity index', value: '1.34', meta: '+0.12 vs 24h avg' },
      { label: 'Nurse:patient', value: '1:3.8', meta: 'Need float RN?' },
      { label: 'Rapid responses last 12h', value: '0', meta: 'All clear' },
    ],
    noteLabel: 'Shift note',
    notePlaceholder: 'Document coaching, supply gaps, or discharge blockers…',
    primaryCtaLabel: 'Log signal',
  },
  'start-huddle': {
    title: 'Team huddle prep',
    summary: 'Prep the huddle packet. Coaches push highlights to the shared board automatically.',
    capsule: 'South Tower briefing · 06:45',
    checklist: [
      { label: 'Assignments locked (8/8)', state: 'ready' },
      { label: 'Educator available', state: 'info' },
      { label: 'Post-op 402 teaching needed', state: 'warning' },
    ],
    insights: [
      { label: 'Float coverage', value: '1 RN', meta: 'Telemetry experience' },
      { label: 'Admissions queued', value: '3', meta: '2 from PACU, 1 ED' },
      { label: 'Coaching topics', value: 'Falls · Sepsis bundle', meta: 'AI recommended' },
    ],
    noteLabel: 'Briefing notes',
    notePlaceholder: 'Add shout-outs, risk calls, or supply requests…',
    primaryCtaLabel: 'Send briefing',
  },
  escalate: {
    title: 'Rapid response escalation',
    summary: 'Stage the rapid response cart details before paging hospitalists. Mock vitals included for demo.',
    capsule: 'Room 418 · Telemetry · HR 132 · BP 88/54',
    checklist: [
      { label: 'Notify hospitalist', state: 'warning' },
      { label: 'Family update pending', state: 'info' },
      { label: 'RT on standby', state: 'ready' },
    ],
    insights: [
      { label: 'Last lactate', value: '2.1', meta: 'Drawn 35m ago' },
      { label: 'Fluids administered', value: '500 mL LR', meta: 'Need reassess' },
      { label: 'Code status', value: 'Full', meta: 'Verified 06:10' },
    ],
    noteLabel: 'Escalation log',
    notePlaceholder: 'Capture timeline, interventions, consults…',
    primaryCtaLabel: 'Escalate now',
  },
};

const HIGHLIGHT_SHIFT: HighlightEvent = {
  name: 'Telemetry Day Shift',
  dateRange: '07:00 – 19:00',
  venue: 'South Tower · Level 4',
  info: '12 beds · 2 isolation · 1 step-down pod',
  checklist: [
    { label: 'Assignments locked (8/8)', state: 'complete' },
    { label: 'Huddle briefing 06:45', state: 'warning' },
    { label: 'Debrief packet 19:20', state: 'pending' },
  ],
  actions: [
    { label: 'Open shift brief', onPress: () => {} },
    { label: 'Share update', variant: 'secondary', onPress: () => {} },
  ],
};

const UPCOMING_BLOCKS: UpcomingEvent[] = [
  { id: '1', name: 'Sepsis bundle drill', date: '11:30 education block', venue: 'Sim lab', badge: 'Training' },
  { id: '2', name: 'Night telemetry handoff', date: '18:45 huddle', venue: 'South Tower conf', badge: 'Handoff' },
];

const NursingOperationsScreen: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});

  const handleAction = (id: string) => {
    services.analytics.trackEvent('nursing_ops_action', { userId, actionId: id });
  };

  const handleDrawerOpen = (id: string) => {
    handleAction(id);
    setActiveActionId(id);
  };

  const handleDrawerClose = () => setActiveActionId(null);

  const quickActions = SHIFT_ACTIONS.map((action) => ({
    ...action,
    onPress: () => handleDrawerOpen(action.id),
  }));

  const drawerContent = activeActionId ? ACTION_DRAWER_CONTENT[activeActionId] : null;
  const noteDraft = activeActionId ? draftNotes[activeActionId] ?? '' : '';

  const handleNoteChange = (text: string) => {
    if (!activeActionId) return;
    setDraftNotes((prev) => ({
      ...prev,
      [activeActionId]: text,
    }));
  };

  const handleDrawerSubmit = () => {
    if (!activeActionId) return;
    services.analytics.trackEvent('nursing_ops_drawer_submit', {
      userId,
      actionId: activeActionId,
      noteLength: noteDraft.length,
    });
    setActiveActionId(null);
  };

  const checklistBadgeStyle = (state: DrawerChecklistState) => {
    switch (state) {
      case 'warning':
        return styles.badgeWarning;
      case 'info':
        return styles.badgeInfo;
      default:
        return styles.badgeReady;
    }
  };

  const drawerNode = drawerContent ? (
    <View style={styles.drawerOverlay}>
      <KeyboardAvoidingView
        style={styles.drawerContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.drawerHeader}>
          <View>
            <Text style={styles.drawerCapsule}>{drawerContent.capsule}</Text>
            <Text style={styles.drawerTitle}>{drawerContent.title}</Text>
            <Text style={styles.drawerSummary}>{drawerContent.summary}</Text>
          </View>
          <TouchableOpacity onPress={handleDrawerClose} accessibilityLabel="Close drawer">
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.drawerScroll}
          contentContainerStyle={styles.drawerScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.drawerSection}>
            <Text style={styles.sectionLabel}>Insights</Text>
            <View style={styles.insightsGrid}>
              {drawerContent.insights.map((insight) => (
                <View key={insight.label} style={styles.insightCard}>
                  <Text style={styles.insightLabel}>{insight.label}</Text>
                  <Text style={styles.insightValue}>{insight.value}</Text>
                  {insight.meta ? <Text style={styles.insightMeta}>{insight.meta}</Text> : null}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.drawerSection}>
            <Text style={styles.sectionLabel}>Checklist</Text>
            {drawerContent.checklist.map((item) => (
              <View key={item.label} style={styles.checklistRow}>
                <View style={[styles.checklistBadge, checklistBadgeStyle(item.state)]}>
                  <Text style={styles.checklistBadgeText}>{item.state.toUpperCase()}</Text>
                </View>
                <Text style={styles.checklistText}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.drawerSection}>
            <Text style={styles.sectionLabel}>{drawerContent.noteLabel}</Text>
            <TextInput
              multiline
              style={styles.noteInput}
              placeholder={drawerContent.notePlaceholder}
              placeholderTextColor={palette.muted}
              value={noteDraft}
              onChangeText={handleNoteChange}
              returnKeyType="done"
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.drawerCta} onPress={handleDrawerSubmit}>
          <Text style={styles.drawerCtaText}>{drawerContent.primaryCtaLabel}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  ) : null;

  return (
    <View style={styles.screen}>
      <EventOverviewDashboard
        hero={{
          title: 'Telemetry Ops HQ',
          subtitle: 'BetterAt Nursing keeps staffing, acuity, and AI coaching in one strip.',
          primaryCtaLabel: 'Log shift signal',
          onPrimaryCta: () => handleAction('log-shift'),
        }}
        quickActions={quickActions}
        highlightEvent={HIGHLIGHT_SHIFT}
        upcomingEvents={UPCOMING_BLOCKS}
        onFabPress={() => handleAction('log-shift')}
      >
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Bed readiness</Text>
            <Text style={styles.metricValue}>94%</Text>
            <Text style={styles.metricMeta}>+6% vs yesterday</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Sepsis screenings</Text>
          <Text style={styles.metricValue}>12 / 12</Text>
          <Text style={styles.metricMeta}>All within window</Text>
        </View>
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Operations checklist</Text>
        <Text style={styles.noteItem}>• Isolation carts stocked (2/2)</Text>
        <Text style={styles.noteItem}>• Rapid response bag swap 14:00</Text>
        <Text style={styles.noteItem}>• Post-op 402: chest tube watch</Text>
      </View>
      </EventOverviewDashboard>
      {drawerNode}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginVertical: 6,
  },
  metricMeta: {
    fontSize: 13,
    color: '#64748B',
  },
  noteCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    color: '#0F172A',
  },
  noteItem: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 360,
    maxWidth: '85%',
    backgroundColor: palette.card,
    borderLeftWidth: 1,
    borderColor: palette.border,
    shadowColor: '#0f172a',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: -4, height: 0 },
    elevation: 8,
    zIndex: 20,
  },
  drawerContainer: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  drawerCapsule: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.muted,
    marginBottom: 4,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 6,
  },
  drawerSummary: {
    fontSize: 14,
    color: palette.muted,
  },
  closeButton: {
    fontSize: 18,
    color: palette.muted,
    padding: 8,
  },
  drawerScroll: {
    flex: 1,
  },
  drawerScrollContent: {
    paddingBottom: 16,
    gap: 20,
  },
  drawerSection: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    backgroundColor: '#FBFCFF',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.muted,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  insightCard: {
    flexBasis: '47%',
    backgroundColor: palette.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.muted,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text,
    marginVertical: 4,
  },
  insightMeta: {
    fontSize: 12,
    color: palette.muted,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  checklistBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeReady: {
    backgroundColor: '#DCFCE7',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  badgeInfo: {
    backgroundColor: '#E0E7FF',
  },
  checklistBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.text,
  },
  checklistText: {
    fontSize: 14,
    color: palette.text,
    flex: 1,
  },
  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    minHeight: 120,
    padding: 12,
    fontSize: 14,
    color: palette.text,
    backgroundColor: palette.card,
  },
  drawerCta: {
    marginTop: 16,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: palette.primary,
  },
  drawerCtaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default NursingOperationsScreen;
