import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { z } from 'zod';
import {
  createDomain,
  createActivityType,
  createMetric,
  createAgent,
  DomainDashboardProps,
} from '@betterat/domain-sdk';
import { Button, UnifiedDomainDashboard } from '@betterat/ui';

// ============================================================================
// Test Dashboard Component - Simple Horizontal Carousel Demo
// ============================================================================

type TestItem = {
  id: string;
  title: string;
  status: 'pass' | 'fail' | 'pending';
  description: string;
};

const SAMPLE_TEST_ITEMS: TestItem[] = [
  { id: '1', title: 'Unit Tests', status: 'pass', description: '245 tests passing' },
  { id: '2', title: 'Integration Tests', status: 'pass', description: '89 tests passing' },
  { id: '3', title: 'E2E Tests', status: 'pending', description: 'Running...' },
  { id: '4', title: 'Performance Tests', status: 'fail', description: '2 tests failing' },
  { id: '5', title: 'Accessibility Tests', status: 'pass', description: '34 tests passing' },
  { id: '6', title: 'Security Tests', status: 'pass', description: '12 tests passing' },
];

const TestDashboard: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  // State for test items
  const [testItems, setTestItems] = useState<TestItem[]>(SAMPLE_TEST_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(SAMPLE_TEST_ITEMS[0]?.id || null);

  // Modal state for adding test suite
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTestName, setNewTestName] = useState('');

  const handleAddTestSuite = () => {
    if (!newTestName.trim()) {
      Alert.alert('Error', 'Please enter a test suite name');
      return;
    }

    // Create new test suite
    const newTest: TestItem = {
      id: Date.now().toString(),
      title: newTestName.trim(),
      status: 'pending',
      description: 'Just created - no tests yet',
    };

    // Add to the list
    setTestItems([...testItems, newTest]);

    Alert.alert('Success', `Test suite "${newTestName}" created!`);
    setNewTestName('');
    setShowAddModal(false);
  };

  // Render function for test item cards
  const renderTestCard = (item: TestItem) => {
    const statusColors = {
      pass: '#10B981',
      fail: '#EF4444',
      pending: '#F59E0B',
    };

    const statusIcons = {
      pass: '✅',
      fail: '❌',
      pending: '⏳',
    };

    return (
      <View style={[styles.testCard, { borderLeftColor: statusColors[item.status] }]}>
        <Text style={styles.testCardIcon}>{statusIcons[item.status]}</Text>
        <Text style={styles.testCardTitle}>{item.title}</Text>
        <Text style={styles.testCardDescription}>{item.description}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusBadgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <UnifiedDomainDashboard
        items={testItems}
        selectedItemId={selectedItemId}
        onItemSelect={setSelectedItemId}
        renderCard={renderTestCard}
        carouselTitle="Test Suites Carousel"
        carouselSubtitle={`Scroll horizontally through ${testItems.length} test suites`}
        cardWidth={280}
        cardSpacing={16}
        onAddPress={() => {
          setShowAddModal(true);
          services.analytics.trackEvent('add_test_pressed', { userId });
        }}
        addCardLabel="Add Test Suite"
        addCardSubtitle="Create a new test suite"
      >
      </UnifiedDomainDashboard>

      {/* Add Test Suite Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Test Suite</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Test Suite Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={newTestName}
                onChangeText={setNewTestName}
                placeholder="e.g., API Tests"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleAddTestSuite}
              >
                <Text style={styles.modalSaveText}>Add Test Suite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  carouselSection: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  testCardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  testCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  testCardDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#64748B',
    fontWeight: '300',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  modalSaveButton: {
    backgroundColor: '#10B981',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// ============================================================================
// Activity Type Definitions
// ============================================================================

const testActivity = createActivityType({
  id: 'test-activity',
  name: 'Test Activity',
  description: 'Simple activity for testing',
  icon: '📝',
  metadataSchema: z.object({
    notes: z.string().min(1, 'Notes are required'),
  }),
  displayComponent: ({ activity }) => (
    <View style={{ padding: 16 }}>
      <Text>Test Activity</Text>
      <Text>{activity.metadata.notes}</Text>
    </View>
  ),
  loggerComponent: ({ onSave }) => {
    const [notes, setNotes] = React.useState('');

    return (
      <View style={{ padding: 16 }}>
        <Text>Log Test Activity</Text>
        <Button
          title="Save"
          onPress={() => onSave({ notes: 'Test note' })}
        />
      </View>
    );
  },
});

// ============================================================================
// Metric Definitions
// ============================================================================

const activityCountMetric = createMetric({
  id: 'activity-count',
  name: 'Activity Count',
  description: 'Total number of activities logged',
  calculator: (activities) => activities.length,
  formatter: (value) => `${value} activities`,
  chartConfig: {
    type: 'bar',
    color: '#10B981',
  },
});

// ============================================================================
// AI Agent Definitions
// ============================================================================

const testCoach = createAgent({
  id: 'test-coach',
  name: 'Test Coach',
  description: 'Helpful coach for testing',
  systemPrompt: `You are a helpful test coach for the BetterAt platform.
Your role is to guide users through testing the platform features and provide
encouragement. Keep responses brief and positive.`,
  tools: [],
  model: 'gpt-4',
});

// ============================================================================
// Domain Export
// ============================================================================

export default createDomain({
  meta: {
    id: 'test',
    name: 'Test Domain',
    description: 'Validates platform architecture',
    icon: '🧪',
    primaryColor: '#10B981',
    version: '1.0.0',
    minPlatformVersion: '1.0.0',
  },
  activityTypes: [testActivity],
  metrics: [activityCountMetric],
  agents: [testCoach],
  routes: [
    {
      path: '/dashboard',
      component: TestDashboard,
      name: 'Dashboard',
      tabLabel: 'Dashboard',
      tabIcon: '📊',
    },
  ],
  components: {
    Dashboard: TestDashboard,
  },
});
