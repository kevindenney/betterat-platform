// Temporary placeholder for @betterat/ui/components/landing/HeroPhones
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type HeroPhonesProps = {};

export const HeroPhones: React.FC<HeroPhonesProps> = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Yacht Racing</Text>
        <Text style={styles.subtitle}>Navigate to Victory</Text>
        <Text style={styles.description}>
          Professional race strategy and performance analysis for competitive sailing
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 800,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 28,
  },
});

