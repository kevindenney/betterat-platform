import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface AddCaseModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateCase: (payload: NewCaseData) => void;
}

export interface NewCaseData {
  title: string;
  scheduledStart: string;
  unit: string;
  focus: string;
  notes: string;
}

const AddCaseModal: React.FC<AddCaseModalProps> = ({ visible, onClose, onCreateCase }) => {
  const [title, setTitle] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [unit, setUnit] = useState('');
  const [focus, setFocus] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setTitle('');
    setScheduledStart('');
    setUnit('');
    setFocus('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Missing field', 'Add a case title to continue.');
      return;
    }

    onCreateCase({
      title: title.trim(),
      scheduledStart: scheduledStart || new Date().toISOString(),
      unit: unit.trim(),
      focus: focus.trim(),
      notes: notes.trim(),
    });
    Alert.alert('Logged', 'Case scheduled successfully');
    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose}>
        <TouchableOpacity
          style={styles.sheet}
          activeOpacity={1}
          onPress={(evt) => evt.stopPropagation()}
        >
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Schedule Simulation</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Case title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Airway emergency drill"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Start time</Text>
              <TextInput
                style={styles.input}
                value={scheduledStart}
                onChangeText={setScheduledStart}
                placeholder="2025-01-04 14:00"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.helper}>Use 24h format; calendar picker coming soon.</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Unit</Text>
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
                placeholder="Surgical step-down"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Learning focus</Text>
              <TextInput
                style={styles.input}
                value={focus}
                onChangeText={setFocus}
                placeholder="Escalation + handoff clarity"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                multiline
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
                placeholder="Scenario cues, facilitator, observers..."
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
              <Text style={styles.submitText}>Save Case</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  close: {
    fontSize: 22,
    color: '#475569',
  },
  form: {
    gap: 16,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B21A8',
  },
  helper: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  multiline: {
    minHeight: 80,
  },
  submit: {
    backgroundColor: '#C026D3',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddCaseModal;
