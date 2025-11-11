import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar } from 'react-native';
import { registerDomain, getDomain } from '@betterat/core';
import testDomain from '@betterat/domains-test';
import type { PlatformServices } from '@betterat/domain-sdk';

// Mock platform services for testing
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
      create: async (data) => ({ id: '1', userId: 'test-user', domainId: 'test', activityTypeId: data.activityTypeId, metadata: data.metadata, createdAt: new Date(), updatedAt: new Date() }),
      update: async (id, data) => ({ id, userId: 'test-user', domainId: 'test', activityTypeId: 'test', metadata: data.metadata || {}, createdAt: new Date(), updatedAt: new Date() }),
      delete: async () => {},
    },
    metrics: {
      list: async () => [],
      record: async () => ({ id: '1', userId: 'test-user', domainId: 'test', metricId: 'test', value: 0, timestamp: new Date() }),
    },
    sessions: {
      list: async () => [],
      get: async () => null,
      create: async () => ({ id: '1', userId: 'test-user', domainId: 'test', agentId: 'test', messages: [], startedAt: new Date() }),
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
    navigate: () => console.log('Navigate'),
    goBack: () => console.log('Go back'),
    reset: () => console.log('Reset'),
  },
};

export default function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Register the test domain
    registerDomain(testDomain);
    console.log('✅ Test domain registered:', testDomain.meta.name);

    // Mark as loaded
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading BetterAt Platform...</Text>
      </SafeAreaView>
    );
  }

  // Get the registered domain
  const domain = getDomain('test');

  if (!domain) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>❌ Domain not found</Text>
      </SafeAreaView>
    );
  }

  // Get the Dashboard component from the domain
  const Dashboard = domain.components.Dashboard;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Platform Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🚀 BetterAt Platform</Text>
        <Text style={styles.subtitle}>Loaded: {domain.meta.name}</Text>
      </View>

      {/* Domain Dashboard */}
      <View style={styles.content}>
        <Dashboard
          userId="test-user"
          services={mockServices}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
    color: '#EF4444',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 28,
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
  },
});
