/**
 * UnifiedDomainDashboard - A reusable dashboard component that works across domains
 *
 * This component provides a consistent UX pattern:
 * - Horizontal carousel of domain items (races, shifts, etc.) at the top
 * - Selected item detail view below
 * - Quick actions specific to the domain
 * - Flexible content area for domain-specific metrics and information
 */
import React, { ReactNode } from 'react';
import { type QuickAction, type HighlightEvent, type UpcomingEvent } from './EventOverview';
import { type TabType } from './TabBar';
export interface UnifiedDomainDashboardProps<T = any> {
    items: T[];
    selectedItemId?: string | null;
    onItemSelect?: (id: string) => void;
    renderCard: (item: T) => ReactNode;
    carouselTitle: string;
    carouselSubtitle?: string;
    cardWidth?: number;
    cardSpacing?: number;
    onAddPress?: () => void;
    addCardLabel?: string;
    addCardSubtitle?: string;
    hero?: {
        title: string;
        subtitle: string;
        primaryCtaLabel: string;
        onPrimaryCta?: () => void;
    };
    quickActions?: QuickAction[];
    highlightEvent?: HighlightEvent | null;
    upcomingEvents?: UpcomingEvent[];
    renderGatherTab?: () => ReactNode;
    renderCreateTab?: () => ReactNode;
    renderShareTab?: () => ReactNode;
    renderReflectTab?: () => ReactNode;
    tabBarLabels?: Partial<Record<TabType, {
        label?: string;
        description?: string;
    }>>;
    children?: ReactNode;
    style?: any;
    carouselStyle?: any;
    dashboardStyle?: any;
}
export declare const UnifiedDomainDashboard: <T extends {
    id: string;
}>({ items, selectedItemId, onItemSelect, renderCard, carouselTitle, carouselSubtitle, cardWidth, cardSpacing, onAddPress, addCardLabel, addCardSubtitle, hero, quickActions, highlightEvent, upcomingEvents, renderGatherTab, renderCreateTab, renderShareTab, renderReflectTab, tabBarLabels, children, style, carouselStyle, dashboardStyle, }: UnifiedDomainDashboardProps<T>) => React.JSX.Element;
export default UnifiedDomainDashboard;
//# sourceMappingURL=UnifiedDomainDashboard.d.ts.map