import type { MetricCardProps } from '@betterat/ui/components/domain-dashboard';
import type {
  ChecklistEntry,
  CrewDisplayRow,
  DocumentDisplayRow,
  FinishingRow,
  StageItem,
  TimelineItem,
  WeatherRow,
} from '@betterat/ui/components/domain-dashboard/ReadinessDashboard';

export const DEFAULT_STAGE_ITEMS: StageItem[] = [
  { label: 'Plan', status: 'Course locked', meta: 'Weather synced', tone: 'info' },
  { label: 'On-water', status: 'Dock out 07:40', meta: 'Tracker armed', tone: 'default' },
  { label: 'Debrief', status: 'Template ready', meta: 'Crew upload pending', tone: 'default' },
  { label: 'Documents', status: '5 files', meta: 'All signed', tone: 'success' },
  { label: 'Safety', status: 'Green', meta: 'All checklists cleared', tone: 'success' },
];

export const DEFAULT_KPI_METRICS: MetricCardProps[] = [
  { label: 'Start discipline', value: '92%', deltaLabel: '+4% week over week', tone: 'success' },
  { label: 'Average position', value: '3.4', deltaLabel: 'Fleet: 18 boats', tone: 'info' },
  { label: 'Rig readiness', value: '100%', deltaLabel: '2 presets synced', tone: 'success' },
  { label: 'Crew confirmations', value: '7/7', deltaLabel: 'All check-ins complete', tone: 'success' },
];

export const DEFAULT_CREW_ROWS: CrewDisplayRow[] = [
  { role: 'Helm', sailor: 'Avery Lau', call: '07:15 dock brief', readiness: 'Ready' },
  { role: 'Tactics', sailor: 'Marco Ng', call: '07:15 dock brief', readiness: 'Ready' },
  { role: 'Main trim', sailor: 'Ivy Wong', call: '07:25 spin check', readiness: 'Ready' },
  { role: 'Flight trim', sailor: 'Liam Ho', call: '07:25 spin check', readiness: 'Ready' },
  { role: 'Bow', sailor: 'Clara Tse', call: '07:10 forestay load', readiness: 'Watch' },
];

export const DEFAULT_LOGISTICS_CHECKLIST: ChecklistEntry[] = [
  { label: 'Dock master clearance', meta: 'Shared with Royal Hong Kong YC', status: 'Sent', tone: 'info' },
  { label: 'Fuel + chase boat', meta: 'Range 42 nm ready', status: 'Ready', tone: 'success' },
  { label: 'Coach transfer', meta: 'Tender departs 07:05', status: 'Ready', tone: 'success' },
  { label: 'Nutrition packs', meta: 'Cold storage locker 4', status: 'Packed', tone: 'info' },
];

const seedNow = new Date();
const addMinutes = (mins: number) => new Date(seedNow.getTime() + mins * 60000).toISOString();

export const DEFAULT_TACTICS_TIMELINE: TimelineItem[] = [
  {
    id: 'default-course-intel',
    label: 'Course intel',
    summary: 'SSW 12-14 kts · 6 leg windward/leeward',
    notes: ['Gate bias 6° port', 'Leeward current 0.8 kt flood', 'Shortened finish possible'],
    timestamp: addMinutes(-45),
  },
  {
    id: 'default-start-toolbox',
    label: 'Start toolbox',
    summary: 'P line favored, 1:40 time on distance',
    notes: ['Transit: signal boat → IFC', 'Trigger: boat length gybe into final run', 'Plan B: mid-line reach'],
    timestamp: addMinutes(-10),
  },
  {
    id: 'default-contingencies',
    label: 'Contingencies',
    summary: 'If breeze right-shifts 20°, swap to preset #6',
    notes: ['Storm cell arrives ~11:10', 'Ebb window opens 13:05', 'SSB channel 72 backup'],
    timestamp: addMinutes(25),
  },
];

export const DEFAULT_WEATHER_ROWS: WeatherRow[] = [
  { label: 'Wind', value: '12 → 16 kts SSW', detail: 'Gusts 18 kts at top mark' },
  { label: 'Tide', value: '0.8 kt flood', detail: 'Slack predicted 12:52' },
  { label: 'Visibility', value: '8 nm', detail: 'Haze risk after 14:30' },
  { label: 'Sea state', value: '0.6 m chop', detail: 'Short period, expect hobby-horsing' },
];

export const DEFAULT_ANALYTICS_CARDS: MetricCardProps[] = [
  { label: 'VMG trend', value: '+0.18 kts', deltaLabel: 'vs. last regatta', tone: 'success' },
  { label: 'Layline accuracy', value: '87%', deltaLabel: 'Goal 92%', tone: 'warning' },
  { label: 'Mark round timing', value: '00:42', deltaLabel: '-6s improvement', tone: 'success' },
  { label: 'Penalty risk', value: 'Low', deltaLabel: '0 protests filed', tone: 'success' },
];

export const DEFAULT_AI_NOTES = [
  'Protect starboard approach for Race 2—fleet bias aggressively to committee.',
  'Expect right shift after Leg 3 when storm cell pushes the gradient.',
  "If we're 5+ lengths down at first top mark, call preset #6 and sail the pressure lanes.",
];

export const DEFAULT_DOCUMENTS: DocumentDisplayRow[] = [
  { type: 'Notice of Race', owner: 'HKSF', updated: 'May 12, 20:44', status: 'Signed' },
  { type: 'Sailing Instructions', owner: 'Royal HKYC', updated: 'May 13, 08:05', status: 'Signed' },
  { type: 'Coach briefing deck', owner: 'BetterAt', updated: 'May 14, 21:17', status: 'Shared' },
  { type: 'Safety manifest', owner: 'Ops', updated: 'May 14, 22:01', status: 'Signed' },
];

export const DEFAULT_FINISHING_ORDER: FinishingRow[] = [
  { place: '1', boat: 'Black Kite', delta: '—', points: '1' },
  { place: '2', boat: 'BetterAt / HKG 223', delta: '+00:21', points: '2' },
  { place: '3', boat: 'Zephyr', delta: '+01:46', points: '3' },
  { place: '4', boat: 'White Lotus', delta: '+02:08', points: '4' },
];

export const DEFAULT_PROTESTS = [
  { label: 'Port / starboard - Race 3 Leg 1', meta: 'Filed by HKG 223 · Status: In review' },
  { label: 'Start line OCS inquiry', meta: 'Filed by Zephyr · Cleared by RC' },
];

export const DEFAULT_ACTION_BUTTONS = ['Add race note', 'Share prep kit', 'Open race brief'];
