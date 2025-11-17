import React from 'react';
import type { MapLayers } from '@betterat/ui/components/venue/MapControls';
type ResourceKey = keyof MapLayers;
export interface TravelResourceChipsProps {
    layers: MapLayers;
    onToggleLayer: (layer: ResourceKey) => void;
    metaOverrides?: Partial<Record<ResourceKey, Partial<ResourceMeta>>>;
}
type ResourceMeta = {
    label: string;
    icon: string;
    color: string;
};
export declare function TravelResourceChips({ layers, onToggleLayer, metaOverrides }: TravelResourceChipsProps): React.JSX.Element;
export {};
//# sourceMappingURL=TravelResourceChips.d.ts.map