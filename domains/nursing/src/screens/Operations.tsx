import React, { useEffect, useMemo, useState } from 'react';
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
  OrgSuggestionList,
  StrategyPhaseCard,
  StrategyCollaborationPanel,
  WorkflowExecutionConsole,
  CollaborationBroadcastConsole,
  PostEventAnalysisConsole,
  type StrategyCardTheme,
  useDomainStrategyPlanner,
  type UseDomainStrategyPlannerResult,
  type HighlightEvent,
  type QuickAction,
  type UpcomingEvent,
  type StrategyCollaborationPanelProps,
} from '@betterat/ui';
import {
  fetchOrgAssignmentSuggestions,
  type OrgAssignmentSuggestion,
} from '@betterat/core/services/orgAssignments';
import { generateDomainPhaseSuggestion } from '@betterat/ai';
import { Sun, Users, Stethoscope, Activity, Inbox } from 'lucide-react-native';
import {
  getStrategyPhases,
  type StrategyPhaseDefinition,
  type StrategyPlanFields,
} from '@betterat/core';
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
  // Removed quick action buttons to match updated design
  // { id: 'log-shift', label: 'Log shift', icon: '🩺' },
  // { id: 'start-huddle', label: 'Start huddle', icon: '👥' },
  // { id: 'escalate', label: 'Rapid response', icon: '⚡' },
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

const NURSING_PHASES = getStrategyPhases('nursing');

const NURSING_STRATEGY_THEME: StrategyCardTheme = {
  cardBackground: '#FFFBF2',
  cardBorder: '#EADCC6',
  aiBackground: '#FFF7E8',
  aiBorder: '#F0E4D1',
  refreshBackground: '#FFFBF2',
  refreshBorder: '#EADCC6',
  refreshText: '#5C4D3F',
  eyebrowColor: '#7A6D5F',
  pillBorder: '#DECEB8',
  pillLabel: '#7A6D5F',
  pillText: '#4D3F35',
  iconBackground: '#F8EEDC',
  iconColor: '#5C4D3F',
};

const NURSING_FIELD_LABELS = {
  what: {
    label: 'What patient / unit priority are we driving?',
  },
  why: {
    label: 'Why does this priority matter right now?',
  },
  how: {
    label: 'How will the team execute (protocols, resources)?',
  },
  who: {
    label: 'Who is accountable / on point for this?',
    placeholder: 'Charge RN, resource nurse, educator…',
  },
};
const NURSING_PHASE_ICONS: Record<string, React.ReactNode> = {
  pre_shift: <Sun size={18} color={NURSING_STRATEGY_THEME.iconColor} strokeWidth={1.6} />,
  huddles: <Users size={18} color={NURSING_STRATEGY_THEME.iconColor} strokeWidth={1.6} />,
  rounds: <Stethoscope size={18} color={NURSING_STRATEGY_THEME.iconColor} strokeWidth={1.6} />,
  critical: <Activity size={18} color={NURSING_STRATEGY_THEME.iconColor} strokeWidth={1.6} />,
  handoff: <Inbox size={18} color={NURSING_STRATEGY_THEME.iconColor} strokeWidth={1.6} />,
};

