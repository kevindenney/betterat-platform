// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type MaintenanceStatus = 'overdue' | 'due_soon' | 'scheduled' | 'completed';

export type MaintenanceCategory = 'sail' | 'rigging' | 'hull' | 'electronics' | 'safety' | 'other';

export interface MaintenanceItem {
  id: string;
  status: MaintenanceStatus;
  category: MaintenanceCategory;
  item: string;
  service: string;
  dueDate?: string;
  completedDate?: string;
  cost?: number;
  vendor?: string;
  notes?: string;
}

export type MaintenanceFilter = MaintenanceStatus | 'all';

export interface MaintenanceScheduleProps {
  items: MaintenanceItem[];
  selectedFilter?: MaintenanceFilter;
  defaultFilter?: MaintenanceFilter;
  loading?: boolean;
  currency?: string;
  onFilterChange?: (filter: MaintenanceFilter) => void;
  onMarkComplete?: (item: MaintenanceItem) => void;
  onEditItem?: (item: MaintenanceItem) => void;
  emptyStateMessage?: string;
}

const CATEGORY_ICONS: Record<MaintenanceCategory, Ionicons['props']['name']> = {
  sail: 'flag',
  rigging: 'git-network',
  hull: 'boat',
  electronics: 'hardware-chip',
  safety: 'shield-checkmark',
  other: 'construct',
};

const STATUS_COLORS: Record<MaintenanceStatus, string> = {
  overdue: '#EF4444',
  due_soon: '#F59E0B',
  scheduled: '#3B82F6',
  completed: '#10B981',
};

