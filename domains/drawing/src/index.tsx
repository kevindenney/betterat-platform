import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { z } from 'zod';
import {
  createDomain,
  createActivityType,
  createMetric,
  createAgent,
  DomainDashboardProps,
} from '@betterat/domain-sdk';
import { Button, AIAssistedEntryPanel } from '@betterat/ui';
import { OrgSuggestionList } from '@betterat/ui/components/org/OrgSuggestionList';
import {
  fetchOrgAssignmentSuggestions,
  type OrgAssignmentSuggestion,
} from '@betterat/core/services/orgAssignments';
import { UnifiedDomainDashboard } from '@betterat/ui';
import { SessionExtractionAgent } from './services/agents/SessionExtractionAgent';
import type { QuickAction, HighlightEvent } from '@betterat/ui/src/components/domain-dashboard/EventOverview';
import ToolkitsScreen from './screens/Toolkits';
import PromptsScreen, { DrawingStrategyPlannerSection } from './screens/Prompts';
import InspirationScreen from './screens/Inspiration';
import DrawingMoreScreen from './screens/More';

// ============================================================================
// Drawing Dashboard Component - Using UnifiedDomainDashboard
// ============================================================================

type DrawingSession = {
  id: string;
  name: string;
  date: string;
  duration: string;
  medium: string;
  subject: string;
  status: 'planned' | 'in-progress' | 'completed';
  skillsFocused?: string[];
  notes?: string;
};

const SAMPLE_SESSIONS: DrawingSession[] = [
  {
    id: '1',
    name: 'Portrait Study',
    date: 'Today',
    duration: '2 hours',
    medium: 'Graphite',
    subject: 'Self-portrait',
    status: 'in-progress',
    skillsFocused: ['Proportion', 'Shading', 'Values'],
    notes: 'Focus on capturing light and shadow accurately',
  },
  {
    id: '2',
    name: 'Gesture Drawing',
    date: 'Tomorrow',
    duration: '1 hour',
    medium: 'Charcoal',
    subject: 'Figure studies',
    status: 'planned',
    skillsFocused: ['Line quality', 'Movement', 'Energy'],
  },
  {
    id: '3',
    name: 'Landscape Practice',
    date: 'Nov 17',
    duration: '3 hours',
    medium: 'Watercolor',
    subject: 'Urban sketching',
    status: 'planned',
    skillsFocused: ['Perspective', 'Composition', 'Color theory'],
  },
  {
    id: '4',
    name: 'Still Life Study',
    date: 'Nov 18',
    duration: '2.5 hours',
    medium: 'Oil pastels',
    subject: 'Fruit arrangement',
    status: 'planned',
    skillsFocused: ['Color mixing', 'Texture', 'Light'],
  },
];

const DRAWING_ACTIONS: QuickAction[] = [
  // Removed quick action buttons to match updated design
  // { id: 'start-session', label: 'Start Drawing', icon: '✏️' },
  // { id: 'review-progress', label: 'Review Progress', icon: '📊' },
  // { id: 'get-feedback', label: 'AI Feedback', icon: '🎨' },
];

const DRAWING_TAB_LABELS = {
  gather: { label: 'Plan', description: 'References + prompts' },
  create: { label: 'Create', description: 'Active drawing session' },
  share: { label: 'Publish', description: 'Share or request feedback' },
  reflect: { label: 'Review', description: 'Critique and backlog' },
} as const;

