import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function EventCardSkeleton() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, 400],
  });

  return (
    <View style={styles.card}>
      <View style={styles.shimmerContainer}>
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </View>

      {/* Event name */}
      <View style={[styles.skeleton, styles.eventName]} />

      {/* Date range */}
      <View style={[styles.skeleton, styles.dateRange]} />

      {/* Venue */}
      <View style={[styles.skeleton, styles.venue]} />

      {/* Info line (classes + entries) */}
      <View style={[styles.skeleton, styles.infoLine]} />

      {/* Countdown area */}
      <View style={styles.countdownArea}>
        <View style={[styles.skeleton, styles.countdownLabel]} />
        <View style={[styles.skeleton, styles.countdownValue]} />
      </View>

      {/* Checklist */}
      <View style={styles.checklist}>
        <View style={[styles.skeleton, styles.checklistTitle]} />
        <View style={[styles.skeleton, styles.checklistItem]} />
        <View style={[styles.skeleton, styles.checklistItem]} />
        <View style={[styles.skeleton, styles.checklistItem]} />
        <View style={[styles.skeleton, styles.checklistItem]} />
      </View>

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        <View style={[styles.skeleton, styles.actionButton]} />
        <View style={[styles.skeleton, styles.actionButton]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  skeleton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  eventName: {
    width: '70%',
    height: 24,
    marginBottom: 10,
  },
  dateRange: {
    width: '50%',
    height: 14,
    marginBottom: 8,
  },
  venue: {
    width: '65%',
    height: 14,
    marginBottom: 8,
  },
  infoLine: {
    width: '60%',
    height: 14,
    marginBottom: 16,
  },
  countdownArea: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
  },
  countdownLabel: {
    width: 100,
    height: 12,
    marginBottom: 8,
  },
  countdownValue: {
    width: 150,
    height: 32,
  },
  checklist: {
    marginBottom: 16,
  },
  checklistTitle: {
    width: 120,
    height: 12,
    marginBottom: 10,
  },
  checklistItem: {
    width: '90%',
    height: 16,
    marginBottom: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
  },
});
