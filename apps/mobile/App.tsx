import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar, Modal, TouchableOpacity, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { registerDomain, getDomain } from '@betterat/core';
import testDomain from '@betterat/domains-test';
import yachtRacingDomain from '@betterat/domains-yachtracing';
import type { PlatformServices } from '@betterat/domain-sdk';
import { RacesScreen } from '../../domains/yachtracing/src/screens/RacesScreen';
import { CoursesScreen } from '../../domains/yachtracing/src/screens/CoursesScreen';
import { BoatScreen } from '../../domains/yachtracing/src/screens/BoatScreen';
import { VenueScreen } from '../../domains/yachtracing/src/screens/VenueScreen';
import { MoreScreen } from '../../domains/yachtracing/src/screens/MoreScreen';

const Tab = createBottomTabNavigator();

const mockServices: PlatformServices = {
  user: {
    getCurrentUser: async () => ({ id: 'test-user', email: 'test@example.com', name: 'Test User' }),
    getUserProfile: async () => null,
    updateProfile: async () => {},
  },
  data: {
    activities: {
      list: async () => [],
      get: async () => null,
      create: async (data) => ({
        id: '1',
        userId: 'test-user',
        domainId: data.domainId,
        activityTypeId: data.activityTypeId,
        metadata: data.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      update: async (id, data) => ({
        id,
        userId: 'test-user',
        domainId: 'test',
        activityTypeId: 'test',
        metadata: data.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      delete: async () => {},
    },
    metrics: {
      list: async () => [],
      record: async () => ({
        id: '1',
        userId: 'test-user',
        domainId: 'test',
        metricId: 'test',
        value: 0,
        timestamp: new Date(),
      }),
    },
    sessions: {
      list: async () => [],
      get: async () => null,
      create: async () => ({
        id: '1',
        userId: 'test-user',
        domainId: 'test',
        agentId: 'test',
        messages: [],
        startedAt: new Date(),
      }),
      addMessage: async () => {},
      end: async () => {},
    },
  },
  ai: {
    chat: async () => ({ content: 'Test response' }),
    executeTools: async (calls) => calls,
  },
  storage: {
    uploadFile: async () => 'test-url',
    getFileUrl: async () => 'test-url',
    deleteFile: async () => {},
  },
  analytics: {
    trackEvent: async (event, props) => {
      console.log('📊 Analytics:', event, props);
    },
    trackScreen: async (screen, props) => {
      console.log('📱 Screen:', screen, props);
    },
  },
  navigation: {
    navigate: () => {},
    goBack: () => {},
    reset: () => {},
  },
};

// Screen wrapper components that provide props to domain screens
function RacesScreenWrapper() {
  return <RacesScreen userId="test-user" services={mockServices} />;
}

function CoursesScreenWrapper() {
  return <CoursesScreen userId="test-user" services={mockServices} />;
}

function BoatScreenWrapper() {
  return <BoatScreen userId="test-user" services={mockServices} />;
}

function VenueScreenWrapper() {
  return <VenueScreen userId="test-user" services={mockServices} />;
}

function MoreScreenWrapper() {
  return <MoreScreen userId="test-user" services={mockServices} />;
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [isMoreModalVisible, setIsMoreModalVisible] = useState(false);

  useEffect(() => {
    registerDomain(testDomain);
    registerDomain(yachtRacingDomain);
    console.log('✅ Test domain registered:', testDomain.meta.name);
    console.log('✅ Yacht Racing domain registered:', yachtRacingDomain.meta.name);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading BetterAt Platform...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const domain = getDomain('yachtracing');

  if (!domain) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>❌ Domain not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Platform Header (fixed) */}
      <View style={styles.header}>
        <Text style={styles.title}>🚀 BetterAt Platform</Text>
        <Text style={styles.subtitle}>Loaded: Yacht Racing</Text>
      </View>

      {/* Tab Navigator (fills rest of space) */}
      <View style={styles.content}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: '#3B82F6',
              tabBarInactiveTintColor: '#6B7280',
              tabBarStyle: {
                height: 65,
                paddingBottom: 8,
                paddingTop: 8,
                backgroundColor: '#FFFFFF',
                borderTopWidth: 1,
                borderTopColor: '#E5E7EB',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 5,
              },
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
              },
              tabBarIconStyle: {
                fontSize: 28,
              },
            }}
          >
            <Tab.Screen
              name="Races"
              component={RacesScreenWrapper}
              options={{
                tabBarLabel: 'Races',
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 28 }}>🏁</Text>,
              }}
            />
            <Tab.Screen
              name="Courses"
              component={CoursesScreenWrapper}
              options={{
                tabBarLabel: 'Courses',
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 28 }}>🗺️</Text>,
              }}
            />
            <Tab.Screen
              name="Boat"
              component={BoatScreenWrapper}
              options={{
                tabBarLabel: 'Boat',
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 28 }}>⛵</Text>,
              }}
            />
            <Tab.Screen
              name="Venue"
              component={VenueScreenWrapper}
              options={{
                tabBarLabel: 'Venue',
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 28 }}>🌍</Text>,
              }}
            />
            <Tab.Screen
              name="More"
              component={MoreScreenWrapper}
              listeners={{
                tabPress: (e) => {
                  // Prevent default navigation
                  e.preventDefault();
                  // Show the modal instead
                  setIsMoreModalVisible(true);
                },
              }}
              options={{
                tabBarLabel: 'More',
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 28 }}>☰</Text>,
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </View>

      {/* More Menu Modal */}
      <Modal
        visible={isMoreModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsMoreModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsMoreModalVisible(false)}
        >
          <Pressable
            style={styles.modalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Close Button */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>More</Text>
              <TouchableOpacity
                onPress={() => setIsMoreModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* More Screen Content */}
            <MoreScreen userId="test-user" services={mockServices} />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
  },
  header: {
    width: '100%',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '400',
  },
});