const DrawingDashboard: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  const [sessions, setSessions] = useState<DrawingSession[]>(SAMPLE_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(SAMPLE_SESSIONS[0]?.id || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionDuration, setNewSessionDuration] = useState('');
  const [newSessionMedium, setNewSessionMedium] = useState('');
  const [newSessionSubject, setNewSessionSubject] = useState('');
  const [newSessionSkills, setNewSessionSkills] = useState('');
  const [newSessionNotes, setNewSessionNotes] = useState('');
  const [orgSuggestions, setOrgSuggestions] = useState<OrgAssignmentSuggestion[]>([]);
  const [aiSessionText, setAiSessionText] = useState('');
  const [aiSessionUrl, setAiSessionUrl] = useState('');
  const [aiHighlights, setAiHighlights] = useState<{ label: string; value: string }[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  // Load org suggestions
  useEffect(() => {
    let mounted = true;
    const loadSuggestions = async () => {
      try {
        const items = await fetchOrgAssignmentSuggestions('drawing', userId);
        if (mounted) {
          setOrgSuggestions(items);
        }
      } catch (error) {
        console.warn('[DrawingDashboard] Failed to load studio suggestions', error);
      }
    };
    loadSuggestions();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const applyOrgSuggestion = (suggestion: OrgAssignmentSuggestion) => {
    setNewSessionName(suggestion.fields?.name ?? suggestion.title ?? '');
    setNewSessionDate(suggestion.fields?.date ?? suggestion.fields?.session_date ?? '');
    setNewSessionDuration(suggestion.fields?.duration ?? suggestion.fields?.time ?? '');
    setNewSessionMedium(suggestion.fields?.medium ?? suggestion.fields?.materials ?? '');
    setNewSessionSubject(suggestion.fields?.subject ?? suggestion.fields?.focus ?? '');
    const skills = suggestion.fields?.skillsFocused ?? suggestion.fields?.skills ?? suggestion.fields?.focusAreas;
    if (Array.isArray(skills)) {
      setNewSessionSkills(skills.join(', '));
    } else if (typeof skills === 'string') {
      setNewSessionSkills(skills);
    }
    setNewSessionNotes(suggestion.fields?.notes ?? '');
  };

  const buildSessionHighlights = (data?: Partial<DrawingSession> & { focus_areas?: string[] }) => {
    if (!data) return [];
    const rows: { label: string; value: string }[] = [];
    if (data.date) rows.push({ label: 'Date', value: data.date });
    if (data.duration) rows.push({ label: 'Duration', value: data.duration });
    if (data.medium) rows.push({ label: 'Medium', value: data.medium });
    if (data.subject) rows.push({ label: 'Subject', value: data.subject });
    const focusAreas = data.focus_areas || data.skillsFocused;
    if (focusAreas && focusAreas.length) {
      rows.push({ label: 'Focus Areas', value: focusAreas.join(', ') });
    }
    if (data.notes) rows.push({ label: 'Notes', value: data.notes });
    return rows;
  };

  const handleAISessionExtraction = async ({ text, url }: { text: string; url?: string }) => {
    const payload = [text, url ? `Source: ${url}` : null].filter(Boolean).join('\n\n').trim();
    if (!payload) return;
    setIsExtracting(true);
    try {
      const agent = new SessionExtractionAgent();
      const result = await agent.extractSessionData(payload);
      if (!result.success || !result.data) {
        Alert.alert('Could not extract session details', result.error || 'Try adding more specific info.');
        return;
      }
      const extracted = result.data;
      if (extracted.name) setNewSessionName(extracted.name);
      if (extracted.date) setNewSessionDate(extracted.date);
      if (extracted.duration) setNewSessionDuration(extracted.duration);
      if (extracted.medium) setNewSessionMedium(extracted.medium);
      if (extracted.subject) setNewSessionSubject(extracted.subject);
      if (extracted.focus_areas?.length) setNewSessionSkills(extracted.focus_areas.join(', '));
      if (extracted.notes) setNewSessionNotes(extracted.notes);
      setAiHighlights(buildSessionHighlights({ ...extracted, focus_areas: extracted.focus_areas }));
      Alert.alert('Session details loaded', 'AI pre-filled the drawing session form.');
    } catch (error: any) {
      console.error('[DrawingDashboard] AI extraction failed', error);
      Alert.alert('AI Error', error?.message ?? 'Unable to parse this reference.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddSession = () => {
    if (!newSessionName.trim()) {
      Alert.alert('Error', 'Please enter a session name');
      return;
    }

    if (!newSessionDate.trim()) {
      Alert.alert('Error', 'Please add a date for this session.');
      return;
    }

    const parsedSkills = newSessionSkills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    const newSession: DrawingSession = {
      id: Date.now().toString(),
      name: newSessionName.trim(),
      date: newSessionDate.trim(),
      duration: newSessionDuration.trim() || '1 hour',
      medium: newSessionMedium.trim() || 'Mixed media',
      subject: newSessionSubject.trim() || 'Untitled study',
      status: 'planned',
      skillsFocused: parsedSkills.length ? parsedSkills : undefined,
      notes: newSessionNotes.trim() || undefined,
    };

    setSessions([...sessions, newSession]);
    Alert.alert('Success', `Drawing session "${newSessionName.trim()}" created!`);
    setNewSessionName('');
    setNewSessionDate('');
    setNewSessionDuration('');
    setNewSessionMedium('');
    setNewSessionSubject('');
    setNewSessionSkills('');
    setNewSessionNotes('');
    setAiSessionText('');
    setAiSessionUrl('');
    setAiHighlights([]);
    setShowAddModal(false);
  };

  // Get selected session

  // Render session card
  const renderSessionCard = (session: DrawingSession) => {
    const statusColors = {
      'in-progress': '#10B981',
      'planned': '#3B82F6',
      'completed': '#6B7280',
    };

    return (
      <View style={[styles.sessionCard, session.status === 'in-progress' && styles.sessionCardActive]}>
        <View style={styles.sessionHeader}>
          <View style={styles.sessionHeaderLeft}>
            <Text style={styles.sessionName}>{session.name}</Text>
            <Text style={styles.sessionSubject}>{session.subject}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[session.status] }]}>
            <Text style={styles.statusText}>{session.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.sessionTime}>
          <Text style={styles.sessionDate}>{session.date}</Text>
          <Text style={styles.sessionDuration}>{session.duration}</Text>
        </View>

        <View style={styles.sessionDetails}>
          <View style={styles.sessionDetail}>
            <Text style={styles.sessionDetailLabel}>🎨 Medium</Text>
            <Text style={styles.sessionDetailValue}>{session.medium}</Text>
          </View>
          {session.skillsFocused && session.skillsFocused.length > 0 && (
            <View style={styles.sessionDetail}>
              <Text style={styles.sessionDetailLabel}>🎯 Skills</Text>
              <Text style={styles.sessionDetailValue}>{session.skillsFocused.join(', ')}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Generate highlight event from selected session
  // Removed to hide the "Next Event" section
  const highlightEvent: HighlightEvent | undefined = undefined;

  // Quick actions
  const quickActions = DRAWING_ACTIONS.map((action) => ({
    ...action,
    onPress: () => {
      console.log('[DrawingAction]', action.id);
      services.analytics.trackEvent('drawing_action', { userId, actionId: action.id });
    },
  }));

  return (
    <>
      <UnifiedDomainDashboard
        items={sessions}
        selectedItemId={selectedSessionId}
        onItemSelect={setSelectedSessionId}
        renderCard={renderSessionCard}
        carouselTitle="Your Drawing Sessions"
        carouselSubtitle={`${sessions.length} ${sessions.length === 1 ? 'session' : 'sessions'} planned`}
        cardWidth={320}
        cardSpacing={16}
        onAddPress={() => setShowAddModal(true)}
        addCardLabel="Add Session"
        addCardSubtitle="Plan a new drawing session"
        tabBarLabels={DRAWING_TAB_LABELS}
        quickActions={quickActions}
        highlightEvent={highlightEvent}
        upcomingEvents={[]}
        renderGatherTab={() => (
          <ScrollView style={styles.gatherScroll} contentContainerStyle={styles.gatherContent}>
            <DrawingStrategyPlannerSection embedded />
          </ScrollView>
        )}
      />

      {/* Add Session Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Drawing Session</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalBody}>
              <OrgSuggestionList
                title="From your studios"
                suggestions={orgSuggestions}
                onApply={applyOrgSuggestion}
              />

              <AIAssistedEntryPanel
                title="AI session entry"
                description="Paste a prompt list, syllabus, or gallery link. AI will extract the session plan, medium, and focus areas."
                helperText="Include dates + mediums for best results. URLs to Miro boards or shared docs work too."
                textValue={aiSessionText}
                urlValue={aiSessionUrl}
                onChangeText={setAiSessionText}
                onChangeUrl={setAiSessionUrl}
                onSubmit={handleAISessionExtraction}
                isProcessing={isExtracting}
                highlights={aiHighlights}
                highlightTitle="Extracted session details"
              />

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Session Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newSessionName}
                  onChangeText={setNewSessionName}
                  placeholder="e.g., Portrait Study"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Date (YYYY-MM-DD) *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newSessionDate}
                  onChangeText={setNewSessionDate}
                  placeholder="2025-02-14"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Duration</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newSessionDuration}
                  onChangeText={setNewSessionDuration}
                  placeholder="e.g., 90 minutes"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Medium</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newSessionMedium}
                  onChangeText={setNewSessionMedium}
                  placeholder="Graphite, charcoal, watercolor..."
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Subject / Focus</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newSessionSubject}
                  onChangeText={setNewSessionSubject}
                  placeholder="Self-portrait study"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Skills or prompts</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newSessionSkills}
                  onChangeText={setNewSessionSkills}
                  placeholder="Gesture, value study, perspective"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Notes</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextarea]}
                  value={newSessionNotes}
                  onChangeText={setNewSessionNotes}
                  placeholder="References, instructor tips, or prompts"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleAddSession}
              >
                <Text style={styles.modalSaveText}>Add Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 220,
  },
  sessionCardActive: {
    borderColor: '#10B981',
    borderWidth: 2,
    shadowColor: '#10B981',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sessionHeaderLeft: {
    flex: 1,
  },
  sessionName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  sessionSubject: {
    fontSize: 14,
    color: '#64748B',
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
  sessionTime: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  sessionDuration: {
    fontSize: 14,
    color: '#64748B',
  },
  sessionDetails: {
    gap: 12,
  },
  sessionDetail: {
    marginBottom: 8,
  },
  sessionDetailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  sessionDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  skillsCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  notesCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  // Modal styles
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
    width: '100%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#64748B',
    fontWeight: '300',
  },
  modalBody: {
    padding: 20,
  },
  modalScroll: {
    maxHeight: 520,
  },
  modalField: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  modalTextarea: {
    minHeight: 120,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  modalSaveButton: {
    backgroundColor: '#8B5CF6',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  gatherScroll: {
    flex: 1,
  },
  gatherContent: {
    paddingBottom: 32,
  },
});

// ============================================================================
// Activity Type Definitions
// ============================================================================

const drawingActivity = createActivityType({
  id: 'drawing-session',
  name: 'Drawing Session',
  description: 'Track individual drawing practice sessions',
  icon: '✏️',
  metadataSchema: z.object({
    duration: z.number().min(1),
    medium: z.string(),
    subject: z.string(),
    notes: z.string().optional(),
  }),
  displayComponent: ({ activity }) => (
    <View style={{ padding: 16 }}>
      <Text>Drawing Session</Text>
      <Text>{activity.metadata.subject}</Text>
    </View>
  ),
  loggerComponent: ({ onSave }) => {
    return (
      <View style={{ padding: 16 }}>
        <Text>Log Drawing Session</Text>
        <Button
          title="Save"
          onPress={() => onSave({ duration: 60, medium: 'Pencil', subject: 'Still life' })}
          style={{}}
        />
      </View>
    );
  },
});

// ============================================================================
// Metric Definitions
// ============================================================================

const sessionsMetric = createMetric({
  id: 'session-count',
  name: 'Practice Sessions',
  description: 'Total number of drawing sessions',
  calculator: (activities) => activities.length,
  formatter: (value) => `${value} sessions`,
  chartConfig: {
    type: 'bar',
    color: '#8B5CF6',
  },
});

// ============================================================================
// AI Agent Definitions
// ============================================================================

const drawingCoach = createAgent({
  id: 'drawing-coach',
  name: 'Drawing Coach',
  description: 'AI assistant for improving drawing skills',
  systemPrompt: `You are an experienced drawing instructor helping artists improve their skills.
Provide constructive feedback, technique suggestions, and encouragement.
Focus on fundamentals like proportion, perspective, light, and shadow.`,
  tools: [],
  model: 'gpt-4',
});

// ============================================================================
// Domain Export
// ============================================================================

export default createDomain({
  meta: {
    id: 'drawing',
    name: 'BetterAt Drawing',
    description: 'Improve your drawing and artistic skills through deliberate practice',
    icon: '🎨',
    primaryColor: '#8B5CF6',
    version: '1.0.0',
    minPlatformVersion: '1.0.0',
  },
  activityTypes: [drawingActivity],
  metrics: [sessionsMetric],
  agents: [drawingCoach],
  routes: [
    {
      path: '/sessions',
      component: DrawingDashboard,
      name: 'Sessions',
      tabLabel: 'Sessions',
      tabIcon: '🎨',
    },
    {
      path: '/toolkits',
      component: ToolkitsScreen,
      name: 'Toolkits',
      tabLabel: 'Toolkits',
      tabIcon: '🧰',
    },
    {
      path: '/prompts',
      component: PromptsScreen,
      name: 'Prompts',
      tabLabel: 'Prompts',
      tabIcon: '🧠',
    },
    {
      path: '/inspiration',
      component: InspirationScreen,
      name: 'Inspiration',
      tabLabel: 'Inspiration',
      tabIcon: '🌍',
    },
    {
      path: '/more',
      component: DrawingMoreScreen,
      name: 'More',
      tabLabel: 'More',
      tabIcon: '☰',
    },
  ],
  components: {
    Dashboard: DrawingDashboard,
  },
});
