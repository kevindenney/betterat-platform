import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  ChecklistItem,
  DashboardSection,
  DataTable,
  InfoStack,
  MetricCard,
  StatusBadge,
  type DataTableColumn,
  type MetricCardProps,
} from './base';
import { TimelineStrip } from './TimelineStrip';

export interface StageItem {
  label: string;
  status: string;
  meta: string;
  tone: 'default' | 'info' | 'success' | 'warning' | 'danger';
}

export interface TimelineItem {
  id: string;
  label: string;
  summary: string;
  notes: string[];
  timestamp?: string | null;
  status?: string | null;
}

export interface WeatherRow {
  label: string;
  value: string;
  detail: string;
}

export interface CrewDisplayRow {
  role: string;
  sailor: string;
  call: string;
  readiness: string;
}

export interface DocumentDisplayRow {
  type: string;
  owner: string;
  updated: string;
  status: string;
}

export interface FinishingRow {
  place: string;
  boat: string;
  delta: string;
  points: string;
}

export interface ChecklistEntry {
  label: string;
  meta: string;
  status: string;
  tone: 'default' | 'info' | 'success' | 'warning' | 'danger';
}

interface SectionCopy {
  title: string;
  description?: string;
}

interface TableSectionCopy extends SectionCopy {
  columns?: DataTableColumn[];
}

interface AISectionCopy extends SectionCopy {
  buttonLabel?: string;
}

export interface ReadinessDashboardCopy {
  heroBadgeLabel?: string;
  readiness?: SectionCopy;
  crew?: TableSectionCopy;
  map?: SectionCopy;
  timeline?: SectionCopy;
  logistics?: SectionCopy;
  weather?: SectionCopy;
  analytics?: SectionCopy;
  ai?: AISectionCopy;
  protests?: SectionCopy;
  documents?: TableSectionCopy;
  finishing?: TableSectionCopy;
  mapPlaceholder?: string;
}

interface MapMeta {
  title: string;
  subtitle: string;
  badge?: string;
}

export interface ReadinessDashboardProps {
  loading?: boolean;
  error?: string | null;
  hero: {
    title: string;
    description: string;
    infoRows: { label: string; value: string }[];
    countdownLabel: string;
  };
  stages: StageItem[];
  actionLabels: string[];
  kpis: MetricCardProps[];
  crewRows: CrewDisplayRow[];
  logisticsChecklist: ChecklistEntry[];
  timelineItems: TimelineItem[];
  selectedTimeline: string;
  onSelectTimeline: (label: string) => void;
  weatherRows: WeatherRow[];
  analyticsCards: MetricCardProps[];
  aiNotes: string[];
  documents: DocumentDisplayRow[];
  finishing: FinishingRow[];
  protests: { label: string; meta: string }[];
  mapMeta?: MapMeta;
  copy?: ReadinessDashboardCopy;
}

const DEFAULT_CREW_COLUMNS: DataTableColumn[] = [
  { key: 'role', label: 'Role' },
  { key: 'sailor', label: 'Crew' },
  { key: 'call', label: 'Call time' },
  { key: 'readiness', label: 'Status', align: 'right' },
];

const DEFAULT_DOCUMENT_COLUMNS: DataTableColumn[] = [
  { key: 'type', label: 'File' },
  { key: 'owner', label: 'Owner' },
  { key: 'updated', label: 'Updated' },
  { key: 'status', label: 'Status', align: 'right' },
];

const DEFAULT_FINISHING_COLUMNS: DataTableColumn[] = [
  { key: 'place', label: 'Place', width: 50 },
  { key: 'boat', label: 'Boat' },
  { key: 'delta', label: 'Delta' },
  { key: 'points', label: 'Points', align: 'right', width: 80 },
];

