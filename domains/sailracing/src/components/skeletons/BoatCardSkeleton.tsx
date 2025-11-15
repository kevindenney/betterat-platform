import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function BoatCardSkeleton() {
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

      <View style={styles.content}>
        {/* Avatar on left */}
        <View style={[styles.skeleton, styles.avatar]} />

        {/* Text blocks on right */}
        <View style={styles.textContainer}>
          {/* Boat name */}
          <View style={[styles.skeleton, styles.boatName]} />

          {/* Class and sail number */}
          <View style={[styles.skeleton, styles.classLine]} />

          {/* Club */}
          <View style={[styles.skeleton, styles.clubLine]} />

          {/* Status row */}
          <View style={styles.statusRow}>
            <View style={[styles.skeleton, styles.statusBadge]} />
            <View style={[styles.skeleton, styles.performanceBadge]} />
          </View>
        </View>
      </View>

      {/* Action buttons area */}
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
    padding: 16,
    marginBottom: 12,
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
  content: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  boatName: {
    width: '70%',
    height: 20,
    marginBottom: 6,
  },
  classLine: {
    width: '50%',
    height: 14,
    marginBottom: 6,
  },
  clubLine: {
    width: '60%',
    height: 12,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    width: 60,
    height: 22,
    borderRadius: 11,
  },
  performanceBadge: {
    width: 80,
    height: 22,
    borderRadius: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 36,
    borderRadius: 18,
  },
});