const STATUS_BG_COLORS: Record<MaintenanceStatus, string> = {
  overdue: '#FEE2E2',
  due_soon: '#FEF3C7',
  scheduled: '#DBEAFE',
  completed: '#D1FAE5',
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatCurrency = (value: number, currency = 'USD') => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value.toLocaleString()}`;
  }
};

export function MaintenanceSchedule({
  items,
  selectedFilter,
  defaultFilter = 'all',
  loading = false,
  currency = 'USD',
  onFilterChange,
  onMarkComplete,
  onEditItem,
  emptyStateMessage = 'Log sail, rigging, and hull maintenance to stay ahead of surprises.',
}: MaintenanceScheduleProps) {
  const [internalFilter, setInternalFilter] = useState<MaintenanceFilter>(defaultFilter);
  const activeFilter = selectedFilter ?? internalFilter;
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const counts = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc[item.status] += 1;
        return acc;
      },
      { overdue: 0, due_soon: 0, scheduled: 0, completed: 0 },
    );
  }, [items]);

  const filters = [
    { key: 'all' as MaintenanceFilter, label: 'All', count: items.length },
    { key: 'overdue' as MaintenanceFilter, label: 'Overdue', count: counts.overdue },
    { key: 'due_soon' as MaintenanceFilter, label: 'Due Soon', count: counts.due_soon },
    { key: 'scheduled' as MaintenanceFilter, label: 'Scheduled', count: counts.scheduled },
    { key: 'completed' as MaintenanceFilter, label: 'Recent', count: counts.completed },
  ];

  const filteredItems =
    activeFilter === 'all' ? items : items.filter((item) => item.status === activeFilter);

  const upcomingCost = filteredItems
    .filter((item) => item.status !== 'completed')
    .reduce((sum, item) => sum + (item.cost ?? 0), 0);

  const handleFilterChange = (filter: MaintenanceFilter) => {
    if (!selectedFilter) {
      setInternalFilter(filter);
    }
    onFilterChange?.(filter);
    setExpandedItem(null);
  };

  if (!loading && items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name='build-outline' size={46} color='#CBD5E1' />
        <Text style={styles.emptyTitle}>No maintenance logged</Text>
        <Text style={styles.emptyMessage}>{emptyStateMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: '#FEE2E2' }]}>
          <Ionicons name='warning' size={22} color='#DC2626' />
          <View style={styles.summaryContent}>
            <Text style={styles.summaryValue}>{counts.overdue}</Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
          </View>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name='time' size={22} color='#D97706' />
          <View style={styles.summaryContent}>
            <Text style={styles.summaryValue}>{counts.due_soon}</Text>
            <Text style={styles.summaryLabel}>Due Soon</Text>
          </View>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#DBEAFE' }]}>
          <Ionicons name='calendar' size={22} color='#2563EB' />
          <View style={styles.summaryContent}>
            <Text style={styles.summaryValue}>{counts.scheduled}</Text>
            <Text style={styles.summaryLabel}>Scheduled</Text>
          </View>
        </View>
      </View>

      {upcomingCost > 0 && (
        <View style={styles.costBanner}>
          <Ionicons name='cash-outline' size={18} color='#1E293B' />
          <Text style={styles.costText}>
            Upcoming maintenance:{' '}
            <Text style={styles.costAmount}>{formatCurrency(upcomingCost, currency)}</Text>
          </Text>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterTab, activeFilter === filter.key && styles.filterTabActive]}
            onPress={() => handleFilterChange(filter.key)}
          >
            <Text
              style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}
            >
              {filter.label}
            </Text>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filter.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name='sync' size={28} color='#94A3B8' />
          <Text style={styles.loadingText}>Loading maintenance schedule…</Text>
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filteredItems.map((item) => {
            const isExpanded = expandedItem === item.id;
            const statusColor = STATUS_COLORS[item.status];
            const statusBg = STATUS_BG_COLORS[item.status];

            return (
              <View key={item.id} style={styles.card}>
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => setExpandedItem(isExpanded ? null : item.id)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: statusBg }]}>
                    <Ionicons
                      name={CATEGORY_ICONS[item.category] ?? 'construct'}
                      size={20}
                      color={statusColor}
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.itemName}>{item.item}</Text>
                    <Text style={styles.serviceName}>{item.service}</Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>

                <View style={styles.cardMeta}>
                  <View style={[styles.typeBadge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.typeText, { color: statusColor }]}>
                      {item.status.replace('_', ' ')}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>
                    {item.status === 'completed'
                      ? `Completed: ${formatDate(item.completedDate)}`
                      : `Due: ${formatDate(item.dueDate)}`}
                  </Text>
                </View>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {item.cost !== undefined && (
                      <View style={styles.detailRow}>
                        <Ionicons name='cash-outline' size={16} color='#64748B' />
                        <Text style={styles.detailText}>
                          {formatCurrency(item.cost, currency)}
                        </Text>
                      </View>
                    )}
                    {item.vendor && (
                      <View style={styles.detailRow}>
                        <Ionicons name='business-outline' size={16} color='#64748B' />
                        <Text style={styles.detailText}>{item.vendor}</Text>
                      </View>
                    )}
                    {item.notes && (
                      <View style={styles.detailRow}>
                        <Ionicons name='document-text-outline' size={16} color='#64748B' />
                        <Text style={styles.detailText}>{item.notes}</Text>
                      </View>
                    )}

                    <View style={styles.actions}>
                      {item.status !== 'completed' && onMarkComplete && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => onMarkComplete(item)}
                        >
                          <Ionicons name='checkmark-circle-outline' size={18} color='#10B981' />
                          <Text style={[styles.actionText, { color: '#10B981' }]}>
                            Mark complete
                          </Text>
                        </TouchableOpacity>
                      )}
                      {onEditItem && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => onEditItem(item)}
                        >
                          <Ionicons name='create-outline' size={18} color='#3B82F6' />
                          <Text style={[styles.actionText, { color: '#3B82F6' }]}>Edit</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  summaryContent: {
    gap: 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  costBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
  },
  costText: {
    fontSize: 13,
    color: '#92400E',
  },
  costAmount: {
    fontWeight: '700',
    fontSize: 15,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterTabActive: {
    backgroundColor: '#DBEAFE',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 13,
    color: '#64748B',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#475569',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3B82F6',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  emptyMessage: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
});

export default MaintenanceSchedule;
