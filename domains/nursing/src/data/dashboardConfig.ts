import type { MetricCardProps } from '@betterat/ui/components/domain-dashboard';
import type {
  ChecklistEntry,
  CrewDisplayRow,
  DocumentDisplayRow,
  FinishingRow,
  ReadinessDashboardCopy,
  StageItem,
  TimelineItem,
  WeatherRow,
} from '@betterat/ui/components/domain-dashboard/ReadinessDashboard';

export const NURSING_STAGE_ITEMS: StageItem[] = [
  { label: 'Intake', status: 'Assignments locked', meta: '8 patients · 2 admits', tone: 'info' },
  { label: 'Pre-brief', status: 'Team huddle 06:45', meta: 'Charge RN ready', tone: 'success' },
  { label: 'Rounds', status: 'Start 07:10', meta: 'ICU step-down first', tone: 'default' },
  { label: 'Escalations', status: '0 active', meta: 'Rapid response on standby', tone: 'success' },
  { label: 'Debrief', status: 'Scheduled 19:20', meta: 'QI packet queued', tone: 'warning' },
];

export const NURSING_KPI_METRICS: MetricCardProps[] = [
  { label: 'Bed readiness', value: '94%', deltaLabel: '+6% vs yesterday', tone: 'success' },
  { label: 'Sepsis screenings', value: '12 / 12', deltaLabel: 'All within window', tone: 'success' },
  { label: 'Pain reassess', value: '88%', deltaLabel: 'Goal 90%', tone: 'warning' },
  { label: 'Discharge bundle', value: '3 pending', deltaLabel: 'Expected by 15:00', tone: 'info' },
];

export const NURSING_CARE_TEAM: CrewDisplayRow[] = [
  { role: 'Charge RN', sailor: 'Jordan Reyes', call: 'Telemetry + admit flow', readiness: 'On shift' },
  { role: 'Resource RN', sailor: 'Casey Wong', call: 'Procedures / IV restarts', readiness: 'Floating' },
  { role: 'Primary RN', sailor: 'Lena Park', call: 'Beds 401-403', readiness: 'On rounds' },
  { role: 'Primary RN', sailor: 'Eshan Rao', call: 'Beds 404-406', readiness: 'On rounds' },
  { role: 'Resident', sailor: 'Dr. Angie Lam', call: 'Step-down coverage', readiness: 'Ready' },
];

export const NURSING_CHECKLIST: ChecklistEntry[] = [
  { label: 'IV pumps calibrated', meta: 'Biomed cleared 05:30', status: 'Complete', tone: 'success' },
  { label: 'Isolation rooms prepped', meta: '2 negative pressure rooms stocked', status: 'Ready', tone: 'info' },
  { label: 'Blood products check', meta: 'Type + cross verified', status: 'Complete', tone: 'success' },
  { label: 'Medication fridge temp log', meta: 'Signed by pharmacy', status: 'Due 18:00', tone: 'warning' },
];

export const NURSING_TIMELINE: TimelineItem[] = [
  {
    id: 'nursing-pre-shift',
    label: 'Pre-shift briefing',
    summary: 'Focus on post-op patient 402 · chest tube watch',
    notes: ['Escalate drainage >150 mL/hr', 'Prep RT consult for 09:00', 'Family update scheduled 11:30'],
  },
  {
    id: 'nursing-on-floor',
    label: 'On-floor cadence',
    summary: 'Rounds q2h · neuro checks synced with resident pager',
    notes: ['Pain reassess within 1 hr', 'Urine outputs to shared sheet', 'Keep bed 406 on falls bundle'],
  },
  {
    id: 'nursing-debrief',
    label: 'Debrief + learning',
    summary: 'Capture 3 learning signals before 19:30 huddle',
    notes: ['Document simulation gaps', 'Tag notable saves in BetterAt', 'Prep QI clip for weekend team'],
  },
];

export const NURSING_SIGNALS: WeatherRow[] = [
  { label: 'Admissions', value: '2 arriving', detail: 'Both telemetry upgrades' },
  { label: 'Acuity mix', value: '40% step-down', detail: 'High observation load' },
  { label: 'Rapid response', value: '0 in last 24h', detail: 'Simulation on schedule' },
  { label: 'Patient satisfaction', value: '4.7 / 5', detail: 'Top driver: bedside updates' },
];

