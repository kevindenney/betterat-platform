// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

export type OwnershipType = 'owned' | 'co_owned' | 'chartered' | 'club_boat' | 'crew';

export interface BoatClassOption {
  id: string;
  name: string;
  association?: string | null;
}

export interface QuickAddBoatValues {
  name: string;
  sailNumber?: string;
  classId: string;
  ownershipType: OwnershipType;
}

export interface QuickAddBoatFormProps {
  visible: boolean;
  classes: BoatClassOption[];
  loadingClasses?: boolean;
  submitting?: boolean;
  defaultOwnershipType?: OwnershipType;
  initialValues?: Partial<QuickAddBoatValues>;
  title?: string;
  errorMessage?: string | null;
  onDismiss: () => void;
  onSubmit: (values: QuickAddBoatValues) => void;
  onReloadClasses?: () => void;
}

const OWNERSHIP_HELP_TEXT: Record<OwnershipType, string> = {
  owned: 'You are the sole owner of this boat.',
  co_owned: 'Boat is shared or co-owned by multiple sailors.',
  chartered: 'Temporary charter or rental arrangement.',
  club_boat: 'Boat provided by your sailing club.',
  crew: "You're racing as crew on someone else&rsquo;s boat.",
};

const DEFAULT_TITLE = 'Quick Add Boat';

export function QuickAddBoatForm({
  visible,
  classes,
  loadingClasses = false,
  submitting = false,
  defaultOwnershipType = 'owned',
  initialValues,
  title = DEFAULT_TITLE,
  errorMessage,
  onDismiss,
  onSubmit,
  onReloadClasses,
}: QuickAddBoatFormProps) {
  const [boatName, setBoatName] = useState(initialValues?.name ?? '');
  const [sailNumber, setSailNumber] = useState(initialValues?.sailNumber ?? '');
  const [classId, setClassId] = useState(initialValues?.classId ?? '');
  const [ownershipType, setOwnershipType] = useState<OwnershipType>(
    initialValues?.ownershipType ?? defaultOwnershipType,
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setBoatName(initialValues?.name ?? '');
      setSailNumber(initialValues?.sailNumber ?? '');
      setClassId(initialValues?.classId ?? '');
      setOwnershipType(initialValues?.ownershipType ?? defaultOwnershipType);
      setValidationError(null);
    }
  }, [visible, defaultOwnershipType, initialValues]);

  const resetForm = () => {
    setBoatName('');
    setSailNumber('');
    setClassId('');
    setOwnershipType(defaultOwnershipType);
    setValidationError(null);
  };

  const handleDismiss = () => {
    resetForm();
    onDismiss();
  };

  const handleSubmit = () => {
    if (!boatName.trim()) {
      setValidationError('Please enter a boat name.');
      return;
    }
    if (!classId) {
      setValidationError('Select a boat class to continue.');
      return;
    }

    setValidationError(null);
    onSubmit({
      name: boatName.trim(),
      sailNumber: sailNumber.trim() || undefined,
      classId,
      ownershipType,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleDismiss}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {loadingClasses && classes.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0284C7" />
              <Text style={styles.loadingText}>Loading boat classes…</Text>
              {onReloadClasses && (
                <TouchableOpacity style={styles.retryButton} onPress={onReloadClasses}>
                  <Ionicons name="refresh" size={16} color="#FFFFFF" />
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>
                  Boat name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={boatName}
                  onChangeText={setBoatName}
                  placeholder="e.g., Dragonfly, Blue Lightning"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  editable={!submitting}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Sail number</Text>
                <TextInput
                  value={sailNumber}
                  onChangeText={setSailNumber}
                  placeholder="e.g., 123, HKG 456"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  editable={!submitting}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Boat class <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={classId}
                    onValueChange={(value) => setClassId(String(value))}
                    enabled={!submitting}
                  >
                    <Picker.Item label="Select a class…" value="" />
                    {classes.map((boatClass) => (
                      <Picker.Item
                        key={boatClass.id}
                        label={`${boatClass.name}${
                          boatClass.association ? ` (${boatClass.association})` : ''
                        }`}
                        value={boatClass.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>How do you use this boat?</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={ownershipType}
                    onValueChange={(value) => setOwnershipType(value as OwnershipType)}
                    enabled={!submitting}
                  >
                    <Picker.Item label="I own this boat" value="owned" />
                    <Picker.Item label="Co-owned / Shared" value="co_owned" />
                    <Picker.Item label="Chartered / Rental" value="chartered" />
                    <Picker.Item label="Club boat" value="club_boat" />
                    <Picker.Item label="I crew on this boat" value="crew" />
                  </Picker>
                </View>
                <Text style={styles.helpText}>{OWNERSHIP_HELP_TEXT[ownershipType]}</Text>
              </View>

              {(validationError || errorMessage) && (
                <Text style={styles.errorText}>{validationError ?? errorMessage}</Text>
              )}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleDismiss}
                  disabled={submitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.submitButton,
                    submitting && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Add boat</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#0284C7',
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
    marginBottom: 12,
  },
});

export default QuickAddBoatForm;
