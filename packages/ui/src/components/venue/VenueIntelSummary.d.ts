import React from 'react';
import { type VenueHeroCardProps } from './VenueHeroCard';
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
interface VenueIntelSummaryProps {
    hero: VenueHeroCardProps;
    stats?: VenueIntelStat[];
    checklist?: VenueIntelChecklistSection[];
    headerEyebrow?: string;
    headerTitle?: string;
    headerSubtitle?: string;
    resourceChips?: React.ReactNode;
    footer?: React.ReactNode;
}
export declare function VenueIntelSummary({ hero, stats, checklist, headerEyebrow, headerTitle, headerSubtitle, resourceChips, footer, }: VenueIntelSummaryProps): React.JSX.Element;
export default VenueIntelSummary;
//# sourceMappingURL=VenueIntelSummary.d.ts.map