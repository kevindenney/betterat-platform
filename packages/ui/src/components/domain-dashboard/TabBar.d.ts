/**
 * TabBar - A shared tab navigation component for domain dashboards
 *
 * Provides a consistent Orient → Execute → Share → Reflect loop across domains
 */
import React from 'react';
export type TabType = 'gather' | 'create' | 'share' | 'reflect';
export interface TabDefinition {
    key: TabType;
    label: string;
    description?: string;
}
export interface TabBarProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    style?: any;
    tabs?: TabDefinition[];
}
export declare const DEFAULT_TAB_DEFINITIONS: TabDefinition[];
export declare const TabBar: React.FC<TabBarProps>;
export default TabBar;
//# sourceMappingURL=TabBar.d.ts.map