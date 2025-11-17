import React from 'react';
export interface VenueHeroCardProps {
    venueName: string;
    country?: string;
    region?: string;
    distanceLabel?: string;
    travelTip?: string;
    windSummary?: string;
    onNavigate?: () => void;
    onSave?: () => void;
    isSaved?: boolean;
    latitude?: number;
    longitude?: number;
}
export declare function VenueHeroCard({ venueName, country, region, distanceLabel, travelTip, windSummary, onNavigate, onSave, isSaved, latitude, longitude, }: VenueHeroCardProps): React.JSX.Element;
//# sourceMappingURL=VenueHeroCard.d.ts.map