const NursingOperationsScreen: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  // Shift state
  const [shifts, setShifts] = useState<Shift[]>(SAMPLE_SHIFTS);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(SAMPLE_SHIFTS[0]?.id || null);

  // Add shift modal state
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftUnit, setNewShiftUnit] = useState('');
  const [newShiftTime, setNewShiftTime] = useState('');

  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [orgSuggestions, setOrgSuggestions] = useState<OrgAssignmentSuggestion[]>([]);
  const selectedShift = shifts.find((s) => s.id === selectedShiftId) || shifts[0];
  const [careSequenceActive, setCareSequenceActive] = useState(false);
  const [careSequenceCompletedAt, setCareSequenceCompletedAt] = useState<string | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [debriefResponses, setDebriefResponses] = useState<Record<string, string>>({});

  const strategyPlanner = useDomainStrategyPlanner({
    domainId: 'nursing',
    entityId: selectedShiftId,
    entityTitle: selectedShift?.name,
    phases: NURSING_PHASES,
    context: selectedShift
      ? {
          unit: selectedShift.unit,
          staffing: selectedShift.staffing,
          acuity: selectedShift.acuity,
          status: selectedShift.status,
        }
      : undefined,
    generateSuggestion: generateDomainPhaseSuggestion,
  });

  useEffect(() => {
    console.log('[NursingOps] Mounted operations screen', {
      sampleShiftCount: shifts.length,
      userId,
    });

    const loadSuggestions = async () => {
      const items = await fetchOrgAssignmentSuggestions('nursing', userId);
      setOrgSuggestions(items);
    };
    loadSuggestions();
  }, [userId, shifts.length]);

  useEffect(() => {
    if (selectedShiftId && selectedShift) {
      services.analytics.trackEvent('nursing_strategy_context_loaded', {
        shiftId: selectedShiftId,
        unit: selectedShift.unit,
      });
    }
    setCareSequenceActive(false);
    setCareSequenceCompletedAt(null);
    setBroadcastMessage('');
    setDebriefResponses({});
  }, [selectedShiftId, selectedShift, services.analytics]);

  const handleAddShift = () => {
    if (!newShiftName.trim()) {
      Alert.alert('Error', 'Please enter a shift name');
      return;
    }

    if (!newShiftUnit.trim()) {
      Alert.alert('Error', 'Please enter a unit');
      return;
    }

    // Create new shift
    const newShift: Shift = {
      id: Date.now().toString(),
      name: newShiftName.trim(),
      date: 'Upcoming',
      time: newShiftTime.trim() || '07:00 - 19:00',
      unit: newShiftUnit.trim(),
      staffing: 'To be assigned',
      acuity: 'Acuity pending',
      status: 'scheduled',
    };

    // Add to the list
    setShifts([...shifts, newShift]);

    Alert.alert('Success', `Shift "${newShiftName}" created!`);
    setNewShiftName('');
    setNewShiftUnit('');
    setNewShiftTime('');
    setShowAddShiftModal(false);
    services.analytics.trackEvent('nursing_shift_added', { userId, shiftName: newShiftName });
  };

  const handleAction = (id: string) => {
    services.analytics.trackEvent('nursing_ops_action', { userId, actionId: id });
    console.log('[NursingOps] handleAction fired', { id });
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

  const applyOrgSuggestion = (suggestion: OrgAssignmentSuggestion) => {
    if (suggestion.fields?.name) setNewShiftName(suggestion.fields.name);
    if (suggestion.fields?.unit) setNewShiftUnit(suggestion.fields.unit);
    if (suggestion.fields?.time) setNewShiftTime(suggestion.fields.time);
    Alert.alert('Suggestion loaded', `${suggestion.title} from ${suggestion.orgName}`);
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

  console.log('[NursingOps] Rendering', {
    activeActionId,
    draftKeys: Object.keys(draftNotes),
    sampleShiftCount: SAMPLE_SHIFTS.length,
    selectedShiftId,
  });

  const careContextPills = useMemo(() => {
    if (!selectedShift) return [];
    const pills = [selectedShift.unit];
    if (selectedShift.staffing) {
      pills.push(selectedShift.staffing);
    }
    if (selectedShift.acuity) {
      pills.push(selectedShift.acuity);
    }
    return pills;
  }, [selectedShift]);

  const careSequenceOptions = useMemo(() => ([
    {
      id: 'rounds',
      label: 'Patient rounds loop',
      description: 'Bedside + vitals audit (45 min)',
      durationSeconds: 45 * 60,
    },
    {
      id: 'med-pass',
      label: 'Medication pass',
      description: 'Dose + education sprint (30 min)',
      durationSeconds: 30 * 60,
    },
    {
      id: 'handoff',
      label: 'Handoff prep',
      description: 'Chart review + summary (15 min)',
      durationSeconds: 15 * 60,
    },
  ]), []);

  const careLiveMetrics = useMemo(() => {
    if (!selectedShift) return [];
    return [
      {
        id: 'coverage',
        label: 'Staffing coverage',
        value: selectedShift.staffing || 'TBD',
        status: selectedShift.status === 'in-progress' ? 'positive' : undefined,
      },
      {
        id: 'acuity',
        label: 'Acuity index',
        value: selectedShift.acuity || 'n/a',
        status: Number(selectedShift.acuity?.replace(/[^\d.]/g, '') || 0) > 2 ? 'warning' : undefined,
      },
      {
        id: 'checklist',
        label: 'Checklist status',
        value: careSequenceActive ? 'Running' : careSequenceCompletedAt ? 'Complete' : 'Idle',
      },
    ];
  }, [selectedShift, careSequenceActive, careSequenceCompletedAt]);

  const careInsightStatus: 'waiting' | 'tracking' | 'ready' = careSequenceActive
    ? 'tracking'
    : careSequenceCompletedAt
      ? 'ready'
      : 'waiting';

  const careInsights = useMemo(() => ([
    {
      id: 'assignments',
      label: 'Assignments locked',
      detail: 'Charge nurse will see deltas pushed from this session.',
      status: careInsightStatus,
      metric: selectedShift?.status === 'in-progress' ? 'LIVE' : 'Prep',
    },
    {
      id: 'safety',
      label: 'Safety board',
      detail: 'Falls + pressure injury tasks auto-track via console.',
      status: careInsightStatus,
      metric: 'Goal: 0 gaps',
    },
    {
      id: 'handoff',
      label: 'Handoff packet',
      detail: 'Packages summary + outstanding orders for next team.',
      status: careInsightStatus,
      metric: 'Ready at 18:30',
    },
  ]), [careInsightStatus, selectedShift?.status]);

  const careEvidencePrompts = useMemo(() => ([
    {
      id: 'safety-board',
      label: 'Safety board photo',
      description: 'Snap before/after so educator sees updates.',
      acceptedTypes: ['Photo'],
    },
    {
      id: 'vitals-feed',
      label: 'Vitals feed',
      description: 'Attach screenshot of outlier watchlist.',
      acceptedTypes: ['Image', 'Link'],
    },
    {
      id: 'handoff',
      label: 'Handoff summary',
      description: 'Upload PDF or note for cross-shift coaching.',
      acceptedTypes: ['PDF', 'Doc'],
    },
  ]), []);

  const broadcastAudiences = useMemo(() => ([
    {
      id: 'charge',
      label: 'Charge + staff',
      description: 'Live shift updates to everyone on the floor.',
      channel: 'BetterAt Team Chat',
      defaultEnabled: true,
      badge: 'Core',
    },
    {
      id: 'command',
      label: 'Command center',
      description: 'Escalate staffing or beds to hospital ops.',
      channel: 'Command console',
      defaultEnabled: false,
    },
    {
      id: 'educator',
      label: 'Educator',
      description: 'Share coaching targets + evidence.',
      channel: 'Direct DM',
      defaultEnabled: true,
    },
    {
      id: 'float',
      label: 'Float pool',
      description: 'Request surge coverage or specialty support.',
      channel: 'SMS + pager',
      defaultEnabled: false,
    },
  ]), []);

  const broadcastTemplates = useMemo(() => {
    const shiftName = selectedShift?.name || 'this shift';
    return [
      {
        id: 'safety',
        label: 'Safety + staffing',
        summary: `Safety briefing for ${shiftName}`,
        body: 'Highlights:\n- Staffing & acuity snapshot\n- Unit risks\n- Specific help needed',
      },
      {
        id: 'handoff',
        label: 'Handoff prep',
        summary: 'What next team needs to know',
        body: 'Patients to watch\nOutstanding orders\nFamily updates',
      },
      {
        id: 'coach',
        label: 'Coach check-in',
        summary: 'Share progress on coaching goals',
        body: 'Wins to celebrate\nGaps to review\nRequests for resources',
      },
    ];
  }, [selectedShift?.name]);

  const broadcastAttachments = useMemo(() => ([
    {
      id: 'staffing-board',
      label: 'Attach staffing board',
      helper: 'Photo upload keeps charge + command aligned.',
      actionLabel: 'Upload',
      onAttach: () => services.analytics.trackEvent('nursing_broadcast_attach_staffing', { userId }),
    },
    {
      id: 'incident',
      label: 'Add incident log',
      helper: 'PDF or Doc of incident to escalate quickly.',
      actionLabel: 'Attach',
      onAttach: () => services.analytics.trackEvent('nursing_broadcast_attach_incident', { userId }),
    },
    {
      id: 'media',
      label: 'Upload media',
      helper: 'Images/video for team education or celebration.',
      actionLabel: 'Add',
      onAttach: () => services.analytics.trackEvent('nursing_broadcast_attach_media', { userId }),
    },
  ]), [services.analytics, userId]);

  const debriefContext = useMemo(() => {
    if (!selectedShift) return [];
    return [
      { label: 'Shift', value: selectedShift.name },
      { label: 'Unit', value: selectedShift.unit },
      { label: 'Time', value: selectedShift.time },
    ];
  }, [selectedShift]);

  const debriefOperationalSummary = useMemo(() => {
    if (!selectedShift) return [];
    return [
      { label: 'Staffing', value: selectedShift.staffing },
      { label: 'Acuity', value: selectedShift.acuity },
    ];
  }, [selectedShift]);

  const debriefQuestions = useMemo(() => ([
    {
      id: 'pre_shift',
      label: 'Pre-shift prep',
      prompt: 'Did staffing + supplies match the plan?',
      helper: 'Call out gaps or clever reallocations.',
    },
    {
      id: 'huddles',
      label: 'Huddles',
      prompt: 'How did the team align? Any messaging misses?',
    },
    {
      id: 'rounds',
      label: 'Bedside rounds',
      prompt: 'Where did we save time / get stuck?',
    },
    {
      id: 'critical',
      label: 'Critical events',
      prompt: 'Rapid responses, escalations, or transfers to document.',
    },
    {
      id: 'handoff',
      label: 'Handoff',
      prompt: 'Was the next team set up for success?',
    },
  ]), []);

  const debriefMetrics = useMemo(() => debriefQuestions.slice(0, 3).map((question) => ({
    id: question.id,
    label: question.label,
    plan: 'Follow the shift playbook',
    actual: debriefResponses[question.id]?.slice(0, 80) || 'Need your note',
    delta: debriefResponses[question.id] ? 'Queued for coaching review' : undefined,
    suggestion: 'Capture specifics so educator can coach with evidence.',
  })), [debriefQuestions, debriefResponses]);

  const debriefImprovementIdeas = useMemo(() => ([
    {
      id: 'staffing-flex',
      title: 'Flex staffing playbook',
      detail: 'Document how you balanced float requests so ops can template it.',
      aiTag: 'AI note',
    },
    {
      id: 'handoff-gap',
      title: 'Handoff clarity',
      detail: 'Highlight orders or families that caused churn to improve scripts.',
      aiTag: 'Coach focus',
    },
  ]), []);

  const debriefSummary = useMemo(() => {
    if (!selectedShift) return undefined;
    return `Anthropic will compare your notes from ${selectedShift.name} to staffing + acuity data to recommend playbook updates.`;
  }, [selectedShift]);

  const handleCareSequenceStart = () => {
    setCareSequenceActive(true);
    setCareSequenceCompletedAt(null);
  };

  const handleCareSequenceStop = () => {
    setCareSequenceActive(false);
    setCareSequenceCompletedAt(new Date().toISOString());
  };

  const handleBroadcastSend = () => {
    services.analytics.trackEvent('nursing_broadcast_send', {
      userId,
      shiftId: selectedShiftId,
      excerpt: broadcastMessage.slice(0, 120),
    });
  };

  const handleDebriefResponseChange = (id: string, value: string) => {
    setDebriefResponses((prev) => ({
      ...prev,
      [id]: value,
    }));
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
        renderGatherTab={() => (
          <NursingStrategyPlanner
            planner={strategyPlanner}
            selectedShift={selectedShift}
            theme={NURSING_STRATEGY_THEME}
          />
        )}
        renderCreateTab={() => (
          <WorkflowExecutionConsole
            title={selectedShift ? `${selectedShift.name} • Care console` : 'Care console'}
            subtitle="Run your shift loops, capture evidence, and keep staffing synced."
            contextPills={careContextPills}
            sequenceOptions={careSequenceOptions}
            liveMetrics={careLiveMetrics}
            insights={careInsights}
            evidencePrompts={careEvidencePrompts}
            onSequenceStart={handleCareSequenceStart}
            onSequenceStop={handleCareSequenceStop}
          />
        )}
        renderShareTab={() => (
          <CollaborationBroadcastConsole
            title="Broadcast to the floor + command"
            subtitle="Send staffing updates, coaching notes, and incident escalations."
            briefingContext={careContextPills}
            audiences={broadcastAudiences}
            message={broadcastMessage}
            onMessageChange={setBroadcastMessage}
            templates={broadcastTemplates}
            attachments={broadcastAttachments}
            onSend={handleBroadcastSend}
          />
        )}
        renderReflectTab={() => (
          <PostEventAnalysisConsole
            title="Debrief the shift"
            subtitle="Capture what happened so educators + AI can close the loop."
            context={debriefContext}
            weatherSummary={debriefOperationalSummary}
            strategySummary={selectedShift?.status ? `Status: ${selectedShift.status}` : undefined}
            trackSummary={
              careSequenceActive
                ? 'Care console running.'
                : careSequenceCompletedAt
                  ? `Last checklist completed at ${new Date(careSequenceCompletedAt).toLocaleTimeString()}`
                  : 'Start a loop to capture evidence.'
            }
            metrics={debriefMetrics}
            questions={debriefQuestions}
            responses={debriefResponses}
            onResponseChange={handleDebriefResponseChange}
            improvementIdeas={debriefImprovementIdeas}
            aiSummary={debriefSummary}
            callToAction={{
              label: 'Send recap to educator',
              helper: 'Shares notes + evidence to coaching workspace',
              onPress: () => services.analytics.trackEvent('nursing_debrief_share', { userId, shiftId: selectedShiftId }),
            }}
          />
        )}
      />

      {/* Add Shift Modal */}
      <Modal
        visible={showAddShiftModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddShiftModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule New Shift</Text>
              <TouchableOpacity
                onPress={() => setShowAddShiftModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.modalBody}>
              <OrgSuggestionList
                title="From your hospital/university"
                suggestions={orgSuggestions}
                onApply={applyOrgSuggestion}
              />

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Shift Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newShiftName}
                  onChangeText={setNewShiftName}
                  placeholder="e.g., Day Telemetry"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Unit *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newShiftUnit}
                  onChangeText={setNewShiftUnit}
                  placeholder="e.g., South Tower L4"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Time</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newShiftTime}
                  onChangeText={setNewShiftTime}
                  placeholder="e.g., 07:00 - 19:00"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <Text style={styles.modalHint}>
                * Required fields. Staffing and acuity will be assigned during scheduling.
              </Text>
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowAddShiftModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleAddShift}
              >
                <Text style={styles.modalSaveText}>Schedule Shift</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {drawerNode}
    </>
  );
};