export const NURSING_ANALYTICS: MetricCardProps[] = [
  { label: 'Charting backlog', value: '12 mins', deltaLabel: '-8 mins vs avg', tone: 'success' },
  { label: 'Medication pass accuracy', value: '99.3%', deltaLabel: '+0.4%', tone: 'success' },
  { label: 'Falls bundle compliance', value: '86%', deltaLabel: 'Focus rooms 405/406', tone: 'warning' },
  { label: 'Simulation reps', value: '3 this week', deltaLabel: 'Night drill tonight', tone: 'info' },
];

export const NURSING_AI_NOTES = [
  'Stagger neuro checks with respiratory assessments to open a 20-minute coaching window at 10:15.',
  'Add a micro-drill on bedside blood culture prep—2 misses last shift.',
  'Log the sepsis bundle win on patient 403 to auto-generate the reflection template.',
];

export const NURSING_INCIDENTS = [
  { label: 'Medication near-miss (room 405)', meta: 'Intercepted at dispensing · follow-up complete' },
  { label: 'Equipment escalation', meta: 'Portable monitor swap · vendor ETA 14:00' },
];

export const NURSING_DOCUMENTS: DocumentDisplayRow[] = [
  { type: 'Night shift playbook', owner: 'Clinical education', updated: 'May 14 · 22:10', status: 'Shared' },
  { type: 'Rapid response checklist', owner: 'Quality', updated: 'May 13 · 17:55', status: 'Signed' },
  { type: 'New hire competency grid', owner: 'Nurse manager', updated: 'May 12 · 08:20', status: 'Draft' },
  { type: 'Pressure injury bundle', owner: 'Wound team', updated: 'May 10 · 15:02', status: 'Shared' },
];

export const NURSING_PRIORITIES: FinishingRow[] = [
  { place: '1', boat: 'Post-op 402', delta: 'Chest tube watch', points: 'High' },
  { place: '2', boat: 'Telemetry 405', delta: 'Start diuresis plan', points: 'Medium' },
  { place: '3', boat: 'Step-down 406', delta: 'Falls bundle refresh', points: 'Medium' },
  { place: '4', boat: 'Observation 401', delta: 'Discharge teaching 14:00', points: 'Medium' },
];

export const NURSING_ACTION_BUTTONS = ['Log learning signal', 'Share shift brief', 'Open competency map'];

export const NURSING_MAP_META = {
  title: 'Telemetry · South Tower Level 4',
  subtitle: '12 beds · 2 isolation · 1 step-down pod',
  badge: 'Patient board synced',
};

export const NURSING_COPY: ReadinessDashboardCopy = {
  heroBadgeLabel: 'Shift clock',
  readiness: {
    title: 'Shift readiness',
    description: 'Auto-refreshes from staffing, equipment sensors, and BetterAt checklists.',
  },
  crew: {
    title: 'Care team',
    description: 'Live readiness for every role covering Telemetry South.',
    columns: [
      { key: 'role', label: 'Role' },
      { key: 'sailor', label: 'Team member' },
      { key: 'call', label: 'Current focus' },
      { key: 'readiness', label: 'Status', align: 'right' },
    ],
  },
  map: {
    title: 'Unit overview',
    description: 'Monitor coverage, isolation rooms, and acuity pods.',
  },
  timeline: {
    title: 'Care timeline',
    description: 'Briefing, on-floor cadence, and debrief focus in one strip.',
  },
  logistics: {
    title: 'Clinical checklists',
    description: 'Cross-team equipment and safety gates before rounds.',
  },
  weather: {
    title: 'Unit signals',
    description: 'Admissions, acuity, and operational watchpoints.',
  },
  analytics: {
    title: 'Quality metrics',
    description: 'Indicators streaming from charting and bedside devices.',
  },
  ai: {
    title: 'Coaching desk',
    description: 'AI surfaces deliberate practice prompts per shift.',
    buttonLabel: 'Open coaching brief',
  },
  protests: {
    title: 'Incidents & escalations',
    description: 'Live feed from charge RN and quality teams.',
  },
  documents: {
    title: 'Reference library',
    description: 'Latest bundles and playbooks pinned for this unit.',
    columns: [
      { key: 'type', label: 'Resource' },
      { key: 'owner', label: 'Owner' },
      { key: 'updated', label: 'Updated' },
      { key: 'status', label: 'Status', align: 'right' },
    ],
  },
  finishing: {
    title: 'Shift priorities',
    description: 'Charge RN focus list with live status.',
    columns: [
      { key: 'place', label: 'Priority', width: 80 },
      { key: 'boat', label: 'Focus' },
      { key: 'delta', label: 'Action' },
      { key: 'points', label: 'Status', align: 'right', width: 100 },
    ],
  },
  mapPlaceholder: 'Unit layout, monitor feeds, and staffing heat map',
};