const defaultCopy: Required<ReadinessDashboardCopy> = {
  heroBadgeLabel: 'Countdown',
  readiness: {
    title: 'Race readiness',
    description: 'Auto-updated from rig presets, crew sync, and compliance tasks.',
  },
  crew: {
    title: 'Crew confirmations',
    description: 'Helm assigns readiness from the BetterAt app before dock-out.',
    columns: DEFAULT_CREW_COLUMNS,
  },
  map: {
    title: 'Race course',
    description: 'Live location intelligence blended with venue models and polars.',
  },
  timeline: {
    title: 'Tactical layers',
    description: 'BetterAt threads planning, start toolbox, and contingencies into one strip.',
  },
  logistics: {
    title: 'Logistics + safety',
    description: 'Everything the race officer expects before you leave the dock.',
  },
  weather: {
    title: 'Weather + tide',
    description: 'BetterAt blends RaceSense stations with HKO models every 12 minutes.',
  },
  analytics: {
    title: 'Performance analytics',
    description: 'Post-race insights auto-sync after tracker upload.',
  },
  ai: {
    title: 'AI tactical desk',
    description: 'Claude syncs SSB chatter, sensor feeds, and mark calls into one suggestion stack.',
    buttonLabel: 'Open full race brief',
  },
  protests: {
    title: 'Protests & jury log',
  },
  documents: {
    title: 'Documents',
    columns: DEFAULT_DOCUMENT_COLUMNS,
  },
  finishing: {
    title: 'Finishing order',
    description: 'Autoscored from committee upload with protest adjustments applied.',
    columns: DEFAULT_FINISHING_COLUMNS,
  },
  mapPlaceholder: 'Map & polars streaming from onboard tracker',
};

const MetricGrid = ({ data }: { data: MetricCardProps[] }) => (
  <View style={styles.metricGrid}>
    {data.map((metric) => (
      <MetricCard key={metric.label} {...metric} />
    ))}
  </View>
);

const StageRail = ({ stages }: { stages: StageItem[] }) => (
  <View style={styles.stageRail}>
    {stages.map((stage) => (
      <View key={stage.label} style={styles.stageCard}>
        <View style={styles.stageHeader}>
          <Text style={styles.stageLabel}>{stage.label}</Text>
          <StatusBadge label={stage.status} tone={stage.tone} subtle />
        </View>
        <Text style={styles.stageMeta}>{stage.meta}</Text>
      </View>
    ))}
  </View>
);

const TimelineCard = ({ label, summary, notes }: TimelineItem) => (
  <View style={styles.timelineCard}>
    <Text style={styles.timelineLabel}>{label}</Text>
    <Text style={styles.timelineSummary}>{summary}</Text>
    <View style={styles.timelineList}>
      {notes.map((note) => (
        <View key={`${label}-${note}`} style={styles.timelineListRow}>
          <View style={styles.timelineBullet} />
          <Text style={styles.timelineNote}>{note}</Text>
        </View>
      ))}
    </View>
  </View>
);

const MapPanel = ({ title, subtitle, badge, placeholder }: { title: string; subtitle: string; badge?: string; placeholder: string }) => (
  <View style={styles.mapPanel}>
    <View style={styles.mapHeader}>
      <View>
        <Text style={styles.mapTitle}>{title}</Text>
        <Text style={styles.mapMeta}>{subtitle}</Text>
      </View>
      {badge ? <StatusBadge label={badge} tone="info" /> : null}
    </View>
    <View style={styles.mapCanvas}>
      <Text style={styles.mapPlaceholder}>{placeholder}</Text>
    </View>
  </View>
);