type NursingStrategyPlannerProps = {
  selectedShift: Shift | null | undefined;
  planner: UseDomainStrategyPlannerResult;
  theme: StrategyCardTheme;
};

const NursingStrategyPlanner: React.FC<NursingStrategyPlannerProps> = ({ selectedShift, planner, theme }) => {
  if (!selectedShift) {
    return <Text style={styles.strategyPlaceholder}>Select a shift to begin planning.</Text>;
  }

  const phaseMap = useMemo(() => {
    return planner.phases.reduce<Record<string, StrategyPhaseDefinition>>((acc, phase) => {
      acc[phase.id] = phase;
      return acc;
    }, {});
  }, [planner.phases]);

  const historyEntries = useMemo(() => Object.entries(planner.history).slice(0, 3), [planner.history]);
  const collaborationPanel = useMemo(
    () => buildNursingCollaborationModel(selectedShift, planner),
    [selectedShift, planner.plans, planner.suggestions],
  );

  return (
    <View style={styles.strategyContainer}>
      <Text style={styles.strategyIntro}>
        Draft the shift playbook. For each phase, document what, why, how, and who. Use refresh to pull updated AI suggestions.
      </Text>
      <TouchableOpacity style={styles.strategyRefresh} onPress={planner.refreshAll}>
        <Text style={styles.strategyRefreshText}>Refresh AI suggestions</Text>
      </TouchableOpacity>

      {historyEntries.length ? (
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Performance Signals</Text>
          {historyEntries.map(([phaseId, history]) => {
            const phase = phaseMap[phaseId];
            const recentPlan = history.recent?.[0]?.plan?.what;
            return (
              <View key={phaseId} style={styles.historyRow}>
                <Text style={styles.historyPhase}>{phase?.title ?? phaseId}</Text>
                <Text style={styles.historyMeta}>{recentPlan ?? 'No plan logged yet'}</Text>
                <Text style={styles.historyMetaSecondary}>
                  {history.totalEntries} entries · confidence {history.lastConfidence ?? 'n/a'}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {collaborationPanel ? (
        <StrategyCollaborationPanel
          heading={collaborationPanel.heading}
          description={collaborationPanel.description}
          connectionLabel={collaborationPanel.connectionLabel}
          connectionDescription={collaborationPanel.connectionDescription}
          collaborators={collaborationPanel.collaborators}
          topics={collaborationPanel.topics}
        />
      ) : null}

      {planner.phases.map((phase) => (
        <StrategyPhaseCard
          key={phase.id}
          phaseId={phase.id}
          title={phase.title}
          subtitle={phase.subtitle}
          aiSuggestion={planner.suggestions?.[phase.id]}
          plan={planner.plans?.[phase.id] ?? { what: '', why: '', how: '', who: '' }}
          onPlanChange={planner.setPlan}
          saving={planner.planStatus?.[phase.id] === 'saving'}
          errorMessage={planner.planErrors?.[phase.id] ?? null}
          onRefreshSuggestion={planner.refreshPhase}
          refreshInFlight={planner.refreshing?.[phase.id]}
          theme={theme}
          icon={NURSING_PHASE_ICONS[phase.id]}
          fieldLabels={NURSING_FIELD_LABELS}
        />
      ))}
    </View>
  );
};

function buildNursingCollaborationModel(
  selectedShift: Shift | null | undefined,
  planner: UseDomainStrategyPlannerResult,
): StrategyCollaborationPanelProps | null {
  if (!selectedShift) return null;

  const unitLabel = selectedShift.unit ?? 'unit';
  const planFor = (phaseId: string, field: keyof StrategyPlanFields, fallback: string) => {
    const value = planner.plans?.[phaseId]?.[field];
    return value?.trim() ? value.trim() : fallback;
  };

  const collaborators = [
    {
      id: 'charge-ally',
      name: 'K. Alvarez',
      subtitle: 'Charge RN • 5E Med/Surg',
      status: 'Shared 10 min ago',
      planFocus: 'Float RN split between pods B + C',
    },
    {
      id: 'icu-liason',
      name: 'D. Greene',
      subtitle: 'ICU liaison',
      status: 'Need update',
      planFocus: '2 step-down candidates by 13:00',
    },
    {
      id: 'educator',
      name: 'Unit educator bot',
      subtitle: 'Skills grid + policy nudges',
      status: 'Auto-sync',
      planFocus: 'Handoff script refresh',
    },
    {
      id: 'float-team',
      name: 'Float pool lead',
      subtitle: 'Covers med-surg + telemetry',
      status: 'Online now',
      planFocus: 'Ready for surge assignment',
    },
  ];

  const topics = [
    {
      id: 'staffing',
      title: 'Staffing + acuity match-ups',
      detail: 'Compare nurse:patient ratios and acuity spikes with the neighboring med-surg cohorts before the huddle.',
      ourPlanLabel: 'Your focus',
      ourPlan: planFor('pre_shift', 'what', 'Document staffing risks to unlock peer help'),
      peerPlanLabel: 'Peer update',
      peerPlan: '5E Med/Surg pulled float RN for pod B; monitoring tele overflow rooms 412/416.',
      peerSource: 'Shared by K. Alvarez · 10 min ago',
      callout: 'Flag any sitter shortages so the float pool lead can redistribute.',
      tags: ['Staffing', 'Acuity'],
    },
    {
      id: 'rounds',
      title: 'Rounding & education cues',
      detail: 'Charge nurses are swapping bedside education priorities (sepsis, new devices) to keep huddles aligned.',
      ourPlanLabel: 'Your rounds message',
      ourPlan: planFor('rounds', 'why', 'Capture what you need the rounding team to reinforce'),
      peerPlanLabel: 'Neighbor unit cue',
      peerPlan: 'Telemetry focusing on delirium prevention kits rooms 405/409.',
      peerSource: 'Telemetry pod lead',
      callout: 'Share your education handout so Tele can mirror scripting.',
      tags: ['Rounds', 'Education'],
    },
    {
      id: 'handoff',
      title: 'Critical escalation pairing',
      detail: 'Rapid response captains across similar units are posting trends (labs, vents, sitter usage) to align escalation trees.',
      ourPlanLabel: 'Your escalation plan',
      ourPlan: planFor('critical', 'how', 'Make sure the protocol + who-to-call is written down'),
      peerPlanLabel: 'Community insight',
      peerPlan: 'ICU liaison ready for sepsis watch in pods A+C · ask for arterial line kit if MAP <65.',
      peerSource: 'ICU liaison thread',
      callout: 'Tag the liaison directly if your MAP triggers drop below 65 twice within an hour.',
      tags: ['Escalation', 'Safety'],
    },
  ];

  return {
    heading: 'Unit collaboration hub',
    description: `Coordinate with ${unitLabel} peers across the hospital without leaving your shift planner.`,
    connectionLabel: `Join ${unitLabel} cohort`,
    connectionDescription: 'Connect charge RNs with matching acuity to co-plan staffing, education, and escalation strategies.',
    collaborators,
    topics,
  };
}

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
  // Add Shift Modal styles
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
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
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
  modalHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  strategyContainer: {
    padding: 24,
    gap: 18,
    backgroundColor: '#FFFCF5',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EADCC6',
    marginTop: 16,
  },
  strategyIntro: {
    fontSize: 14,
    color: '#6B6258',
  },
  strategyRefresh: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D8CCBA',
    backgroundColor: '#FFFDF8',
  },
  strategyRefreshText: {
    fontSize: 12,
    letterSpacing: 1,
    color: '#5C4D3F',
    textTransform: 'uppercase',
  },
  historyCard: {
    borderWidth: 1,
    borderColor: '#EADCC6',
    borderRadius: 18,
    backgroundColor: '#FFF9EF',
    padding: 16,
    gap: 12,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#7A6D5F',
  },
  historyRow: {
    borderTopWidth: 1,
    borderTopColor: '#F3E7D7',
    paddingTop: 10,
  },
  historyPhase: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3C2F23',
  },
  historyMeta: {
    fontSize: 13,
    color: '#5C4D3F',
    marginTop: 2,
  },
  historyMetaSecondary: {
    fontSize: 12,
    color: '#8B7B6B',
    marginTop: 2,
  },
  strategyPlaceholder: {
    padding: 20,
    fontSize: 14,
    color: '#94A3B8',
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
    backgroundColor: palette.primary,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default NursingOperationsScreen;
