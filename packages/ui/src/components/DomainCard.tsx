// @ts-nocheck
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';

export interface DomainMeta {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  color?: string;
  version?: string;
}

export interface DomainCardProps {
  domain: DomainMeta;
  isActive: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const DomainCard: React.FC<DomainCardProps> = ({
  domain,
  isActive,
  onPress,
  style,
}) => {
  const baseCardStyle = Platform.OS === 'web' ? styles.cardWeb : styles.cardNative;
  const cardStyle = [
    baseCardStyle,
    isActive && styles.activeCard,
    style,
  ].filter(Boolean);

  const iconBackgroundStyle = [
    styles.iconContainer,
    { backgroundColor: domain.color || colors.primary },
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        cardStyle,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {/* Icon */}
        <View style={iconBackgroundStyle}>
          <Text style={styles.icon}>{domain.icon || '📦'}</Text>
        </View>

        {/* Text content */}
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {domain.name}
          </Text>
          {domain.description && (
            <Text style={styles.description} numberOfLines={2}>
              {domain.description}
            </Text>
          )}
        </View>

        {/* Active indicator */}
        {isActive && (
          <View style={styles.activeIndicator}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const baseCardStyle = {
  backgroundColor: colors.white,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: colors.gray200,
  padding: spacing.md,
};

const styles = StyleSheet.create({
  cardWeb: {
    ...baseCardStyle,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' as any,
  },
  cardNative: {
    ...baseCardStyle,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeCard: {
    borderColor: colors.primary,
    backgroundColor: colors.gray50,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: fontSizes.xxl,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSizes.sm,
    color: colors.gray600,
    lineHeight: 18,
  },
  activeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  checkmark: {
    color: colors.white,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
  },
});
