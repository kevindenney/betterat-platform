import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar } from 'react-native';
import { registerDomain, getDomain } from '@betterat/core';
import testDomain from '@betterat/domains-test';
import yachtRacingDomain from '@betterat/domains-yachtracing';
import type { PlatformServices } from '@betterat/domain-sdk';

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

export default function App() {
  const [loaded, setLoaded] = useState(false);

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

  const Dashboard = domain.components.Dashboard;

  if (!Dashboard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>❌ Domain has no Dashboard</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Platform Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🚀 BetterAt Platform</Text>
        <Text style={styles.subtitle}>Day 3 Prototype</Text>
      </View>

      <View style={styles.content}>
        <Dashboard userId="test-user" services={mockServices} />
      </View>
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
});
