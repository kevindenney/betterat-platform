/**
 * SavedNetworkSection Component
 * Displays user's saved places in their sailing network for a location
 */
import React from 'react';
import { NetworkPlace } from '@/services/SailingNetworkService';
interface SavedNetworkSectionProps {
    locationName: string;
    savedPlaces: NetworkPlace[];
    onPlacePress: (place: NetworkPlace) => void;
    onRemovePlace?: (place: NetworkPlace) => void;
}
export declare function SavedNetworkSection({ locationName, savedPlaces, onPlacePress, onRemovePlace, }: SavedNetworkSectionProps): React.JSX.Element;
export {};
//# sourceMappingURL=SavedNetworkSection.d.ts.map