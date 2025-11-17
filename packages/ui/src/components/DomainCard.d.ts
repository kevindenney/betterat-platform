import React from 'react';
import { ViewStyle } from 'react-native';
export interface DomainMeta {
    id: string;
    name: string;
    icon?: string;
    description?: string;
    color?: string;
    version?: string;
}
export interface DomainCardProps {
    domain: DomainMeta;
    isActive: boolean;
    onPress?: () => void;
    style?: ViewStyle;
}
export declare const DomainCard: React.FC<DomainCardProps>;
//# sourceMappingURL=DomainCard.d.ts.map