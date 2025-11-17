import React from 'react';
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
interface MapControlsProps {
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
export declare function MapControls({ onToggle3D, onToggleLayers, onSearchNearby, onSettings, onToggleSavedVenues, is3DEnabled, areLayersVisible, showOnlySavedVenues, savedVenuesCount, layers: externalLayers, onLayersChange, }: MapControlsProps): React.JSX.Element;
export {};
//# sourceMappingURL=MapControls.d.ts.map