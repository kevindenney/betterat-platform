import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Tone = 'default' | 'info' | 'success' | 'warning' | 'danger';

const palette = {
  background: '#F5F7FB',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  info: '#4B8BFF',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
};

const toneMap: Record<Tone, string> = {
  default: palette.muted,
  info: palette.info,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
};

export interface DashboardSectionProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  style?: any;
}

export const DashboardSection = ({
  title,
  description,
  actions,
  children,
  style,
}: DashboardSectionProps) => (
  <View style={[styles.section, style]}>
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
      </View>
      {actions}
    </View>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

export interface MetricCardProps {
  label: string;
  value: string;
  deltaLabel?: string;
  tone?: Tone;
}

export const MetricCard = ({ label, value, deltaLabel, tone = 'default' }: MetricCardProps) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
    {deltaLabel ? (
      <Text style={[styles.metricDelta, { color: toneMap[tone] }]}>{deltaLabel}</Text>
    ) : null}
  </View>
);

export interface StatusBadgeProps {
  label: string;
  value?: string;
  tone?: Tone;
  subtle?: boolean;
}

export const StatusBadge = ({ label, value, tone = 'default', subtle }: StatusBadgeProps) => (
  <View
    style={[
      styles.badge,
      {
        borderColor: toneMap[tone],
        backgroundColor: subtle ? 'transparent' : `${toneMap[tone]}14`,
      },
    ]}
  >
    <Text style={[styles.badgeLabel, { color: toneMap[tone] }]}>{label}</Text>
    {value ? <Text style={[styles.badgeValue, { color: toneMap[tone] }]}>{value}</Text> : null}
  </View>
);

export interface ChecklistItemProps {
  label: string;
  meta?: string;
  status?: string;
  tone?: Tone;
}

export const ChecklistItem = ({ label, meta, status, tone = 'default' }: ChecklistItemProps) => (
  <View style={styles.checklistItem}>
    <View style={[styles.checklistBullet, { borderColor: toneMap[tone] }]} />
    <View style={{ flex: 1 }}>
      <Text style={styles.checklistLabel}>{label}</Text>
      {meta ? <Text style={styles.checklistMeta}>{meta}</Text> : null}
    </View>
    {status ? <StatusBadge label={status} tone={tone} subtle /> : null}
  </View>
);

export interface InfoStackProps {
  rows: Array<{ label: string; value: string }>;
  columns?: number;
}

export const InfoStack = ({ rows, columns = 2 }: InfoStackProps) => {
  const chunked: Array<Array<{ label: string; value: string }>> = [];
  for (let i = 0; i < rows.length; i += columns) {
    chunked.push(rows.slice(i, i + columns));
  }
  return (
    <View style={styles.infoStack}>
      {chunked.map((group, index) => (
        <View key={`info-row-${index}`} style={styles.infoRow}>
          {group.map((item) => (
            <View key={item.label} style={styles.infoItem}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

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

export const DataTable = ({ columns, rows, footnote }: DataTableProps) => (
  <View style={styles.table}>
    <View style={styles.tableRow}>
      {columns.map((column) => (
        <Text
          key={column.key}
          style={[
            styles.tableHeader,
            column.width ? { width: column.width } : undefined,
            column.align === 'right' ? styles.alignRight : undefined,
          ]}
        >
          {column.label}
        </Text>
      ))}
    </View>
    {rows.map((row, index) => (
      <View key={`row-${index}`} style={styles.tableRow}>
        {columns.map((column) => (
          <Text
            key={`${index}-${column.key}`}
            style={[
              styles.tableCell,
              column.width ? { width: column.width } : undefined,
              column.align === 'right' ? styles.alignRight : undefined,
            ]}
          >
            {row[column.key] as ReactNode}
          </Text>
        ))}
      </View>
    ))}
    {footnote ? <Text style={styles.tableFootnote}>{footnote}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  section: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: palette.muted,
    marginTop: 4,
  },
  sectionBody: {
    gap: 16,
  },
  metricCard: {
    flexBasis: '48%',
    backgroundColor: palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    borderRadius: 16,
    padding: 16,
  },
  metricLabel: {
    fontSize: 13,
    color: palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 8,
    color: palette.text,
  },
  metricDelta: {
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  badgeValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  checklistBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  checklistLabel: {
    fontWeight: '600',
    color: palette.text,
  },
  checklistMeta: {
    color: palette.muted,
  },
  infoStack: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    backgroundColor: palette.card,
  },
  infoLabel: {
    fontSize: 12,
    color: palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  table: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: palette.card,
  },
  tableHeader: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: palette.muted,
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: palette.text,
  },
  tableFootnote: {
    padding: 12,
    fontSize: 12,
    color: palette.muted,
    backgroundColor: palette.background,
  },
  alignRight: {
    textAlign: 'right',
  },
});

export default {
  DashboardSection,
  MetricCard,
  StatusBadge,
  ChecklistItem,
  InfoStack,
  DataTable,
};
