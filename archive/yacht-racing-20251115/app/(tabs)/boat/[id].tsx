// @ts-nocheck
/**
 * Boat Detail Screen - Equipment Management & Optimization
 * Physical boat tracking with equipment inventory, maintenance logs, and tuning
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// Import components individually to avoid victory-native dependency
import {
  boatMaintenanceService,
  sailorBoatService,
  tuningGuideService,
  type BoatCrewMember,
  type BoatEquipmentItem,
  type BoatTuningPreset,
  type MaintenanceRecord,
  type TuningGuide,
} from '@betterat/core';
import { BoatDetail } from '@betterat/ui/components/boats/BoatDetail';
import { BoatCrewList } from '@betterat/ui/components/boats/BoatCrewList';
import { SailInventory } from '@betterat/ui/components/boats/SailInventory';
import { RiggingConfig } from '@betterat/ui/components/boats/RiggingConfig';
import { MaintenanceSchedule } from '@betterat/ui/components/boats/MaintenanceSchedule';
import { Boat3DViewer } from '@betterat/ui/components/boats/Boat3DViewer';
import { RigTuningControls } from '@betterat/ui/components/boats/RigTuningControls';
import { TuningGuideList } from '@betterat/ui/components/boats/TuningGuideList';
import { createLogger } from '@betterat/core/lib/utils/logger';
import { useBoatPerformanceStats } from '@betterat/core/hooks/useBoatPerformanceStats';
// PerformanceAnalysis - Not imported to avoid victory-native dependency on web

interface BoatDetails {
  id: string;
  sailorId: string;
  classId: string;
  name: string;
  className: string;
  sailNumber?: string;
  manufacturer?: string;
  yearBuilt?: number;
  hullMaterial?: string;
  isPrimary: boolean;
  homeClub?: string;
  storageLocation?: string;
  ownership?: string;
}

interface RigTuning {
  shrouds: number;
  backstay: number;
  forestay: number;
  mastButtPosition: number;
}

type TabType = 'overview' | 'crew' | 'sails' | 'rigging' | 'equipment' | 'maintenance' | 'performance' | 'tuning3d' | 'guides';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const MAINTENANCE_CATEGORIES: MaintenanceItem['category'][] = [
  'rigging',
  'sail',
  'hull',
  'electronics',
  'safety',
  'other',
];

const MAINTENANCE_STATUSES: MaintenanceItem['status'][] = [
  'scheduled',
  'due_soon',
  'overdue',
  'completed',
];

const DEFAULT_MAINTENANCE_FORM = {
  item: '',
  service: '',
  category: 'rigging' as MaintenanceItem['category'],
  status: 'scheduled' as MaintenanceItem['status'],
  dueDate: '',
  cost: '',
  vendor: '',
  notes: '',
};

type CrewRoleOption =
  | 'helmsman'
  | 'tactician'
  | 'trimmer'
  | 'bowman'
  | 'pit'
  | 'grinder'
  | 'other';

interface CrewListItem {
  id: string;
  name: string;
  email?: string;
  role: CrewRoleOption;
  experience?: string;
  availability?: 'available' | 'unavailable' | 'tentative';
  notes?: string;
}

interface SailInventoryItem {
  id: string;
  type: 'main' | 'jib' | 'spinnaker' | 'genoa' | 'code_zero';
  name: string;
  manufacturer: string;
  races: number;
  condition: number;
  serviceDue: string;
  performanceRating: number;
  notes?: string;
}

interface RiggingPreset {
  id: string;
  name: string;
  conditions?: string;
  isFavorite?: boolean;
  settings: Record<string, string>;
}

interface MaintenanceItem {
  id: string;
  status: 'overdue' | 'due_soon' | 'scheduled' | 'completed';
  category: 'sail' | 'rigging' | 'hull' | 'electronics' | 'safety' | 'engine' | 'other';
  item: string;
  service?: string;
  dueDate?: string;
  completedDate?: string;
  cost?: number;
  vendor?: string;
  notes?: string;
}

const TAB_CONFIG: {
  key: TabType;
  label: string;
  icon: IoniconName;
  description: string;
  badge?: 'crew' | 'sails' | 'maintenance' | 'performance';
}[] = [
  { key: 'overview', label: 'Overview', icon: 'information-circle', description: 'Fleet snapshot' },
  { key: 'crew', label: 'Crew', icon: 'people', description: 'Assignments & availability', badge: 'crew' },
  { key: 'sails', label: 'Sails', icon: 'flag', description: 'Inventory & tags', badge: 'sails' },
  { key: 'rigging', label: 'Rigging', icon: 'git-network', description: 'Tune presets' },
  { key: 'equipment', label: 'Equipment', icon: 'construct', description: 'Hardware log' },
  { key: 'maintenance', label: 'Maintenance', icon: 'build', description: 'Tasks & service', badge: 'maintenance' },
  { key: 'performance', label: 'Performance', icon: 'stats-chart', description: 'Race analytics', badge: 'performance' },
  { key: 'tuning3d', label: '3D Tuning', icon: 'cube', description: 'Visual tuning' },
  { key: 'guides', label: 'Tuning Guides', icon: 'book', description: 'Class playbook' },
];

export default function BoatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [boat, setBoat] = useState<BoatDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [rigTuning, setRigTuning] = useState<RigTuning>({
    shrouds: 28,
    backstay: 32,
    forestay: 10800,
    mastButtPosition: 50,
  });
  const [crewMembers, setCrewMembers] = useState<CrewListItem[]>([]);
  const [crewLoading, setCrewLoading] = useState(false);
  const [sails, setSails] = useState<SailInventoryItem[]>([]);
  const [sailsLoading, setSailsLoading] = useState(false);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [riggingPresets, setRiggingPresets] = useState<RiggingPreset[]>([]);
  const [guides, setGuides] = useState<TuningGuide[]>([]);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [guidesError, setGuidesError] = useState<string | null>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState(() => ({ ...DEFAULT_MAINTENANCE_FORM }));
  const [maintenanceSubmitting, setMaintenanceSubmitting] = useState(false);

  useEffect(() => {
    loadBoatDetails();
  }, [id]);

  const loadBoatRelations = async (targetBoat: BoatDetails) => {
    setCrewLoading(true);
    setSailsLoading(true);
    setMaintenanceLoading(true);
    try {
      const [crewData, equipmentData, maintenanceData, tuningData] = await Promise.all([
        sailorBoatService.getBoatCrew(targetBoat.id),
        sailorBoatService.getBoatEquipment(targetBoat.id),
        boatMaintenanceService.listMaintenanceRecords(targetBoat.id),
        sailorBoatService.getBoatTuningSettings(targetBoat.id),
      ]);
      setCrewMembers(mapCrewMembers(crewData));
      setSails(mapSailInventory(equipmentData));
      setMaintenanceItems(mapMaintenanceRecords(maintenanceData));
      setRiggingPresets(mapTuningPresets(tuningData));
    } catch (err) {
      logger.error('[BoatDetailScreen] Failed to load related boat data', err);
    } finally {
      setCrewLoading(false);
      setSailsLoading(false);
      setMaintenanceLoading(false);
    }
  };

  const loadTuningGuidesForBoat = async (targetBoat: BoatDetails) => {
    if (!targetBoat.classId) return;
    setGuidesLoading(true);
    setGuidesError(null);
    try {
      const data = await tuningGuideService.getGuidesForClass(targetBoat.classId, targetBoat.className);
      setGuides(data);
    } catch (err) {
      logger.error('[BoatDetailScreen] Failed to load tuning guides', err);
      setGuides([]);
      setGuidesError('Unable to load tuning guides right now.');
    } finally {
      setGuidesLoading(false);
    }
  };

  const handleMarkMaintenanceComplete = async (item: MaintenanceItem) => {
    if (!boat) return;
    try {
      await boatMaintenanceService.markRecordComplete(item.id);
      const refreshed = await boatMaintenanceService.listMaintenanceRecords(boat.id);
      setMaintenanceItems(mapMaintenanceRecords(refreshed));
    } catch (err) {
      logger.error('[BoatDetailScreen] Failed to mark maintenance complete', err);
    }
  };

  const handleOpenGuide = async (guide: TuningGuide) => {
    try {
      if (boat?.sailorId) {
        await tuningGuideService.recordView(guide.id, boat.sailorId);
      }
    } catch (err) {
      logger.warn('[BoatDetailScreen] Failed to record guide view', err);
    }

    const candidateUrls = [guide.fileUrl, guide.sourceUrl].filter(Boolean) as string[];
    for (const url of candidateUrls) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
          return;
        }
      } catch (err) {
        logger.warn('[BoatDetailScreen] Failed to open guide URL', { url, err });
      }
    }
  };

  const closeMaintenanceModal = () => {
    setShowMaintenanceModal(false);
    setMaintenanceForm({ ...DEFAULT_MAINTENANCE_FORM });
    setMaintenanceSubmitting(false);
  };

  const handleMaintenanceFieldChange = (field: keyof typeof maintenanceForm, value: string) => {
    setMaintenanceForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateMaintenance = async () => {
    if (!boat) return;
    if (!maintenanceForm.item.trim()) {
      Alert.alert('Required Field', 'Please enter a maintenance item name.');
      return;
    }

    try {
      setMaintenanceSubmitting(true);
      await boatMaintenanceService.createMaintenanceRecord({
        boat_id: boat.id,
        status: maintenanceForm.status,
        category: maintenanceForm.category,
        item: maintenanceForm.item.trim(),
        service: maintenanceForm.service.trim() || undefined,
        due_date: maintenanceForm.dueDate || undefined,
        cost: maintenanceForm.cost ? Number(maintenanceForm.cost) : undefined,
        vendor: maintenanceForm.vendor.trim() || undefined,
        notes: maintenanceForm.notes.trim() || undefined,
      });

      const refreshed = await boatMaintenanceService.listMaintenanceRecords(boat.id);
      setMaintenanceItems(mapMaintenanceRecords(refreshed));
      closeMaintenanceModal();
    } catch (err) {
      logger.error('[BoatDetailScreen] Failed to create maintenance record', err);
      Alert.alert('Error', 'Unable to save maintenance task right now.');
    } finally {
      setMaintenanceSubmitting(false);
    }
  };

  const renderMaintenanceModal = () => (
    <Modal
      visible={showMaintenanceModal}
      animationType="slide"
      transparent
      onRequestClose={closeMaintenanceModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Add maintenance task</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Task name"
            value={maintenanceForm.item}
            onChangeText={(text) => handleMaintenanceFieldChange('item', text)}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Service details"
            value={maintenanceForm.service}
            onChangeText={(text) => handleMaintenanceFieldChange('service', text)}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Vendor (optional)"
            value={maintenanceForm.vendor}
            onChangeText={(text) => handleMaintenanceFieldChange('vendor', text)}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Due date (YYYY-MM-DD)"
            value={maintenanceForm.dueDate}
            onChangeText={(text) => handleMaintenanceFieldChange('dueDate', text)}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Estimated cost"
            keyboardType="numeric"
            value={maintenanceForm.cost}
            onChangeText={(text) => handleMaintenanceFieldChange('cost', text)}
          />
          <TextInput
            style={[styles.modalInput, styles.modalMultiline]}
            placeholder="Notes"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={maintenanceForm.notes}
            onChangeText={(text) => handleMaintenanceFieldChange('notes', text)}
          />
          <Text style={styles.modalLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {MAINTENANCE_CATEGORIES.map((category) => {
              const selected = maintenanceForm.category === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => handleMaintenanceFieldChange('category', category)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {category.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Text style={styles.modalLabel}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {MAINTENANCE_STATUSES.map((statusOption) => {
              const selected = maintenanceForm.status === statusOption;
              return (
                <TouchableOpacity
                  key={statusOption}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => handleMaintenanceFieldChange('status', statusOption)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {statusOption.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={closeMaintenanceModal}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalSaveButton, maintenanceSubmitting && styles.modalSaveButtonDisabled]}
              onPress={handleCreateMaintenance}
              disabled={maintenanceSubmitting}
            >
              {maintenanceSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSaveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const loadBoatDetails = async () => {
    try {

      setLoading(true);

      // Fetch boat details from Supabase using shared service
      const boatData = await sailorBoatService.getBoat(id || '');

      if (!boatData) {

        setBoat(null);
        setCrewMembers([]);
        setSails([]);
        setMaintenanceItems([]);
        setRiggingPresets([]);
        setGuides([]);
        return;
      }

      // Map Supabase data to component interface
      // Note: sailor_boats table has no 'name' field, so we'll generate one from class + sail number
      const boatName = boatData.sail_number
        ? `${boatData.boat_class?.name || 'Boat'} #${boatData.sail_number}`
        : boatData.boat_class?.name || 'Unnamed Boat';

      const normalizedBoat: BoatDetails = {
        id: boatData.id,
        sailorId: boatData.sailor_id,
        classId: boatData.class_id,
        name: boatName,
        className: boatData.boat_class?.name || 'Unknown',
        sailNumber: boatData.sail_number || undefined,
        manufacturer: boatData.manufacturer,
        yearBuilt: boatData.year_built,
        hullMaterial: boatData.hull_material,
        isPrimary: boatData.is_primary || false,
        homeClub: undefined, // No home_club in sailor_boats table
        storageLocation: boatData.storage_location,
        ownership: boatData.ownership_type,
      };

      setBoat(normalizedBoat);
      loadBoatRelations(normalizedBoat);
      loadTuningGuidesForBoat(normalizedBoat);

    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const formatOwnership = (ownership?: string) => {
    if (!ownership) return 'Not set';
    return ownership.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const { stats: performanceStats, loading: performanceLoading } = useBoatPerformanceStats({
    sailorId: boat?.sailorId,
    sailNumber: boat?.sailNumber,
    className: boat?.className,
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading boat details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!boat) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Boat not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const summaryCounts = {
    crew: crewMembers.length,
    sails: sails.length,
    maintenance: maintenanceItems.length,
  };
  const mastProfile = buildMastProfile(boat);
  const sailRecommendation = sails.length
    ? `Rotate ${sails[0].name} before your next session.`
    : undefined;

  const heroQuickFacts: {
    label: string;
    value: string;
    icon: IoniconName;
    highlight?: boolean;
  }[] = [
    {
      label: 'Class',
      value: boat.className || 'Unclassified',
      icon: 'boat-outline',
    },
    {
      label: 'Sail Number',
      value: boat.sailNumber || 'Not set',
      icon: 'flag-outline',
    },
    {
      label: 'Ownership',
      value: formatOwnership(boat.ownership),
      icon: 'person-outline',
    },
    {
      label: 'Status',
      value: boat.isPrimary ? 'Primary campaign boat' : 'Fleet boat',
      icon: boat.isPrimary ? 'ribbon-outline' : 'boat-outline',
      highlight: boat.isPrimary,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1D4ED8', '#2563EB', '#0EA5E9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.heroHeaderRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.heroIconButton}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroIconButton}
            onPress={() => router.push(`/(tabs)/boat/edit/${id}`)}
          >
            <Ionicons name="create-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroContent}>
          <View style={styles.heroTitleBlock}>
            <View style={styles.heroBadgeRow}>
              <View style={[styles.heroBadge, boat.isPrimary ? styles.heroBadgePrimary : styles.heroBadgeMuted]}>
                <Ionicons
                  name={boat.isPrimary ? 'ribbon' : 'boat-outline'}
                  size={12}
                  color={boat.isPrimary ? '#1D4ED8' : '#334155'}
                />
                <Text style={[styles.heroBadgeText, boat.isPrimary ? styles.heroBadgeTextPrimary : styles.heroBadgeTextMuted]}>
                  {boat.isPrimary ? 'Primary Boat' : 'Fleet Boat'}
                </Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>{boat.name}</Text>
            <Text style={styles.heroSubtitle}>
              {boat.className} {boat.sailNumber ? `• Sail #${boat.sailNumber}` : ''}
            </Text>
          </View>

          <View style={styles.heroMetricsRow}>
            {heroQuickFacts.map((fact) => (
              <View
                key={fact.label}
                style={[
                  styles.heroMetricCard,
                  fact.highlight ? styles.heroMetricCardHighlight : undefined,
                ]}
              >
                <View style={styles.heroMetricIcon}>
                  <Ionicons
                    name={fact.icon}
                    size={16}
                    color={fact.highlight ? '#F97316' : '#1D4ED8'}
                  />
                </View>
                <Text style={[styles.heroMetricValue, fact.highlight ? styles.heroMetricValueHighlight : undefined]}>
                  {fact.value}
                </Text>
                <Text style={styles.heroMetricLabel}>{fact.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
        >
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.key;
            const badgeValue = (() => {
              switch (tab.badge) {
                case 'crew':
                  return crewMembers.length;
                case 'sails':
                  return sails.length;
                case 'maintenance':
                  return maintenanceItems.length;
                case 'performance':
                  if (performanceLoading) return null;
                  if (!performanceStats) return undefined;
                  return performanceStats.totalRaces;
                default:
                  return undefined;
              }
            })();
            const showBadge = badgeValue !== undefined && badgeValue !== null;
            const showSpinner =
              tab.badge === 'performance' &&
              performanceLoading &&
              !showBadge;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <View style={styles.tabChipIcon}>
                  <Ionicons
                    name={tab.icon}
                    size={16}
                    color={isActive ? '#1D4ED8' : '#64748B'}
                  />
                </View>
                <View style={styles.tabChipTextBlock}>
                  <Text style={[styles.tabChipLabel, isActive && styles.tabChipLabelActive]}>
                    {tab.label}
                  </Text>
                  <Text style={[styles.tabChipDescription, isActive && styles.tabChipDescriptionActive]}>
                    {tab.description}
                  </Text>
                </View>
                {showBadge && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {badgeValue}
                    </Text>
                  </View>
                )}
                {!showBadge && showSpinner && (
                  <View style={styles.tabBadgeSpinner}>
                    <ActivityIndicator size="small" color={isActive ? '#1D4ED8' : '#94A3B8'} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && (
          <BoatDetail
            boat={boat}
            performanceStats={performanceStats}
            performanceLoading={performanceLoading}
            summaryCounts={summaryCounts}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'crew' && (
          <BoatCrewList
            crew={crewMembers}
            loading={crewLoading}
            onManageCrew={() => router.push('/(tabs)/crew')}
            onAddCrew={() => router.push('/(tabs)/crew')}
          />
        )}
        {activeTab === 'sails' && (
          sailsLoading ? (
            <View style={styles.placeholderContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.placeholderText}>Loading sail inventory…</Text>
            </View>
          ) : (
            <SailInventory
              sails={sails}
              recommendation={sailRecommendation}
              onAddSail={() => router.push(`/(tabs)/boat/edit/${boat.id}`)}
            />
          )
        )}
        {activeTab === 'rigging' && (
          <RiggingConfig
            presets={riggingPresets}
            mastProfile={mastProfile}
            allowEditing={false}
            emptyStateMessage="Add a tuning preset from the edit boat screen to track rig numbers."
          />
        )}
        {activeTab === 'equipment' && (
          <View style={styles.placeholderContainer}>
            <Ionicons name="construct-outline" size={64} color="#CBD5E1" />
            <Text style={styles.placeholderText}>Equipment coming soon</Text>
          </View>
        )}
        {activeTab === 'maintenance' && (
          <View style={{ flex: 1 }}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>Maintenance Log</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowMaintenanceModal(true)}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add task</Text>
              </TouchableOpacity>
            </View>
            <MaintenanceSchedule
              items={maintenanceItems}
              loading={maintenanceLoading}
              onMarkComplete={handleMarkMaintenanceComplete}
              emptyStateMessage="Log maintenance tasks to keep your program on schedule."
            />
          </View>
        )}
        {activeTab === 'performance' && (
          <View style={styles.placeholderContainer}>
            <Ionicons name="stats-chart-outline" size={64} color="#CBD5E1" />
            <Text style={styles.placeholderText}>Performance analytics coming soon</Text>
            <Text style={{fontSize: 14, color: '#94A3B8', marginTop: 8, textAlign: 'center'}}>
              Chart-based performance analysis will be available in the mobile app
            </Text>
          </View>
        )}
        {activeTab === 'tuning3d' && (
          <ScrollView style={{flex: 1}}>
            {/* 3D Boat Viewer */}
            <View style={{backgroundColor: '#ffffff', padding: 16, marginBottom: 8}}>
              <Text style={{fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 12}}>
                3D Boat Visualization
              </Text>
              <Boat3DViewer
                boatClass={boat.className}
                tuning={rigTuning}
                width={375}
                height={400}
              />
            </View>

            {/* Rig Tuning Controls */}
            <View style={{flex: 1}}>
              <RigTuningControls
                tuning={rigTuning}
                onTuningChange={setRigTuning}
                boatClass={boat.className}
              />
            </View>
          </ScrollView>
        )}
        {activeTab === 'guides' && (
          <TuningGuideList
            boatClass={boat.className}
            guides={guides}
            loading={guidesLoading}
            error={guidesError}
            onRetry={() => loadTuningGuidesForBoat(boat)}
            onOpenGuide={handleOpenGuide}
          />
        )}
      </View>

      {/* Universal FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // TODO: Add context-aware FAB actions
          logger.debug('FAB pressed for tab:', activeTab);
        }}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
      {renderMaintenanceModal()}
    </SafeAreaView>
  );
}

const CREW_ROLE_FALLBACKS: CrewRoleOption[] = [
  'helmsman',
  'tactician',
  'trimmer',
  'bowman',
  'pit',
  'grinder',
  'other',
];

const normalizeCrewRole = (value?: string | null): CrewRoleOption => {
  if (!value) return 'other';
  const normalized = value.toLowerCase();
  if (CREW_ROLE_FALLBACKS.includes(normalized as CrewRoleOption)) {
    return normalized as CrewRoleOption;
  }
  return 'other';
};

const mapCrewMembers = (records: BoatCrewMember[]): CrewListItem[] =>
  records.map((member) => ({
    id: member.id,
    name: member.crew_name || 'Crew Member',
    email: member.crew_email || undefined,
    role: normalizeCrewRole(member.role),
    experience: member.experience_notes || undefined,
    availability: member.availability_status || 'available',
    notes: undefined,
  }));

const mapSailInventory = (items: BoatEquipmentItem[]): SailInventoryItem[] => {
  return items
    .filter((item) => (item.category || '').toLowerCase().includes('sail'))
    .map((item, index) => ({
      id: item.id,
      type: mapSailType(item.category),
      name: item.name || `Sail ${index + 1}`,
      manufacturer: item.manufacturer || 'Unknown',
      races: item.usage_hours ?? 0,
      condition: deriveConditionScore(item.status),
      serviceDue: item.service_interval_months
        ? `Service every ${item.service_interval_months} months`
        : 'No service schedule',
      performanceRating: 75,
      notes: item.notes || undefined,
    }));
};

const mapSailType = (category?: string | null): SailInventoryItem['type'] => {
  const value = (category || '').toLowerCase();
  if (value.includes('main')) return 'main';
  if (value.includes('genoa')) return 'genoa';
  if (value.includes('spi') || value.includes('kite')) return 'spinnaker';
  if (value.includes('jib')) return 'jib';
  if (value.includes('code')) return 'code_zero';
  return 'main';
};

const deriveConditionScore = (status?: string | null): number => {
  if (!status) return 75;
  const normalized = status.toLowerCase();
  if (normalized.includes('new') || normalized.includes('excellent')) return 92;
  if (normalized.includes('needs') || normalized.includes('repair') || normalized.includes('replace')) {
    return 45;
  }
  return 70;
};

const mapMaintenanceRecords = (records: MaintenanceRecord[]): MaintenanceItem[] =>
  records.map((record) => ({
    id: record.id,
    status: (record.status as MaintenanceItem['status']) || 'scheduled',
    category: (record.category as MaintenanceItem['category']) || 'other',
    item: record.item || record.service || 'Maintenance task',
    service: record.service || undefined,
    dueDate: record.due_date || undefined,
    completedDate: record.completed_date || undefined,
    cost: record.cost || undefined,
    vendor: record.vendor || undefined,
    notes: record.notes || undefined,
  }));

const mapTuningPresets = (presets: BoatTuningPreset[]): RiggingPreset[] =>
  presets.map((preset, index) => ({
    id: preset.id || `preset-${index}`,
    name: preset.name || `Preset ${index + 1}`,
    conditions: preset.conditions || undefined,
    isFavorite: Boolean(preset.is_favorite),
    settings: mapPresetSettings(preset.settings),
  }));

const mapPresetSettings = (settings?: Record<string, any> | null): Record<string, string> => {
  if (!settings) return {};
  return Object.entries(settings).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value === null || value === undefined) return acc;
    acc[key] = typeof value === 'string' ? value : String(value);
    return acc;
  }, {});
};

const buildMastProfile = (boat: BoatDetails | null) => {
  if (!boat) return undefined;
  return {
    name: `${boat.className} Rig`,
    meta: boat.manufacturer ? `${boat.manufacturer} build` : undefined,
    specs: [
      { label: 'Storage', value: boat.storageLocation || 'Not set' },
      { label: 'Ownership', value: boat.ownership || 'Not set' },
    ],
  };
};

const logger = createLogger('[id]');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabBar: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBarContent: {
    paddingRight: 8,
    gap: 12,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 180,
  },
  tabChipActive: {
    borderColor: '#BFDBFE',
    ...Platform.select({
      web: {
        boxShadow: '0px 6px 14px rgba(29, 78, 216, 0.18)',
      },
      default: {
        shadowColor: '#1D4ED8',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  tabChipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabChipTextBlock: {
    flex: 1,
  },
  tabChipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  tabChipLabelActive: {
    color: '#1D4ED8',
  },
  tabChipDescription: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  tabChipDescriptionActive: {
    color: '#2563EB',
  },
  tabBadge: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },
  tabBadgeActive: {
    backgroundColor: '#1D4ED8',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  tabBadgeSpinner: {
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 24px rgba(29, 78, 216, 0.22)',
      },
      default: {
        shadowColor: '#1D4ED8',
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 18,
        elevation: 6,
      },
    }),
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroContent: {
    marginTop: 16,
    gap: 18,
  },
  heroTitleBlock: {
    gap: 8,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  heroBadgePrimary: {
    backgroundColor: '#FDE68A',
  },
  heroBadgeMuted: {
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  heroBadgeTextPrimary: {
    color: '#92400E',
  },
  heroBadgeTextMuted: {
    color: '#1E293B',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(241,245,249,0.9)',
    letterSpacing: 0.4,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  heroMetricCard: {
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
  },
  heroMetricCardHighlight: {
    backgroundColor: '#FFF7ED',
  },
  heroMetricIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroMetricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  heroMetricValueHighlight: {
    color: '#C2410C',
  },
  heroMetricLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  modalMultiline: {
    minHeight: 80,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 4,
  },
  chipScroll: {
    marginVertical: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#E0ECFF',
    borderColor: '#3B82F6',
  },
  chipText: {
    fontSize: 13,
    color: '#475569',
  },
  chipTextSelected: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  modalSaveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  modalSaveButtonDisabled: {
    opacity: 0.6,
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    backgroundColor: '#3B82F6',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px',
    elevation: 6,
  },
});
