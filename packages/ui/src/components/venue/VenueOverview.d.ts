import React from 'react';
import { type VenueHeroCardProps } from './VenueHeroCard';
import { type VenueIntelStat, type VenueIntelChecklistSection } from './VenueIntelSummary';
import { TravelResourceChipsProps } from './TravelResourceChips';
export interface VenueOverviewProps {
    hero: VenueHeroCardProps;
    stats?: VenueIntelStat[];
    checklist?: VenueIntelChecklistSection[];
    chips?: TravelResourceChipsProps;
    children?: React.ReactNode;
}
export declare const VenueOverview: ({ hero, stats, checklist, chips, children }: VenueOverviewProps) => React.JSX.Element;
export default VenueOverview;
//# sourceMappingURL=VenueOverview.d.ts.map