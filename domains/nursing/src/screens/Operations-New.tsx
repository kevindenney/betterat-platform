/**
 * Nursing Operations Screen - Rebuilt with UnifiedDomainDashboard
 *
 * Simple, clean implementation using only shared components:
 * - HorizontalCarousel for shifts
 * - TabBar for Gather/Create/Share/Reflect
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { UnifiedDomainDashboard } from '@betterat/ui/components/domain-dashboard';
import { AIAssistedEntryPanel } from '@betterat/ui';
import { NURSING_TAB_LABELS } from '../constants/tabConfig';
import type { DomainDashboardProps } from '@betterat/domain-sdk';
import { OrgSuggestionList } from '@betterat/ui/components/org/OrgSuggestionList';
import {
  fetchOrgAssignmentSuggestions,
  type OrgAssignmentSuggestion,
} from '@betterat/core/services/orgAssignments';
import { ShiftExtractionAgent } from '../services/agents/ShiftExtractionAgent';

// Sample shift data
interface Shift {
  id: string;
  name: string;
  unit: string;
  date: string;
  time: string;
  role: string;
  status: 'upcoming' | 'in-progress' | 'completed';
}

const sampleShifts: Shift[] = [
  {
    id: '1',
    name: 'Morning Shift',
    unit: 'Telemetry Unit',
    date: 'Today',
    time: '07:00 - 19:00',
    role: 'Charge RN',
    status: 'in-progress',
  },
  {
    id: '2',
    name: 'Evening Shift',
    unit: 'ICU',
    date: 'Tomorrow',
    time: '19:00 - 07:00',
    role: 'Primary RN',
    status: 'upcoming',
  },
  {
    id: '3',
    name: 'Night Shift',
    unit: 'Emergency Department',
    date: 'Nov 17',
    time: '23:00 - 07:00',
    role: 'Triage RN',
    status: 'upcoming',
  },
];

export default function NursingOperations({ userId }: DomainDashboardProps) {
  const [shifts, setShifts] = useState<Shift[]>(sampleShifts);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(sampleShifts[0]?.id || null);
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftUnit, setNewShiftUnit] = useState('');
  const [newShiftTime, setNewShiftTime] = useState('');
  const [newShiftDate, setNewShiftDate] = useState('');
  const [orgSuggestions, setOrgSuggestions] = useState<OrgAssignmentSuggestion[]>([]);
  const [aiShiftText, setAiShiftText] = useState('');
  const [aiShiftUrl, setAiShiftUrl] = useState('');
  const [aiHighlights, setAiHighlights] = useState<{ label: string; value: string }[]>([]);
  const [isExtractingShift, setIsExtractingShift] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadSuggestions = async () => {
      try {
        const suggestions = await fetchOrgAssignmentSuggestions('nursing', userId);
        if (mounted) {
          setOrgSuggestions(suggestions);
        }
      } catch (error) {
        console.warn('[NursingOps] Failed to load org suggestions', error);
      }
    };
    loadSuggestions();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const selectedShift = shifts.find((s) => s.id === selectedShiftId);

  const applyOrgSuggestion = (suggestion: OrgAssignmentSuggestion) => {
    setNewShiftName(suggestion.fields?.name ?? suggestion.title ?? '');
    setNewShiftUnit(suggestion.fields?.unit ?? suggestion.orgName ?? '');
    setNewShiftDate(suggestion.fields?.date ?? '');
    setNewShiftTime(suggestion.fields?.time ?? '');
  };

  const buildShiftHighlights = (shift?: any) => {
    if (!shift) return [];
    const rows: { label: string; value: string }[] = [];
    if (shift.date) rows.push({ label: 'Date', value: shift.date });
    if (shift.role) rows.push({ label: 'Role', value: shift.role });
    if (shift.staffing) {
      const { rn, lpn, cna, support } = shift.staffing;
      const parts = [
        rn ? `${rn} RN` : null,
        lpn ? `${lpn} LPN` : null,
        cna ? `${cna} CNA` : null,
        support ? `${support} Support` : null,
      ].filter(Boolean);
      if (parts.length) rows.push({ label: 'Coverage', value: parts.join(' · ') });
    }
    if (shift.acuity) rows.push({ label: 'Acuity', value: shift.acuity });
    if (shift.notes) rows.push({ label: 'Notes', value: shift.notes });
    return rows;
  };

  const handleAIShiftExtraction = async ({ text, url }: { text: string; url?: string }) => {
    const payload = [text, url ? `Source: ${url}` : null].filter(Boolean).join('\n\n').trim();
    if (!payload) return;
    setIsExtractingShift(true);
    try {
      const agent = new ShiftExtractionAgent();
      const result = await agent.extractShiftData(payload);
      if (!result.success || !result.data) {
        Alert.alert('Could not extract shift details', result.error || 'Try adding more context.');
        return;
      }
      const extracted = result.data;
      if (extracted.name) setNewShiftName(extracted.name);
      if (extracted.unit) setNewShiftUnit(extracted.unit);
      if (extracted.date) setNewShiftDate(extracted.date);
      if (extracted.time) setNewShiftTime(extracted.time);
      setAiHighlights(buildShiftHighlights(extracted));
      Alert.alert('Shift details loaded', 'AI filled in the key fields. Review and save.');
    } catch (error: any) {
      console.error('[NursingOps] shift extraction failed', error);
      Alert.alert('AI Error', error?.message ?? 'Unable to parse shift document.');
    } finally {
      setIsExtractingShift(false);
    }
  };

  const handleAddShift = () => {
    if (!newShiftName.trim()) {
      Alert.alert('Missing shift name', 'Enter a shift name to continue.');
      return;
    }
    if (!newShiftUnit.trim()) {
      Alert.alert('Missing unit', 'Enter the unit or location for this shift.');
      return;
    }

    const newShift: Shift = {
      id: Date.now().toString(),
      name: newShiftName.trim(),
      unit: newShiftUnit.trim(),
      date: newShiftDate.trim() || 'Upcoming',
      time: newShiftTime.trim() || '07:00 - 19:00',
      role: 'Primary RN',
      status: 'upcoming',
    };

    setShifts((prev) => [...prev, newShift]);
    setSelectedShiftId(newShift.id);
    setShowAddShiftModal(false);
    setNewShiftName('');
    setNewShiftUnit('');
    setNewShiftTime('');
    setNewShiftDate('');
    setAiHighlights([]);
    setAiShiftText('');
    setAiShiftUrl('');
  };

  // Render a shift card
  const renderShiftCard = (shift: Shift) => {
    const isSelected = shift.id === selectedShiftId;

    return (
      <View style={[
        styles.shiftCard,
        isSelected && styles.shiftCardSelected,
        shift.status === 'in-progress' && styles.shiftCardActive,
      ]}>
        <View style={styles.shiftHeader}>
          <Text style={styles.shiftName}>{shift.name}</Text>
          <View style={[
            styles.statusBadge,
            shift.status === 'in-progress' && styles.statusBadgeActive,
            shift.status === 'completed' && styles.statusBadgeCompleted,
          ]}>
            <Text style={styles.statusText}>
              {shift.status === 'in-progress' ? 'IN PROGRESS' :
               shift.status === 'completed' ? 'COMPLETED' : 'UPCOMING'}
            </Text>
          </View>
        </View>

        <Text style={styles.shiftUnit}>{shift.unit}</Text>
        <Text style={styles.shiftRole}>{shift.role}</Text>

        <View style={styles.shiftFooter}>
          <Text style={styles.shiftDate}>{shift.date}</Text>
          <Text style={styles.shiftTime}>{shift.time}</Text>
        </View>
      </View>
    );
  };

  // Render Gather tab content
  const renderBriefTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Brief the Care Team</Text>
      <Text style={styles.tabDescription}>
        Charge RN briefing templates, role cards, and acuity snapshots coming soon.
      </Text>

      <TouchableOpacity style={styles.actionTile}>
        <Text style={styles.actionEmoji}>📋</Text>
        <Text style={styles.actionLabel}>Handoff report</Text>
        <Text style={styles.actionMeta}>Pre-shift export to TigerConnect</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Care tab content
  const renderCareTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Care Execution</Text>
      <Text style={styles.tabDescription}>
        Live shift workflows, bedside bundles, and documentation assists coming soon.
      </Text>

      {selectedShift ? (
        <View style={styles.liveShiftCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.liveShiftTitle}>{selectedShift.name}</Text>
            <Text style={styles.liveShiftMeta}>{selectedShift.unit} · {selectedShift.role}</Text>
            <Text style={styles.liveShiftSchedule}>{selectedShift.time}</Text>
          </View>
          <View style={styles.careCtaColumn}>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Start shift</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ctaButton, styles.secondaryCta]}>
              <Text style={styles.secondaryCtaText}>Safety checklist</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );

  // Render Broadcast tab content
  const renderBroadcastTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Broadcast Updates</Text>
      <Text style={styles.tabDescription}>
        Escalations, shift logs, and AI-generated paging cues coming soon.
      </Text>

      <TouchableOpacity style={[styles.actionTile, styles.actionAlert]}>
        <Text style={styles.actionEmoji}>🚨</Text>
        <Text style={styles.actionLabel}>Escalate</Text>
        <Text style={styles.actionMeta}>Rapid response + paging workflows</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Debrief tab content
  const renderDebriefTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Debrief & Learn</Text>
      <Text style={styles.tabDescription}>
        QI packet summaries, coaching signals, and reflection prompts coming soon.
      </Text>

      <View style={styles.debriefRow}>
        <TouchableOpacity style={styles.longCta}>
          <Text style={styles.longCtaText}>Log checklist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.longCta}>
          <Text style={styles.longCtaText}>Open shift plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <UnifiedDomainDashboard
      // Carousel props
      items={shifts}
      selectedItemId={selectedShiftId}
      onItemSelect={setSelectedShiftId}
      renderCard={renderShiftCard}
      carouselTitle="Your Shifts"
      carouselSubtitle={`${shifts.length} shifts scheduled`}
      cardWidth={320}
      onAddPress={() => setShowAddShiftModal(true)}
      addCardLabel="Add Shift"
      addCardSubtitle="Schedule a new shift"

      // Dashboard props
      hero={undefined}

      quickActions={[]}

      highlightEvent={null}

      upcomingEvents={[]}

      tabBarLabels={NURSING_TAB_LABELS}
      // Tab renderers
      renderGatherTab={renderBriefTab}
      renderCreateTab={renderCareTab}
      renderShareTab={renderBroadcastTab}
      renderReflectTab={renderDebriefTab}
    >
      {/* Additional custom content can go here */}
      </UnifiedDomainDashboard>

      <Modal
        transparent
        visible={showAddShiftModal}
        animationType="fade"
        onRequestClose={() => setShowAddShiftModal(false)}
      >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Schedule new shift</Text>
            <TouchableOpacity onPress={() => setShowAddShiftModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <OrgSuggestionList
              title="From your hospital or university"
              suggestions={orgSuggestions}
              onApply={applyOrgSuggestion}
            />

            <AIAssistedEntryPanel
              title="AI shift entry"
              description="Paste staffing emails, practicum calendars, or upload a link. We'll surface all important fields and pre-fill the form."
              helperText="Include date + time details or a reference link for best accuracy."
              textValue={aiShiftText}
              urlValue={aiShiftUrl}
              onChangeText={setAiShiftText}
              onChangeUrl={setAiShiftUrl}
              onSubmit={handleAIShiftExtraction}
              isProcessing={isExtractingShift}
              highlights={aiHighlights}
              highlightTitle="Extracted staffing details"
            />

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Shift Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., Day Telemetry"
                placeholderTextColor="#94A3B8"
                value={newShiftName}
                onChangeText={setNewShiftName}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Unit *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., South Tower L4"
                placeholderTextColor="#94A3B8"
                value={newShiftUnit}
                onChangeText={setNewShiftUnit}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="2025-02-14"
                placeholderTextColor="#94A3B8"
                value={newShiftDate}
                onChangeText={setNewShiftDate}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Time</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="07:00 - 19:00"
                placeholderTextColor="#94A3B8"
                value={newShiftTime}
                onChangeText={setNewShiftTime}
              />
            </View>

            <Text style={styles.modalHint}>
              * Required fields. Staffing + acuity will sync from your connected org.
            </Text>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalGhostButton]}
              onPress={() => setShowAddShiftModal(false)}
            >
              <Text style={styles.modalGhostLabel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalPrimaryButton]}
              onPress={handleAddShift}
            >
              <Text style={styles.modalPrimaryLabel}>Add Shift</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Shift Card Styles
  shiftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    minHeight: 200,
  },
  shiftCardSelected: {
    borderColor: '#DB2777',
    borderWidth: 3,
  },
  shiftCardActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#F59E0B',
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shiftName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
  },
  shiftUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DB2777',
    marginBottom: 4,
  },
  shiftRole: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  shiftFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shiftDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  shiftTime: {
    fontSize: 14,
    color: '#64748B',
  },

  // Tab Content Styles
  tabContent: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    minHeight: 150,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  tabDescription: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  liveShiftCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  liveShiftTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  liveShiftMeta: {
    fontSize: 15,
    color: '#475569',
    marginTop: 4,
  },
  liveShiftSchedule: {
    fontSize: 13,
    color: '#1D4ED8',
    marginTop: 2,
  },
  ctaButton: {
    backgroundColor: '#4338CA',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },

  actionTile: {
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionMeta: {
    color: '#475569',
    fontSize: 13,
  },
  actionAlert: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
  },
  careCtaColumn: {
    gap: 12,
  },
  secondaryCta: {
    backgroundColor: '#EEF2FF',
  },
  secondaryCtaText: {
    color: '#312E81',
    fontWeight: '600',
  },
  debriefRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  longCta: {
    flex: 1,
    backgroundColor: '#1E1B4B',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  longCtaText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalClose: {
    fontSize: 22,
    color: '#94A3B8',
  },
  modalScroll: {
    maxHeight: 420,
  },
  modalField: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  modalHint: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18,
  },
  modalButton: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalGhostButton: {
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  modalPrimaryButton: {
    backgroundColor: '#4338CA',
  },
  modalGhostLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4338CA',
  },
  modalPrimaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
