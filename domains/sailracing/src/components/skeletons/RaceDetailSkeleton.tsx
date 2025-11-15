import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const SHIMMER_DURATION = 1500;
const SHIMMER_TRANSLATE = 220;

const SECTION_PLACEHOLDERS = [
  {
    id: 'ai-strategy',
    lines: [
      { width: '60%', height: 22 },
      { width: '100%', height: 14 },
      { width: '95%', height: 14 },
      { width: '90%', height: 14 },
      { width: '40%', height: 36 },
    ],
  },
  {
    id: 'conditions',
    lines: [
      { width: '50%', height: 20 },
      { width: '100%', height: 14 },
      { width: '100%', height: 14 },
      { width: '80%', height: 14 },
    ],
  },
  {
    id: 'crew',
    lines: [
      { width: '55%', height: 20 },
      { width: '80%', height: 14 },
      { width: '70%', height: 14 },
      { width: '60%', height: 14 },
    ],
  },
];

const RaceDetailSkeleton: React.FC = () => {
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
    <View style={styles.container}>
      <View style={[styles.card, styles.overviewCard]}>
        <ShimmerBlock shimmerStyle={shimmerStyle} style={styles.overviewTitle} />
        <ShimmerBlock shimmerStyle={shimmerStyle} style={styles.overviewSubtitle} />
        <ShimmerBlock shimmerStyle={shimmerStyle} style={styles.overviewSubtitle} />
        <View style={styles.overviewBadges}>
          <ShimmerBlock shimmerStyle={shimmerStyle} style={styles.overviewBadge} />
          <ShimmerBlock shimmerStyle={shimmerStyle} style={styles.overviewBadge} />
        </View>
        <ShimmerBlock shimmerStyle={shimmerStyle} style={styles.overviewButton} />
      </View>

      {SECTION_PLACEHOLDERS.map((section) => (
        <View key={section.id} style={styles.card}>
          {section.lines.map((line, index) => (
            <ShimmerBlock
              key={`${section.id}-${index}`}
              shimmerStyle={shimmerStyle}
              style={[styles.sectionLine, line]}
            />
          ))}
        </View>
      ))}
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

export default RaceDetailSkeleton;

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    gap: theme.spacing.md,
  },
  overviewCard: {
    gap: theme.spacing.md,
  },
  overviewTitle: {
    width: '70%',
    height: 28,
  },
  overviewSubtitle: {
    width: '60%',
    height: 16,
  },
  overviewBadges: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  overviewBadge: {
    flex: 1,
    height: 36,
    borderRadius: theme.borderRadius.large,
  },
  overviewButton: {
    width: '100%',
    height: 44,
    borderRadius: theme.borderRadius.large,
  },
  sectionLine: {
    borderRadius: theme.borderRadius.medium,
  },
  block: {
    backgroundColor: theme.colors.gray200,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    left: -120,
    right: -120,
  },
});
