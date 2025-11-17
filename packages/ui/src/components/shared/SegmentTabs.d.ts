import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
export interface SegmentTabOption {
    label: string;
    value: string;
    badge?: string;
}
interface SegmentTabsProps {
    options: SegmentTabOption[];
    value: string;
    onChange: (value: string) => void;
    style?: StyleProp<ViewStyle>;
}
declare const SegmentTabs: React.FC<SegmentTabsProps>;
export default SegmentTabs;
//# sourceMappingURL=SegmentTabs.d.ts.map