// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export type RiggingSettingMap = Record<string, string>;

export interface RiggingPreset {
  id: string;
  name: string;
  conditions?: string;
  isFavorite?: boolean;
  settings: RiggingSettingMap;
}

export interface VenuePreset {
  id: string;
  name: string;
  venue?: string;
  description?: string;
}

export interface MastSpec {
  label: string;
  value: string;
}

export interface MastProfile {
  name: string;
  meta?: string;
  icon?: Ionicons['props']['name'];
  specs?: MastSpec[];
}

export interface RiggingConfigProps {
  presets: RiggingPreset[];
  mastProfile?: MastProfile;
  venuePresets?: VenuePreset[];
  selectedPresetId?: string | null;
  defaultPresetId?: string | null;
  allowEditing?: boolean;
  onPresetChange?: (presetId: string) => void;
  onAddPreset?: () => void;
  onAddVenuePreset?: () => void;
  onToggleFavorite?: (presetId: string, nextValue: boolean) => void;
  onSavePreset?: (preset: RiggingPreset) => void;
  emptyStateMessage?: string;
}

const FALLBACK_MAST_PROFILE: MastProfile = {
  name: 'Class Standard Mast',
  meta: 'Carbon spar • One design spec',
  icon: 'hardware-chip-outline',
  specs: [
    { label: 'Length', value: '9.0 m' },
    { label: 'Weight', value: '12.5 kg' },
    { label: 'Bend', value: 'Medium' },
  ],
};

const DEFAULT_EMPTY_MESSAGE =
  'Add a tuning preset to start tracking mast rake, shroud tension, and other rig settings.';

