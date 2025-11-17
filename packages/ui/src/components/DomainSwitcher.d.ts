import React from 'react';
import { ViewStyle } from 'react-native';
import { DomainMeta } from './DomainCard';
export interface DomainSwitcherProps {
    activeDomains: string[];
    currentDomainId: string | null;
    onSwitch: (domainId: string) => void;
    domainMetadata?: Record<string, DomainMeta>;
    style?: ViewStyle;
}
export declare const DomainSwitcher: React.FC<DomainSwitcherProps>;
//# sourceMappingURL=DomainSwitcher.d.ts.map