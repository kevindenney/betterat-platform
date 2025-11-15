// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type CrewRole =
  | 'helmsman'
  | 'tactician'
  | 'trimmer'
  | 'bowman'
  | 'pit'
  | 'grinder'
  | 'other';

export type AvailabilityStatus = 'available' | 'unavailable' | 'tentative';

export interface CrewMember {
  id: string;
  name: string;
  email?: string;
  role: CrewRole;
  experience?: string;
  availability?: AvailabilityStatus;
  notes?: string;
}

export interface BoatCrewListProps {
  crew: CrewMember[];
  loading?: boolean;
  onManageCrew?: () => void;
  onAddCrew?: () => void;
}

const ROLE_ICONS: Record<CrewRole, Ionicons['props']['name']> = {
  helmsman: 'navigate-circle',
  tactician: 'compass',
  trimmer: 'hand-left',
  bowman: 'arrow-up-circle',
  pit: 'construct',
  grinder: 'fitness',
  other: 'person',
};

const ROLE_COLORS: Record<CrewRole, string> = {
  helmsman: '#3B82F6',
  tactician: '#8B5CF6',
  trimmer: '#10B981',
  bowman: '#F59E0B',
  pit: '#EF4444',
  grinder: '#6366F1',
  other: '#64748B',
};

const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available: 'Available',
  tentative: 'Tentative',
  unavailable: 'Unavailable',
};

const AVAILABILITY_COLORS: Record<AvailabilityStatus, string> = {
  available: '#10B981',
  tentative: '#F59E0B',
  unavailable: '#EF4444',
};

export function BoatCrewList({
  crew,
  loading = false,
  onManageCrew,
  onAddCrew,
}: BoatCrewListProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading crew…</Text>
      </View>
    );
  }

  if (crew.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={48} color="#CBD5E1" />
        <Text style={styles.emptyTitle}>No Crew Assigned</Text>
        <Text style={styles.emptyText}>Add crew members from the crew tab.</Text>
        {onAddCrew && (
          <TouchableOpacity style={styles.emptyButton} onPress={onAddCrew}>
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.emptyButtonText}>Add Crew</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="people" size={20} color="#3B82F6" />
          <Text style={styles.headerTitle}>Crew ({crew.length})</Text>
        </View>
        {onManageCrew && (
          <TouchableOpacity style={styles.manageButton} onPress={onManageCrew}>
            <Text style={styles.manageButtonText}>Manage</Text>
            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.crewList}>
        {crew.map(member => (
          <View key={member.id} style={styles.crewCard}>
            <View
              style={[
                styles.roleIcon,
                { backgroundColor: ROLE_COLORS[member.role] + '20' },
              ]}
            >
              <Ionicons
                name={ROLE_ICONS[member.role]}
                size={24}
                color={ROLE_COLORS[member.role]}
              />
            </View>

            <View style={styles.crewInfo}>
              <Text style={styles.crewName}>{member.name}</Text>
              {member.email && <Text style={styles.crewEmail}>{member.email}</Text>}
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {member.role.replace('_', ' ')}
                  </Text>
                </View>
                {member.experience && (
                  <View style={styles.badgeMuted}>
                    <Text style={styles.badgeMutedText}>{member.experience}</Text>
                  </View>
                )}
              </View>
            </View>

            {member.availability && (
              <View
                style={[
                  styles.availabilityChip,
                  { backgroundColor: AVAILABILITY_COLORS[member.availability] + '26' },
                ]}
              >
                <Text
                  style={[
                    styles.availabilityText,
                    { color: AVAILABILITY_COLORS[member.availability] },
                  ]}
                >
                  {AVAILABILITY_LABELS[member.availability]}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#94A3B8',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
  },
  manageButtonText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  crewList: {
    gap: 12,
  },
  crewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crewInfo: {
    flex: 1,
  },
  crewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  crewEmail: {
    color: '#94A3B8',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338CA',
  },
  badgeMuted: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  badgeMutedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  availabilityChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BoatCrewList;
