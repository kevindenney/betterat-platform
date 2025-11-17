import React from 'react';
import { type DataTableColumn, type MetricCardProps } from './base';
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
        infoRows: {
            label: string;
            value: string;
        }[];
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
    protests: {
        label: string;
        meta: string;
    }[];
    mapMeta?: MapMeta;
    copy?: ReadinessDashboardCopy;
}
export declare const ReadinessDashboard: ({ loading, error, hero, stages, actionLabels, kpis, crewRows, logisticsChecklist, timelineItems, selectedTimeline, onSelectTimeline, weatherRows, analyticsCards, aiNotes, documents, finishing, protests, mapMeta, copy, }: ReadinessDashboardProps) => React.JSX.Element;
export default ReadinessDashboard;
//# sourceMappingURL=ReadinessDashboard.d.ts.map