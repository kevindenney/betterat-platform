import React from 'react';
import { type VenueMapViewProps } from './VenueMapView';
import { type VenueOverviewProps } from './VenueOverview';
export interface VenueIntelligenceLayoutProps {
    overview: VenueOverviewProps;
    map: VenueMapViewProps;
    sidebar: React.ReactNode;
    detailsSheet?: React.ReactNode;
    controls?: React.ReactNode;
    mapOverlay?: React.ReactNode;
    rightPanel?: React.ReactNode;
}
export declare const VenueIntelligenceLayout: ({ overview, map, sidebar, detailsSheet, controls, mapOverlay, rightPanel, }: VenueIntelligenceLayoutProps) => React.JSX.Element;
export default VenueIntelligenceLayout;
//# sourceMappingURL=VenueIntelligenceLayout.d.ts.map