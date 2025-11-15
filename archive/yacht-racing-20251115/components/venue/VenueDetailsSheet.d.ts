/**
 * VenueDetailsSheet Component
 * Apple Maps-style bottom sheet for venue information
 */
import React from 'react';
interface Venue {
    id: string;
    name: string;
    country: string;
    region: string;
    venue_type: string;
    coordinates_lat: number;
    coordinates_lng: number;
}
export interface VenueDetailsSheetProps {
    venue: Venue | null;
    onClose: () => void;
}
export declare function VenueDetailsSheet({ venue, onClose }: VenueDetailsSheetProps): React.JSX.Element | null;
export {};
//# sourceMappingURL=VenueDetailsSheet.d.ts.map