const ActionBar = ({ actions }: { actions: string[] }) => (
  <View style={styles.actionBar}>
    {actions.map((action) => (
      <TouchableOpacity key={action} style={styles.actionChip}>
        <Text style={styles.actionChipText}>{action}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export const ReadinessDashboard = ({
  loading = false,
  error,
  hero,
  stages,
  actionLabels,
  kpis,
  crewRows,
  logisticsChecklist,
  timelineItems,
  selectedTimeline,
  onSelectTimeline,
  weatherRows,
  analyticsCards,
  aiNotes,
  documents,
  finishing,
  protests,
  mapMeta = {
    title: 'Causeway Bay · Harbor East course',
    subtitle: 'Lat 22.279 / Lon 114.185 · Course length 7.8 nm',
    badge: 'Live tracker armed',
  },
  copy,
}: ReadinessDashboardProps) => {
  const copyConfig = {
    heroBadgeLabel: copy?.heroBadgeLabel ?? defaultCopy.heroBadgeLabel,
    readiness: { ...defaultCopy.readiness, ...copy?.readiness },
    crew: {
      ...defaultCopy.crew,
      ...copy?.crew,
      columns: copy?.crew?.columns ?? defaultCopy.crew.columns,
    },
    map: { ...defaultCopy.map, ...copy?.map },
    timeline: { ...defaultCopy.timeline, ...copy?.timeline },
    logistics: { ...defaultCopy.logistics, ...copy?.logistics },
    weather: { ...defaultCopy.weather, ...copy?.weather },
    analytics: { ...defaultCopy.analytics, ...copy?.analytics },
    ai: {
      ...defaultCopy.ai,
      ...copy?.ai,
      buttonLabel: copy?.ai?.buttonLabel ?? defaultCopy.ai.buttonLabel,
    },
    protests: { ...defaultCopy.protests, ...copy?.protests },
    documents: {
      ...defaultCopy.documents,
      ...copy?.documents,
      columns: copy?.documents?.columns ?? defaultCopy.documents.columns,
    },
    finishing: {
      ...defaultCopy.finishing,
      ...copy?.finishing,
      columns: copy?.finishing?.columns ?? defaultCopy.finishing.columns,
    },
    mapPlaceholder: copy?.mapPlaceholder ?? defaultCopy.mapPlaceholder,
  };

  const timelineActive = timelineItems.filter((item) => item.label === selectedTimeline);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.syncBanner}>
            <ActivityIndicator color="#4338CA" />
            <Text style={styles.syncText}>Syncing live data…</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <StageRail stages={stages} />

        <DashboardSection
          title={hero.title}
          description={hero.description}
          actions={<StatusBadge label={copyConfig.heroBadgeLabel} value={hero.countdownLabel} tone="info" />}
        >
          <InfoStack rows={hero.infoRows} />
          <ActionBar actions={actionLabels} />
        </DashboardSection>

        <DashboardSection title={copyConfig.readiness.title} description={copyConfig.readiness.description}>
          <MetricGrid data={kpis} />
        </DashboardSection>

        <DashboardSection title={copyConfig.crew.title} description={copyConfig.crew.description}>
          <DataTable
            columns={copyConfig.crew.columns ?? DEFAULT_CREW_COLUMNS}
            rows={crewRows.map((row) => ({
              role: row.role,
              sailor: row.sailor,
              call: row.call,
              readiness: row.readiness,
            }))}
          />
        </DashboardSection>

        <DashboardSection title={copyConfig.map.title} description={copyConfig.map.description}>
          <MapPanel
            title={mapMeta.title}
            subtitle={mapMeta.subtitle}
            badge={mapMeta.badge}
            placeholder={copyConfig.mapPlaceholder}
          />
        </DashboardSection>

        <DashboardSection title={copyConfig.timeline.title} description={copyConfig.timeline.description}>
          <TimelineStrip events={timelineItems} />
          <View style={styles.timelineTabs}>
            {timelineItems.map((timeline) => (
              <TouchableOpacity
                key={timeline.id}
                style={[styles.timelineTab, selectedTimeline === timeline.label && styles.timelineTabActive]}
                onPress={() => onSelectTimeline(timeline.label)}
              >
                <Text style={[styles.timelineTabText, selectedTimeline === timeline.label && styles.timelineTabTextActive]}>
                  {timeline.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {timelineActive.map((item) => (
            <TimelineCard key={item.id} {...item} />
          ))}
        </DashboardSection>

        <DashboardSection title={copyConfig.logistics.title} description={copyConfig.logistics.description}>
          {logisticsChecklist.map((item) => (
            <ChecklistItem key={item.label} {...item} />
          ))}
        </DashboardSection>

        <DashboardSection title={copyConfig.weather.title} description={copyConfig.weather.description}>
          <View style={styles.weatherGrid}>
            {weatherRows.map((row) => (
              <View key={row.label} style={styles.weatherCard}>
                <Text style={styles.weatherLabel}>{row.label}</Text>
                <Text style={styles.weatherValue}>{row.value}</Text>
                <Text style={styles.weatherMeta}>{row.detail}</Text>
              </View>
            ))}
          </View>
        </DashboardSection>

        <DashboardSection title={copyConfig.analytics.title} description={copyConfig.analytics.description}>
          <MetricGrid data={analyticsCards} />
        </DashboardSection>

        <DashboardSection title={copyConfig.ai.title} description={copyConfig.ai.description}>
          <View style={styles.aiCard}>
            {aiNotes.map((note) => (
              <View key={note} style={styles.aiNote}>
                <View style={styles.timelineBullet} />
                <Text style={styles.aiNoteText}>{note}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.aiButton}>
              <Text style={styles.aiButtonText}>{copyConfig.ai.buttonLabel}</Text>
            </TouchableOpacity>
          </View>
        </DashboardSection>

        <DashboardSection title={copyConfig.protests.title} description={copyConfig.protests.description}>
          {protests.map((item) => (
            <View key={item.label} style={styles.protestRow}>
              <Text style={styles.protestLabel}>{item.label}</Text>
              <Text style={styles.protestMeta}>{item.meta}</Text>
            </View>
          ))}
        </DashboardSection>

        <DashboardSection title={copyConfig.documents.title} description={copyConfig.documents.description}>
          <DataTable
            columns={copyConfig.documents.columns ?? DEFAULT_DOCUMENT_COLUMNS}
            rows={documents.map((doc) => ({
              type: doc.type,
              owner: doc.owner,
              updated: doc.updated,
              status: doc.status,
            }))}
          />
        </DashboardSection>

        <DashboardSection title={copyConfig.finishing.title} description={copyConfig.finishing.description}>
          <DataTable
            columns={copyConfig.finishing.columns ?? DEFAULT_FINISHING_COLUMNS}
            rows={finishing.map((row) => ({
              place: row.place,
              boat: row.boat,
              delta: row.delta,
              points: row.points,
            }))}
          />
        </DashboardSection>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  container: {
    padding: 20,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#E0E7FF',
  },
  syncText: {
    color: '#1E1B4B',
    fontWeight: '600',
  },
  errorBanner: {
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    color: '#991B1B',
    fontWeight: '600',
  },
  stageRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  stageCard: {
    flex: 1,
    minWidth: 180,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  stageMeta: {
    fontSize: 13,
    color: '#475569',
  },
  actionBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  actionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#E0E7FF',
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#312E81',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mapPanel: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#111827',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  mapMeta: {
    fontSize: 14,
    color: '#CBD5F5',
  },
  mapCanvas: {
    height: 220,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  mapPlaceholder: {
    color: '#CBD5F5',
    fontSize: 14,
    textAlign: 'center',
  },
  timelineTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  timelineTab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },
  timelineTabActive: {
    backgroundColor: '#312E81',
  },
  timelineTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  timelineTabTextActive: {
    color: '#FFFFFF',
  },
  timelineCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#1E1B4B',
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C7D2FE',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  timelineSummary: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  timelineList: {
    gap: 8,
  },
  timelineListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A5B4FC',
  },
  timelineNote: {
    color: '#E0E7FF',
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  weatherCard: {
    flex: 1,
    minWidth: 150,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#0F172A',
  },
  weatherLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  weatherValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginVertical: 4,
  },
  weatherMeta: {
    fontSize: 13,
    color: '#CBD5F5',
  },
  aiCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    gap: 12,
  },
  aiNote: {
    flexDirection: 'row',
    gap: 10,
  },
  aiNoteText: {
    color: '#E0E7FF',
    flex: 1,
  },
  aiButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#4338CA',
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  protestRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },
  protestLabel: {
    fontWeight: '600',
    color: '#0F172A',
  },
  protestMeta: {
    color: '#475569',
  },
});

export default ReadinessDashboard;
