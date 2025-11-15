import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const SHIMMER_DURATION = 1500;
const SHIMMER_TRANSLATE = 180;

const RaceCardSkeleton: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: SHIMMER_DURATION,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const shimmerStyle = {
    transform: [
      {
        translateX: shimmerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-SHIMMER_TRANSLATE, SHIMMER_TRANSLATE],
        }),
      },
    ],
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <ShimmerBlock shimmerStyle={shimmerStyle} style={styles.dateBlock} />
        <ShimmerBlock shimmerStyle={shimmerStyle} style={styles.badgeBlock} />
      </View>
      <ShimmerBlock shimmerStyle={shimmerStyle} style={styles.raceNameBlock} />
      <ShimmerBlock shimmerStyle={shimmerStyle} style={styles.venueBlock} />
      <View style={styles.weatherRow}>
        <ShimmerBlock shimmerStyle={shimmerStyle} style={styles.weatherBlock} />
        <ShimmerBlock shimmerStyle={shimmerStyle} style={styles.weatherBlock} />
      </View>
      <ShimmerBlock shimmerStyle={shimmerStyle} style={styles.statusBlock} />
      <ShimmerBlock shimmerStyle={shimmerStyle} style={styles.buttonBlock} />
    </View>
  );
};

interface ShimmerBlockProps {
  style?: any;
  shimmerStyle: any;
}

const ShimmerBlock: React.FC<ShimmerBlockProps> = ({ style, shimmerStyle }) => (
  <View style={[styles.block, style]}>
    <AnimatedLinearGradient
      colors={[
        theme.colors.gray200,
        theme.colors.gray100,
        theme.colors.gray200,
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.shimmerOverlay, shimmerStyle]}
    />
  </View>
);

export default RaceCardSkeleton;

const CARD_WIDTH = 280;
const CARD_HEIGHT = 180;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.xl,
    justifyContent: 'space-between',
    backgroundColor: theme.colors.gray100,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    ...theme.shadows.small,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  weatherRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  block: {
    backgroundColor: theme.colors.gray200,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    left: -100,
    right: -100,
  },
  dateBlock: {
    width: 80,
    height: 12,
  },
  badgeBlock: {
    width: 60,
    height: 16,
    borderRadius: theme.borderRadius.small,
  },
  raceNameBlock: {
    width: '90%',
    height: 28,
    marginBottom: theme.spacing.sm,
  },
  venueBlock: {
    width: '70%',
    height: 14,
    marginBottom: theme.spacing.md,
  },
  weatherBlock: {
    flex: 1,
    height: 14,
  },
  statusBlock: {
    width: 140,
    height: 20,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.large,
  },
  buttonBlock: {
    width: '100%',
    height: 36,
    borderRadius: theme.borderRadius.large,
  },
});
