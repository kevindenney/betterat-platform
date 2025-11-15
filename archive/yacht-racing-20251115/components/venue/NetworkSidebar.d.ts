/**
 * NetworkSidebar Component
 * Google Maps-style search sidebar for sailing network
 */
import React from 'react';
import { NetworkPlace } from '@/services/SailingNetworkService';
export interface NetworkSidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onPlacePress: (place: NetworkPlace) => void;
}
export declare function NetworkSidebar({ isCollapsed, onToggleCollapse, onPlacePress, }: NetworkSidebarProps): React.JSX.Element;
//# sourceMappingURL=NetworkSidebar.d.ts.map