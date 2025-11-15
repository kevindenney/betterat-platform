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

interface Sail {
  id: string;
  type: 'main' | 'jib' | 'spinnaker' | 'genoa' | 'code_zero';
  name: string;
  manufacturer: string;
  races: number;
  condition: number; // 0-100%
  serviceDue: string;
  performanceRating: number; // 0-100%
  notes?: string;
}

interface SailInventoryProps {
  sails: Sail[];
  recommendation?: string;
  onAddSail?: () => void;
}

export function SailInventory({
  sails,
  recommendation,
  onAddSail,
}: SailInventoryProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedSail, setExpandedSail] = useState<string | null>(null);

  const types = useMemo(() => {
    const counts = sails.reduce<Record<string, number>>((acc, sail) => {
      acc[sail.type] = (acc[sail.type] ?? 0) + 1;
      return acc;
    }, {});

    const base = [
      { key: 'all', label: `All (${sails.length})`, icon: 'layers' as const },
      { key: 'main', label: `Mains (${counts.main ?? 0})`, icon: 'square' as const },
      { key: 'jib', label: `Jibs (${counts.jib ?? 0})`, icon: 'triangle' as const },
      { key: 'spinnaker', label: `Spinnakers (${counts.spinnaker ?? 0})`, icon: 'cloud' as const },
      { key: 'genoa', label: `Genoas (${counts.genoa ?? 0})`, icon: 'flag' as const },
      { key: 'code_zero', label: `Code 0 (${counts.code_zero ?? 0})`, icon: 'ellipse' as const },
    ];
    return base.filter(item => item.key === 'all' || counts[item.key] > 0);
  }, [sails]);

  const filteredSails =
    selectedType === 'all'
      ? sails
      : sails.filter((sail) => sail.type === selectedType);

  const getConditionColor = (condition: number) => {
    if (condition >= 80) return '#10B981';
    if (condition >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 90) return '#10B981';
    if (rating >= 75) return '#3B82F6';
    return '#F59E0B';
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {types.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.filterTab,
                selectedType === type.key && styles.filterTabActive,
              ]}
              onPress={() => setSelectedType(type.key)}
            >
              <Ionicons
                name={type.icon as any}
                size={18}
                color={selectedType === type.key ? '#3B82F6' : '#64748B'}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedType === type.key && styles.filterTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {recommendation && (
        <View style={styles.aiRecommendation}>
          <Ionicons name="bulb" size={20} color="#F59E0B" />
          <View style={styles.aiText}>
            <Text style={styles.aiTitle}>Recommendation</Text>
            <Text style={styles.aiMessage}>{recommendation}</Text>
          </View>
          {onAddSail && (
            <TouchableOpacity style={styles.addSailChip} onPress={onAddSail}>
              <Ionicons name="add" size={14} color="#2563EB" />
              <Text style={styles.addSailText}>Add sail</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Sail List */}
      <ScrollView style={styles.sailList} showsVerticalScrollIndicator={false}>
        {filteredSails.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cloud-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyStateText}>No sails in this category</Text>
          </View>
        )}

        {filteredSails.map((sail) => {
          const isExpanded = expandedSail === sail.id;
          const isServiceOverdue = sail.serviceDue.includes('Overdue');

          return (
            <View key={sail.id} style={styles.sailCard}>
              <TouchableOpacity
                style={styles.sailHeader}
                onPress={() =>
                  setExpandedSail(isExpanded ? null : sail.id)
                }
              >
                <View style={styles.sailInfo}>
                  <Text style={styles.sailName}>{sail.name}</Text>
                  <Text style={styles.sailMeta}>
                    {sail.manufacturer} • {sail.races} races
                  </Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>

              {/* Metrics Row */}
              <View style={styles.metricsRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Condition</Text>
                  <View style={styles.metricValue}>
                    <View
                      style={[
                        styles.metricBar,
                        { width: `${sail.condition}%` },
                        {
                          backgroundColor: getConditionColor(sail.condition),
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.metricText,
                        { color: getConditionColor(sail.condition) },
                      ]}
                    >
                      {sail.condition}%
                    </Text>
                  </View>
                </View>

                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Performance</Text>
                  <View style={styles.metricValue}>
                    <View
                      style={[
                        styles.metricBar,
                        { width: `${sail.performanceRating}%` },
                        {
                          backgroundColor: getPerformanceColor(
                            sail.performanceRating
                          ),
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.metricText,
                        {
                          color: getPerformanceColor(
                            sail.performanceRating
                          ),
                        },
                      ]}
                    >
                      {sail.performanceRating}%
                    </Text>
                  </View>
                </View>
              </View>

              {/* Service Due */}
              <View
                style={[
                  styles.serviceBadge,
                  isServiceOverdue && styles.serviceOverdue,
                ]}
              >
                <Ionicons
                  name={isServiceOverdue ? 'warning' : 'time-outline'}
                  size={14}
                  color={isServiceOverdue ? '#DC2626' : '#64748B'}
                />
                <Text
                  style={[
                    styles.serviceText,
                    isServiceOverdue && styles.serviceTextOverdue,
                  ]}
                >
                  Service {sail.serviceDue}
                </Text>
              </View>

              {/* Expanded Details */}
              {isExpanded && (
                <View style={styles.expandedContent}>
                  {sail.notes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.notesLabel}>Notes:</Text>
                      <Text style={styles.notesText}>{sail.notes}</Text>
                    </View>
                  )}
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="create-outline" size={18} color="#3B82F6" />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="build-outline" size={18} color="#3B82F6" />
                      <Text style={styles.actionText}>Log Service</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="stats-chart-outline" size={18} color="#3B82F6" />
                      <Text style={styles.actionText}>Performance</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterTabActive: {
    backgroundColor: '#DBEAFE',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  aiRecommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  aiText: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  aiMessage: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 16,
  },
  sailList: {
    flex: 1,
    padding: 16,
  },
  sailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sailInfo: {
    flex: 1,
  },
  sailName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  sailMeta: {
    fontSize: 13,
    color: '#64748B',
  },
  metricsRow: {
    gap: 12,
    marginBottom: 12,
  },
  metric: {
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricBar: {
    height: 6,
    borderRadius: 3,
    minWidth: 40,
  },
  metricText: {
    fontSize: 13,
    fontWeight: '600',
  },
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  serviceOverdue: {
    backgroundColor: '#FEE2E2',
  },
  serviceText: {
    fontSize: 12,
    color: '#64748B',
  },
  serviceTextOverdue: {
    color: '#DC2626',
    fontWeight: '600',
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  notesSection: {
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
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
});
