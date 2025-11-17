import React, { ReactNode } from 'react';
type Tone = 'default' | 'info' | 'success' | 'warning' | 'danger';
export interface DashboardSectionProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
    style?: any;
}
export declare const DashboardSection: ({ title, description, actions, children, style, }: DashboardSectionProps) => React.JSX.Element;
export interface MetricCardProps {
    label: string;
    value: string;
    deltaLabel?: string;
    tone?: Tone;
}
export declare const MetricCard: ({ label, value, deltaLabel, tone }: MetricCardProps) => React.JSX.Element;
export interface StatusBadgeProps {
    label: string;
    value?: string;
    tone?: Tone;
    subtle?: boolean;
}
export declare const StatusBadge: ({ label, value, tone, subtle }: StatusBadgeProps) => React.JSX.Element;
export interface ChecklistItemProps {
    label: string;
    meta?: string;
    status?: string;
    tone?: Tone;
}
export declare const ChecklistItem: ({ label, meta, status, tone }: ChecklistItemProps) => React.JSX.Element;
export interface InfoStackProps {
    rows: Array<{
        label: string;
        value: string;
    }>;
    columns?: number;
}
export declare const InfoStack: ({ rows, columns }: InfoStackProps) => React.JSX.Element;
export interface DataTableColumn {
    key: string;
    label: string;
    width?: number;
    align?: 'left' | 'right';
}
export interface DataTableProps {
    columns: DataTableColumn[];
    rows: Array<Record<string, ReactNode>>;
    footnote?: string;
}
export declare const DataTable: ({ columns, rows, footnote }: DataTableProps) => React.JSX.Element;
declare const _default: {
    DashboardSection: ({ title, description, actions, children, style, }: DashboardSectionProps) => React.JSX.Element;
    MetricCard: ({ label, value, deltaLabel, tone }: MetricCardProps) => React.JSX.Element;
    StatusBadge: ({ label, value, tone, subtle }: StatusBadgeProps) => React.JSX.Element;
    ChecklistItem: ({ label, meta, status, tone }: ChecklistItemProps) => React.JSX.Element;
    InfoStack: ({ rows, columns }: InfoStackProps) => React.JSX.Element;
    DataTable: ({ columns, rows, footnote }: DataTableProps) => React.JSX.Element;
};
export default _default;
//# sourceMappingURL=base.d.ts.map