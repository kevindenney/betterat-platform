/**
 * BoatScreen Component
 * Boat management screen with primary boat highlighting
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { DomainDashboardProps } from '@betterat/domain-sdk';
import theme from '../theme';
import { fetchSailorBoats, setPrimaryBoat } from '../services/boatService';
import type { SailorClassRow, BoatClassRow } from '../services/boatService';

// ============================================================================
// Types
// ============================================================================

interface Boat {
  id: string;
  name: string;
  class: string;
  sailNumber: string;
  status: 'active' | 'inactive';
  club: string;
  lastRace?: string;
  performance?: 'improving' | 'stable' | 'declining';
  isPrimary: boolean;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_BOATS: Boat[] = [
  {
    id: '1',
    name: 'Dragon #123',
    class: 'Dragon',
    sailNumber: '123',
    status: 'active',
    club: 'Royal Hong Kong Yacht Club',
    lastRace: '2 days ago',
    performance: 'improving',
    isPrimary: true,
  },
  {
    id: '2',
    name: 'Laser Standard',
    class: 'Laser',
    sailNumber: '456',
    status: 'active',
    club: 'Aberdeen Marina Club',
    lastRace: '1 week ago',
    performance: 'stable',
    isPrimary: false,
  },
  {
    id: '3',
    name: 'J/70 Velocity',
    class: 'J/70',
    sailNumber: 'HKG-789',
    status: 'inactive',
    club: 'Hebe Haven Yacht Club',
    lastRace: '3 months ago',
    performance: 'stable',
    isPrimary: false,
  },
];

const BOAT_CLASSES = ['All', 'Dragon', 'Laser', 'J/70', 'Optimist', 'RS Aero'];

// ============================================================================
// BoatScreen Component
// ============================================================================

export const BoatScreen: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'primary'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [classFilter, setClassFilter] = useState('All');

  // Fetch sailor's boats from Supabase
  const {
    data: sailorBoatsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<Array<SailorClassRow & { boat_classes: BoatClassRow }>>({
    queryKey: ['sailor-boats', userId],
    queryFn: () => fetchSailorBoats(),
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
  });

  // Transform Supabase data to UI format
  const boats = useMemo(() => {
    if (sailorBoatsData && sailorBoatsData.length > 0) {
      return sailorBoatsData.map((item) => ({
        id: `${item.sailor_id}-${item.class_id}`,
        name: item.boat_name || item.boat_classes.name,
        class: item.boat_classes.name,
        sailNumber: item.sail_number || 'N/A',
        status: 'active' as const,
        club: 'Royal Hong Kong Yacht Club', // TODO: Get from user profile
        lastRace: undefined,
        performance: undefined,
        isPrimary: item.is_primary ?? false,
      }));
    }
    // Fall back to mock data if no real data
    if (isLoading || error) {
      return MOCK_BOATS;
    }
    return [];
  }, [sailorBoatsData, isLoading, error]);

  const hasRealData = sailorBoatsData && sailorBoatsData.length > 0;
  const isOffline = error !== null;

  const primaryBoat = boats.find(boat => boat.isPrimary);
  const otherBoats = boats.filter(boat => !boat.isPrimary);

  const handleAddBoat = () => {
    console.log('Add boat clicked');
    services.analytics.trackEvent('add_boat_clicked', { userId });
  };

  const handleBoatPress = (boatId: string) => {
    console.log('Boat pressed:', boatId);
    services.analytics.trackEvent('boat_pressed', { userId, boatId });
  };

  const handleSetPrimary = async (boatId: string) => {
    try {
      // Extract classId from the composite boatId (format: sailorId-classId)
      const classId = boatId.split('-')[1];
      await setPrimaryBoat(classId);
      services.analytics.trackEvent('set_primary_boat', { userId, boatId });
      // Refetch to update the UI
      await refetch();
    } catch (err) {
      console.error('Failed to set primary boat:', err);
    }
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const handleQuickAction = (action: string, boatId: string) => {
    console.log('Quick action:', action, boatId);
    services.analytics.trackEvent('boat_quick_action', { userId, action, boatId });
  };

  const getPerformanceIcon = (performance?: Boat['performance']) => {
    switch (performance) {
      case 'improving':
        return '↗️';
      case 'declining':
        return '↘️';
      case 'stable':
      default:
        return '→';
    }
  };

  const getPerformanceText = (performance?: Boat['performance']) => {
    switch (performance) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Declining';
      case 'stable':
      default:
        return 'Stable';
    }
  };

  // Empty state
  if (boats.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIllustration}>🚤</Text>
          <Text style={styles.emptyStateTitle}>No boats yet</Text>
          <Text style={styles.emptyStateSubtitle}>
            Add your first boat to get started
          </Text>
          <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddBoat}>
            <Text style={styles.emptyStateButtonText}>Add Boat</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Data Source Banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.bannerText}>⚠️ You're offline. Showing demo data.</Text>
          </View>
        )}

        {!isOffline && !hasRealData && !isLoading && (
          <View style={[styles.offlineBanner, styles.demoBanner]}>
            <Text style={styles.bannerText}>ℹ️ No boats yet. Showing demo data. Tap + to add your first boat.</Text>
          </View>
        )}

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Fleet</Text>
          <View style={styles.headerMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{boats.length}</Text>
              <Text style={styles.metricLabel}>Total Boats</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {boats.filter(b => b.status === 'active').length}
              </Text>
              <Text style={styles.metricLabel}>Active</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {boats.filter(b => b.status === 'inactive').length}
              </Text>
              <Text style={styles.metricLabel}>Inactive</Text>
            </View>
          </View>
        </View>

        {/* FILTERS & SEARCH */}
        <View style={styles.filtersContainer}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search boats..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          {/* Status Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                statusFilter === 'all' && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter('all')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === 'all' && styles.filterChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                statusFilter === 'active' && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter('active')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === 'active' && styles.filterChipTextActive,
                ]}
              >
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                statusFilter === 'inactive' && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter('inactive')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === 'inactive' && styles.filterChipTextActive,
                ]}
              >
                Inactive
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Class Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {BOAT_CLASSES.map(boatClass => (
              <TouchableOpacity
                key={boatClass}
                style={[
                  styles.filterChip,
                  classFilter === boatClass && styles.filterChipActive,
                ]}
                onPress={() => setClassFilter(boatClass)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    classFilter === boatClass && styles.filterChipTextActive,
                  ]}
                >
                  {boatClass}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* PRIMARY BOAT */}
        {primaryBoat && (
          <View style={styles.primaryBoatContainer}>
            <View style={styles.primaryBoatBadge}>
              <Text style={styles.primaryBoatBadgeText}>⭐ PRIMARY BOAT</Text>
            </View>
            <TouchableOpacity
              style={styles.primaryBoatCard}
              onPress={() => handleBoatPress(primaryBoat.id)}
              activeOpacity={0.8}
            >
              <View style={styles.boatAvatar}>
                <Text style={styles.boatAvatarText}>🚤</Text>
              </View>

              <Text style={styles.primaryBoatName}>{primaryBoat.name}</Text>

              <View style={styles.boatStatusRow}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        primaryBoat.status === 'active'
                          ? theme.colors.success + '20'
                          : theme.colors.gray300 + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color:
                          primaryBoat.status === 'active'
                            ? theme.colors.success
                            : theme.colors.gray500,
                      },
                    ]}
                  >
                    {primaryBoat.status === 'active' ? '✅ Active' : '⚪ Inactive'}
                  </Text>
                </View>
              </View>

              <View style={styles.boatInfo}>
                <Text style={styles.boatInfoText}>📍 {primaryBoat.club}</Text>
                <Text style={styles.boatInfoText}>
                  ⛵ {primaryBoat.class} • #{primaryBoat.sailNumber}
                </Text>
              </View>

              {primaryBoat.lastRace && (
                <Text style={styles.boatMetaText}>
                  Last Race: {primaryBoat.lastRace}
                </Text>
              )}

              {primaryBoat.performance && (
                <View style={styles.performanceRow}>
                  <Text style={styles.performanceText}>
                    Performance: {getPerformanceIcon(primaryBoat.performance)}{' '}
                    {getPerformanceText(primaryBoat.performance)}
                  </Text>
                </View>
              )}

              <View style={styles.quickActions}>
                <Text style={styles.quickActionsLabel}>Quick Actions:</Text>
                <View style={styles.quickActionsButtons}>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => handleQuickAction('race', primaryBoat.id)}
                  >
                    <Text style={styles.quickActionButtonText}>🏁 Race</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => handleQuickAction('tune', primaryBoat.id)}
                  >
                    <Text style={styles.quickActionButtonText}>🔧 Tune</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => handleQuickAction('maintain', primaryBoat.id)}
                  >
                    <Text style={styles.quickActionButtonText}>🛠️ Maintain</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* OTHER BOATS */}
        {otherBoats.length > 0 && (
          <View style={styles.otherBoatsContainer}>
            <Text style={styles.sectionTitle}>Other Boats</Text>
            {otherBoats.map(boat => (
              <TouchableOpacity
                key={boat.id}
                style={styles.boatCard}
                onPress={() => handleBoatPress(boat.id)}
                activeOpacity={0.8}
              >
                <View style={styles.boatCardHeader}>
                  <View style={styles.boatCardLeft}>
                    <Text style={styles.boatCardEmoji}>🚤</Text>
                    <View>
                      <Text style={styles.boatCardName}>{boat.name}</Text>
                      <Text style={styles.boatCardClass}>
                        {boat.class} • #{boat.sailNumber}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          boat.status === 'active'
                            ? theme.colors.success + '20'
                            : theme.colors.gray300 + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color:
                            boat.status === 'active'
                              ? theme.colors.success
                              : theme.colors.gray500,
                        },
                      ]}
                    >
                      {boat.status === 'active' ? '✅' : '⚪'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.boatCardClub}>📍 {boat.club}</Text>

                {boat.lastRace && (
                  <Text style={styles.boatCardMeta}>Last Race: {boat.lastRace}</Text>
                )}

                <TouchableOpacity
                  style={styles.setPrimaryButton}
                  onPress={() => handleSetPrimary(boat.id)}
                >
                  <Text style={styles.setPrimaryButtonText}>Set as Primary</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddBoat}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default BoatScreen;

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header
  header: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    ...theme.shadows.small,
  },
  headerTitle: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  headerMetrics: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  metricLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },

  // Filters & Search
  filtersContainer: {
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
  },
  filters: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  filterChip: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.background,
    ...theme.shadows.small,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: theme.colors.background,
  },

  // Primary Boat
  primaryBoatContainer: {
    padding: theme.spacing.xl,
  },
  primaryBoatBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.warning,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.lg,
  },
  primaryBoatBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.background,
    fontWeight: '700',
  },
  primaryBoatCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.xxl,
    ...theme.shadows.medium,
    borderWidth: 2,
    borderColor: theme.colors.warning,
  },
  boatAvatar: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.gray100,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  boatAvatarText: {
    fontSize: 40,
  },
  primaryBoatName: {
    ...theme.typography.h1,
    fontSize: 24,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  boatStatusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  statusBadge: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
  },
  statusBadgeText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
  },
  boatInfo: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  boatInfoText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  boatMetaText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  performanceRow: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  performanceText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  quickActions: {
    gap: theme.spacing.md,
  },
  quickActionsLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  quickActionsButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  quickActionButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.background,
    fontWeight: '600',
  },

  // Other Boats
  otherBoatsContainer: {
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  boatCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.xl,
    ...theme.shadows.small,
    gap: theme.spacing.md,
  },
  boatCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boatCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    flex: 1,
  },
  boatCardEmoji: {
    fontSize: 32,
  },
  boatCardName: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  boatCardClass: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  boatCardClub: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  boatCardMeta: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  setPrimaryButton: {
    backgroundColor: theme.colors.gray100,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  setPrimaryButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxxl,
  },
  emptyStateIllustration: {
    fontSize: 80,
    marginBottom: theme.spacing.xxl,
  },
  emptyStateTitle: {
    ...theme.typography.h1,
    fontSize: 28,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxxl,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxxl,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.medium,
  },
  emptyStateButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: '700',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xxl,
    right: theme.spacing.xxl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.large,
  },
  fabIcon: {
    fontSize: 32,
    color: theme.colors.background,
    fontWeight: '600',
  },

  // Banners
  offlineBanner: {
    backgroundColor: '#EF4444',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  demoBanner: {
    backgroundColor: '#3B82F6',
  },
  bannerText: {
    ...theme.typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
