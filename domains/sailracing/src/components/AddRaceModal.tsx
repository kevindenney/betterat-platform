import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import theme from '../theme';

// ============================================================================
// Types
// ============================================================================

interface AddRaceModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateRace: (raceData: NewRaceData) => void;
}

export interface NewRaceData {
  name: string;
  dateTime: string;
  venue: string;
  boat: string;
  notes: string;
}

// Mock boat options (in reality, this would come from user's boats)
const MOCK_BOATS = [
  { id: '1', name: 'J/70 "Velocity"' },
  { id: '2', name: 'J/70 "Lightning"' },
  { id: '3', name: 'J/24 "Seabird"' },
];

// ============================================================================
// AddRaceModal Component
// ============================================================================

export const AddRaceModal: React.FC<AddRaceModalProps> = ({
  visible,
  onClose,
  onCreateRace,
}) => {
  const [raceName, setRaceName] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [venue, setVenue] = useState('');
  const [selectedBoat, setSelectedBoat] = useState(MOCK_BOATS[0].name);
  const [notes, setNotes] = useState('');
  const [showBoatPicker, setShowBoatPicker] = useState(false);

  const handleCreate = () => {
    // Validation
    if (!raceName.trim()) {
      Alert.alert('Required Field', 'Please enter a race name');
      return;
    }
    if (!venue.trim()) {
      Alert.alert('Required Field', 'Please enter a venue');
      return;
    }

    // Create race data
    const newRace: NewRaceData = {
      name: raceName.trim(),
      dateTime: dateTime || new Date().toISOString(),
      venue: venue.trim(),
      boat: selectedBoat,
      notes: notes.trim(),
    };

    // Call parent callback
    onCreateRace(newRace);

    // Reset form
    setRaceName('');
    setDateTime('');
    setVenue('');
    setSelectedBoat(MOCK_BOATS[0].name);
    setNotes('');
    setShowBoatPicker(false);

    // Show success
    Alert.alert(
      'Success!',
      'Race created successfully',
      [{ text: 'OK' }]
    );
  };

  const handleCancel = () => {
    // Reset form
    setRaceName('');
    setDateTime('');
    setVenue('');
    setSelectedBoat(MOCK_BOATS[0].name);
    setNotes('');
    setShowBoatPicker(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleCancel}
      >
        {/* Modal Card */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalCard}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add New Race</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCancel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Race Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Race Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={raceName}
                onChangeText={setRaceName}
                placeholder="e.g., Friday Night Series - Race 5"
                placeholderTextColor={theme.colors.textTertiary}
                autoCapitalize="words"
              />
            </View>

            {/* Date & Time */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date & Time</Text>
              <TextInput
                style={styles.input}
                value={dateTime}
                onChangeText={setDateTime}
                placeholder="e.g., 2024-11-20 18:00 (or tap to use date picker later)"
                placeholderTextColor={theme.colors.textTertiary}
              />
              <Text style={styles.helperText}>
                For now, enter manually. Date picker coming soon!
              </Text>
            </View>

            {/* Venue */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Venue <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={venue}
                onChangeText={setVenue}
                placeholder="e.g., Royal Hong Kong Yacht Club"
                placeholderTextColor={theme.colors.textTertiary}
                autoCapitalize="words"
              />
            </View>

            {/* Boat Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Boat</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowBoatPicker(!showBoatPicker)}
              >
                <Text style={styles.pickerButtonText}>{selectedBoat}</Text>
                <Text style={styles.pickerButtonIcon}>
                  {showBoatPicker ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {/* Boat Options */}
              {showBoatPicker && (
                <View style={styles.pickerOptions}>
                  {MOCK_BOATS.map((boat) => (
                    <TouchableOpacity
                      key={boat.id}
                      style={[
                        styles.pickerOption,
                        selectedBoat === boat.name && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedBoat(boat.name);
                        setShowBoatPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          selectedBoat === boat.name &&
                            styles.pickerOptionTextSelected,
                        ]}
                      >
                        {boat.name}
                      </Text>
                      {selectedBoat === boat.name && (
                        <Text style={styles.pickerOptionCheck}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional details..."
                placeholderTextColor={theme.colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={handleCancel}
            >
              <Text style={styles.buttonCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonCreate]}
              onPress={handleCreate}
            >
              <Text style={styles.buttonCreateText}>Create Race</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default AddRaceModal;

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.cardLarge,
    ...theme.shadows.xlarge,
    overflow: 'hidden',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },

  // Form
  formScroll: {
    flex: 1,
  },
  formContent: {
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  formGroup: {
    gap: theme.spacing.sm,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    ...theme.typography.body,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    paddingTop: theme.spacing.md,
  },
  helperText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },

  // Picker
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
  },
  pickerButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  pickerButtonIcon: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  pickerOptions: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    marginTop: theme.spacing.sm,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: theme.colors.primary + '10',
  },
  pickerOptionText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  pickerOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  pickerOptionCheck: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '700',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonCancelText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  buttonCreate: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.medium,
  },
  buttonCreateText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: '700',
  },
});