export function RiggingConfig({
  presets,
  mastProfile,
  venuePresets = [],
  selectedPresetId,
  defaultPresetId,
  allowEditing = true,
  onPresetChange,
  onAddPreset,
  onAddVenuePreset,
  onToggleFavorite,
  onSavePreset,
  emptyStateMessage = DEFAULT_EMPTY_MESSAGE,
}: RiggingConfigProps) {
  const [internalPresetId, setInternalPresetId] = useState<string | null>(
    defaultPresetId ?? presets[0]?.id ?? null,
  );
  const [editMode, setEditMode] = useState(false);
  const [draftSettings, setDraftSettings] = useState<RiggingSettingMap>({});

  const activePresetId = selectedPresetId ?? internalPresetId;

  const currentPreset = useMemo(
    () => presets.find((preset) => preset.id === activePresetId) ?? null,
    [presets, activePresetId],
  );

  useEffect(() => {
    if (!selectedPresetId && !internalPresetId && presets.length > 0) {
      setInternalPresetId(presets[0].id);
    }
  }, [presets, internalPresetId, selectedPresetId]);

  useEffect(() => {
    if (currentPreset) {
      setDraftSettings(currentPreset.settings);
    } else {
      setDraftSettings({});
    }
    setEditMode(false);
  }, [currentPreset?.id]);

  const handlePresetSelect = (presetId: string) => {
    if (!selectedPresetId) {
      setInternalPresetId(presetId);
    }
    onPresetChange?.(presetId);
    setEditMode(false);
  };

  const handleSettingChange = (key: string, value: string) => {
    setDraftSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (!currentPreset) return;
    const updatedPreset: RiggingPreset = {
      ...currentPreset,
      settings: { ...draftSettings },
    };
    onSavePreset?.(updatedPreset);
    setEditMode(false);
  };

  if (presets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="git-network-outline" size={40} color="#CBD5E1" />
        <Text style={styles.emptyTitle}>No tuning presets yet</Text>
        <Text style={styles.emptyMessage}>{emptyStateMessage}</Text>
        {onAddPreset && (
          <TouchableOpacity style={styles.emptyButton} onPress={onAddPreset}>
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.emptyButtonText}>New preset</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const profile = mastProfile ?? FALLBACK_MAST_PROFILE;

  return (
    <View style={styles.container}>
      <View style={styles.mastInfo}>
        <View style={styles.mastHeader}>
          <Ionicons name={profile.icon ?? 'hardware-chip-outline'} size={24} color="#3B82F6" />
          <View style={styles.mastDetails}>
            <Text style={styles.mastTitle}>{profile.name}</Text>
            {profile.meta && <Text style={styles.mastMeta}>{profile.meta}</Text>}
          </View>
        </View>
        {profile.specs && profile.specs.length > 0 && (
          <View style={styles.mastSpecs}>
            {profile.specs.map((spec) => (
              <View key={spec.label} style={styles.specItem}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {venuePresets.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Venue Presets</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.venueScroll}
          >
            {venuePresets.map((preset) => (
              <View key={preset.id} style={styles.venueCard}>
                <Ionicons name="location-outline" size={16} color="#3B82F6" />
                <Text style={styles.venueName}>{preset.name}</Text>
                {preset.venue && <Text style={styles.venueLocation}>{preset.venue}</Text>}
                {preset.description && (
                  <Text style={styles.venueDescription}>{preset.description}</Text>
                )}
              </View>
            ))}
            {onAddVenuePreset && (
              <TouchableOpacity style={styles.addVenueCard} onPress={onAddVenuePreset}>
                <Ionicons name="add-circle-outline" size={20} color="#64748B" />
                <Text style={styles.addVenueText}>Add venue setup</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tuning Presets</Text>
          {onAddPreset && (
            <TouchableOpacity onPress={onAddPreset}>
              <Ionicons name="add-circle" size={24} color="#3B82F6" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.presetList}>
          {presets.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.presetCard,
                activePresetId === preset.id && styles.presetCardActive,
              ]}
              onPress={() => handlePresetSelect(preset.id)}
            >
              <View style={styles.presetHeader}>
                <Text
                  style={[
                    styles.presetName,
                    activePresetId === preset.id && styles.presetNameActive,
                  ]}
                >
                  {preset.name}
                </Text>
                {preset.isFavorite ? (
                  <TouchableOpacity hitSlop={8} onPress={() => onToggleFavorite?.(preset.id, false)}>
                    <Ionicons name="star" size={18} color="#F59E0B" />
                  </TouchableOpacity>
                ) : (
                  onToggleFavorite && (
                    <TouchableOpacity hitSlop={8} onPress={() => onToggleFavorite(preset.id, true)}>
                      <Ionicons name="star-outline" size={18} color="#CBD5E1" />
                    </TouchableOpacity>
                  )
                )}
              </View>
              {preset.conditions && (
                <Text style={styles.presetConditions}>{preset.conditions}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {currentPreset && (
        <ScrollView style={styles.settingsContainer}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Current setup values</Text>
            {allowEditing && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  if (editMode) {
                    handleSave();
                  } else {
                    setEditMode(true);
                  }
                }}
              >
                <Ionicons
                  name={editMode ? 'checkmark-circle' : 'create-outline'}
                  size={18}
                  color="#3B82F6"
                />
                <Text style={styles.editButtonText}>{editMode ? 'Save' : 'Edit'}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.settingsGrid}>
            {Object.entries(editMode ? draftSettings : currentPreset.settings).map(
              ([key, value]) => (
                <View key={key} style={styles.settingItem}>
                  <Text style={styles.settingLabel}>{formatSettingLabel(key)}</Text>
                  {editMode ? (
                    <TextInput
                      style={styles.settingInput}
                      value={draftSettings[key] ?? ''}
                      onChangeText={(text) => handleSettingChange(key, text)}
                      placeholder="Enter value"
                      placeholderTextColor="#94A3B8"
                    />
                  ) : (
                    <Text style={styles.settingValue}>{value}</Text>
                  )}
                </View>
              ),
            )}
          </View>

          {editMode && (
            <View style={styles.saveActions}>
              <TouchableOpacity style={styles.saveAsPresetButton} onPress={handleSave}>
                <Ionicons name="bookmark-outline" size={18} color="#3B82F6" />
                <Text style={styles.saveAsPresetText}>Save preset</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const formatSettingLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, ' ');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mastInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  mastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  mastDetails: {
    flex: 1,
  },
  mastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  mastMeta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  mastSpecs: {
    flexDirection: 'row',
    gap: 24,
    flexWrap: 'wrap',
  },
  specItem: {
    gap: 2,
  },
  specLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  venueScroll: {
    gap: 12,
  },
  venueCard: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    minWidth: 140,
    gap: 4,
  },
  venueName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  venueLocation: {
    fontSize: 11,
    color: '#64748B',
  },
  venueDescription: {
    fontSize: 11,
    color: '#475569',
  },
  addVenueCard: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 10,
    minWidth: 140,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  addVenueText: {
    fontSize: 12,
    color: '#64748B',
  },
  presetList: {
    gap: 8,
  },
  presetCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  presetName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  presetNameActive: {
    color: '#3B82F6',
  },
  presetConditions: {
    fontSize: 12,
    color: '#64748B',
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 16,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3B82F6',
  },
  settingsGrid: {
    gap: 12,
  },
  settingItem: {
    gap: 6,
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  settingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
  },
  settingInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  saveActions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  saveAsPresetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  saveAsPresetText: {
    fontSize: 14,
    fontWeight: '600',
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
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 4,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default RiggingConfig;
