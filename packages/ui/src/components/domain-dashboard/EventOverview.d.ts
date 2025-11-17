import React from 'react';
export interface QuickAction {
    id: string;
    label: string;
    icon?: string;
    onPress?: () => void;
}
export interface ChecklistRow {
    label: string;
    state: 'complete' | 'pending' | 'warning';
}
export interface EventAction {
    label: string;
    onPress?: () => void;
    variant?: 'default' | 'secondary';
}
export interface HighlightEvent {
    name: string;
    dateRange: string;
    venue: string;
    info?: string;
    checklist?: ChecklistRow[];
    actions?: EventAction[];
}
export interface UpcomingEvent {
    id: string;
    name: string;
    date: string;
    venue: string;
    badge?: string;
}
export interface EmptyStateConfig {
    icon?: string;
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
}
export interface EventOverviewProps {
    hero?: {
        title: string;
        subtitle: string;
        primaryCtaLabel: string;
        onPrimaryCta?: () => void;
    };
    quickActions?: QuickAction[];
    highlightEvent?: HighlightEvent | null;
    upcomingEvents?: UpcomingEvent[];
    emptyState?: EmptyStateConfig;
    fabLabel?: string;
    onFabPress?: () => void;
    children?: React.ReactNode;
}
export declare const EventOverviewSurface: ({ hero, quickActions, highlightEvent, upcomingEvents, emptyState, children, }: EventOverviewProps) => React.JSX.Element;
export declare const EventOverviewDashboard: (props: EventOverviewProps) => React.JSX.Element;
export default EventOverviewDashboard;
//# sourceMappingURL=EventOverview.d.ts.map