import type { ComponentType } from 'react';

declare module '@betterat/ui/components/domain-dashboard' {
  export type Tone = 'default' | 'info' | 'success' | 'warning' | 'danger';

  export interface MetricCardProps {
    label: string;
    value: string;
    deltaLabel?: string;
    tone?: Tone;
  }

  export const UnifiedDomainDashboard: ComponentType<any>;
}

declare module '@betterat/ui/components/domain-dashboard/ReadinessDashboard' {
  import type { MetricCardProps } from '@betterat/ui/components/domain-dashboard';

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
    columns?: Array<{ key: string; label: string; width?: number; align?: 'left' | 'right' }>;
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

  export const ReadinessDashboard: ComponentType<ReadinessDashboardProps>;
  export default ReadinessDashboard;
}

declare module '@betterat/ui/components/venue/VenueIntelSummary' {
  export type VenueIntelStatTrend = 'up' | 'down' | 'flat';

  export interface VenueIntelStat {
    id: string;
    label: string;
    value: string;
    detail?: string;
    trend?: VenueIntelStatTrend;
    icon?: string;
    accentColor?: string;
  }

  export type VenueIntelChecklistStatus = 'ready' | 'warning' | 'todo';

  export interface VenueIntelChecklistItem {
    id: string;
    label: string;
    status: VenueIntelChecklistStatus;
    description?: string;
    icon?: string;
  }

  export interface VenueIntelChecklistSection {
    id: string;
    title: string;
    items: VenueIntelChecklistItem[];
  }
}

declare module '@betterat/ui/components/venue/TravelResourceChips' {
  import type { MapLayers } from '@betterat/ui/components/venue/MapControls';

  export interface TravelResourceChipsProps {
    layers: MapLayers;
    onToggleLayer: (layer: keyof MapLayers) => void;
    metaOverrides?: Partial<Record<keyof MapLayers, Partial<{ label: string; icon: string; color: string }>>>;
  }

  export const TravelResourceChips: ComponentType<TravelResourceChipsProps>;
}

declare module '@betterat/ui/components/venue/MapControls' {
  export interface MapLayers {
    yachtClubs: boolean;
    sailmakers: boolean;
    riggers: boolean;
    coaches: boolean;
    chandlery: boolean;
    clothing: boolean;
    marinas: boolean;
    repair: boolean;
    engines: boolean;
  }

  export interface MapControlsProps {
    onToggle3D?: () => void;
    onToggleLayers?: () => void;
    onSearchNearby?: () => void;
    onSettings?: () => void;
    onToggleSavedVenues?: () => void;
    is3DEnabled?: boolean;
    areLayersVisible?: boolean;
    showOnlySavedVenues?: boolean;
    savedVenuesCount?: number;
    layers?: MapLayers;
    onLayersChange?: (layers: MapLayers) => void;
  }

  export const MapControls: ComponentType<MapControlsProps>;
}
