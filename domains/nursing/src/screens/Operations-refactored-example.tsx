/**
 * NursingOperationsScreen - Refactored Example using UnifiedDomainDashboard
 *
 * This example shows how to refactor the existing Operations.tsx to use the new
 * UnifiedDomainDashboard component for consistency across domains.
 *
 * Benefits:
 * - Reduced code duplication
 * - Consistent UX across all domains
 * - Easier to maintain
 * - Better separation of concerns
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { DomainDashboardProps } from '@betterat/domain-sdk';
import {
  UnifiedDomainDashboard,
  type QuickAction,
  type HighlightEvent,
  type UpcomingEvent,
} from '@betterat/ui';
import { NURSING_TAB_LABELS } from '../constants/tabConfig';

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

const UPCOMING_BLOCKS: UpcomingEvent[] = [
  { id: '1', name: 'Sepsis bundle drill', date: '11:30 education block', venue: 'Sim lab', badge: 'Training' },
  { id: '2', name: 'Night telemetry handoff', date: '18:45 huddle', venue: 'South Tower conf', badge: 'Handoff' },
];

type Shift = {
  id: string;
  name: string;
  date: string;
  time: string;
  unit: string;
  staffing: string;
  acuity: string;
  status: 'scheduled' | 'in-progress' | 'completed';
};

const SAMPLE_SHIFTS: Shift[] = [
  {
    id: '1',
    name: 'Day Telemetry',
    date: 'Today',
    time: '07:00 - 19:00',
    unit: 'South Tower L4',
    staffing: '8 RNs · 1:3.8 ratio',
    acuity: 'Acuity 1.34',
    status: 'in-progress',
  },
  {
    id: '2',
    name: 'Night Telemetry',
    date: 'Tonight',
    time: '19:00 - 07:00',
    unit: 'South Tower L4',
    staffing: '6 RNs · 1:4.2 ratio',
    acuity: 'Acuity 1.18',
    status: 'scheduled',
  },
  {
    id: '3',
    name: 'ICU Day',
    date: 'Tomorrow',
    time: '07:00 - 19:00',
    unit: 'North Tower ICU',
    staffing: '12 RNs · 1:2.0 ratio',
    acuity: 'Acuity 2.45',
    status: 'scheduled',
  },
  {
    id: '4',
    name: 'Med-Surg PM',
    date: 'Tomorrow',
    time: '15:00 - 23:00',
    unit: 'West Wing L2',
    staffing: '5 RNs · 1:5.0 ratio',
    acuity: 'Acuity 0.92',
    status: 'scheduled',
  },
];

const NursingOperationsScreen: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  const [shifts, setShifts] = useState<Shift[]>(SAMPLE_SHIFTS);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(SAMPLE_SHIFTS[0]?.id || null);
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  useEffect(() => {
    console.log('[NursingOps] Mounted operations screen', {
      sampleShiftCount: shifts.length,
      userId,
    });
  }, [userId, shifts.length]);

  const handleAction = (id: string) => {
    services.analytics.trackEvent('nursing_ops_action', { userId, actionId: id });
    console.log('[NursingOps] handleAction fired', { id });
  };

  const handleDrawerOpen = (id: string) => {
    handleAction(id);
    setActiveActionId(id);
  };

  const quickActions = SHIFT_ACTIONS.map((action) => ({
    ...action,
    onPress: () => handleDrawerOpen(action.id),
  }));

  // Get the selected shift
  const selectedShift = shifts.find(s => s.id === selectedShiftId) || shifts[0];

  // Generate dynamic highlight event based on selected shift
  const highlightShift: HighlightEvent | undefined = selectedShift ? {
    name: selectedShift.name,
    dateRange: selectedShift.time,
    venue: selectedShift.unit,
    info: selectedShift.staffing,
    checklist: [
      { label: 'Assignments locked', state: selectedShift.status === 'in-progress' ? 'complete' : 'pending' },
      { label: selectedShift.status === 'in-progress' ? 'Huddle briefing' : 'Pre-shift briefing', state: selectedShift.status === 'scheduled' ? 'warning' : 'complete' },
      { label: 'Debrief packet', state: 'pending' },
    ],
    actions: [
      { label: 'Open shift brief', onPress: () => handleAction('log-shift') },
      { label: 'Share update', variant: 'secondary', onPress: () => {} },
    ],
  } : undefined;

  // Render a single shift card
  const renderShiftCard = (shift: Shift) => {
    const statusColors = {
      'in-progress': '#10B981',
      'scheduled': '#3B82F6',
      'completed': '#6B7280',
    };

    const isSelected = shift.id === selectedShiftId;

    return (
      <View
        style={[
          styles.shiftCard,
          shift.status === 'in-progress' && styles.shiftCardActive,
          isSelected && styles.shiftCardSelected,
        ]}
      >
        <View style={styles.shiftHeader}>
          <View style={styles.shiftHeaderLeft}>
            <Text style={styles.shiftName}>{shift.name}</Text>
            <Text style={styles.shiftUnit}>{shift.unit}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[shift.status] }]}>
            <Text style={styles.statusText}>
              {shift.status === 'in-progress' ? 'LIVE' : shift.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.shiftTime}>
          <Text style={styles.shiftDate}>{shift.date}</Text>
          <Text style={styles.shiftTimeRange}>{shift.time}</Text>
        </View>

        <View style={styles.shiftMetrics}>
          <View style={styles.shiftMetric}>
            <Text style={styles.shiftMetricLabel}>👥 Staffing</Text>
            <Text style={styles.shiftMetricValue}>{shift.staffing}</Text>
          </View>
          <View style={styles.shiftMetric}>
            <Text style={styles.shiftMetricLabel}>📊 {shift.acuity}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <UnifiedDomainDashboard
        items={shifts}
        selectedItemId={selectedShiftId}
        onItemSelect={(id: string) => {
          setSelectedShiftId(id);
          services.analytics.trackEvent('nursing_shift_selected', { userId, shiftId: id });
        }}
        renderCard={renderShiftCard}
        carouselTitle="Your Shifts"
        carouselSubtitle={`${shifts.length} shifts scheduled`}
        cardWidth={300}
        cardSpacing={16}
        onAddPress={() => {
          setShowAddShiftModal(true);
          services.analytics.trackEvent('nursing_add_shift_pressed', { userId });
        }}
        addCardLabel="Add Shift"
        addCardSubtitle="Schedule new shift assignment"
        tabBarLabels={NURSING_TAB_LABELS}
        hero={{
          title: selectedShift ? `${selectedShift.name} HQ` : 'Telemetry Ops HQ',
          subtitle: 'BetterAt Nursing keeps staffing, acuity, and AI coaching in one strip.',
          primaryCtaLabel: 'Log shift signal',
          onPrimaryCta: () => handleAction('log-shift'),
        }}
        quickActions={quickActions}
        highlightEvent={highlightShift}
        upcomingEvents={UPCOMING_BLOCKS}
      >
        {/* Domain-specific metrics and content */}
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
      </UnifiedDomainDashboard>

      {/* Add Shift Modal - kept outside of UnifiedDomainDashboard */}
      <Modal
        visible={showAddShiftModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddShiftModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Shift Modal</Text>
            <TouchableOpacity onPress={() => setShowAddShiftModal(false)}>
              <Text>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  shiftCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    minHeight: 220,
  },
  shiftCardActive: {
    borderColor: '#10B981',
    borderWidth: 2,
    shadowColor: '#10B981',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  shiftCardSelected: {
    borderColor: palette.primary,
    borderWidth: 2,
    shadowColor: palette.primary,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  shiftHeaderLeft: {
    flex: 1,
  },
  shiftName: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 4,
  },
  shiftUnit: {
    fontSize: 14,
    color: palette.muted,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shiftTime: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
    marginBottom: 4,
  },
  shiftTimeRange: {
    fontSize: 14,
    color: palette.muted,
  },
  shiftMetrics: {
    gap: 12,
  },
  shiftMetric: {
    marginBottom: 8,
  },
  shiftMetricLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.muted,
    marginBottom: 4,
  },
  shiftMetricValue: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.text,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
});

export default NursingOperationsScreen;
