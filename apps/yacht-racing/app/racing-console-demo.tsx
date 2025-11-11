/**
 * Racing Console Demo
 *
 * Demo page to test the new Racing Tactical Console
 * Access at: http://localhost:8081/racing-console-demo
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PreStartConsole } from '@betterat/ui/components/racing-console/PreStartConsole';
import { Colors, Typography, Spacing } from '@/constants/RacingDesignSystem';

export default function RacingConsoleDemo() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Racing Tactical Console Demo</Text>
        <Text style={styles.subtitle}>
          Pre-Start Console with AI Recommendations
        </Text>
      </View>

      <PreStartConsole
        startLineHeading={45}
        startLineLength={150}
        timeToStart={5}
        boatSpeed={6}
        courseHeading={50}
        boatLength={10}
        draft={2.5}
        onChipExpand={(chip) => {
          console.log('Chip expanded:', chip);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui.surface
  },

  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.primary.blue,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.blue
  },

  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.ui.surface,
    marginBottom: Spacing.xs
  },

  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.ui.surface,
    opacity: 0.9
  }
});
