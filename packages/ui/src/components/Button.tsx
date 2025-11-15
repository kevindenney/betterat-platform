// @ts-nocheck
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

export interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}) => {
  const buttonStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    disabled && styles.disabled,
    style,
  ].filter(Boolean);

  const textStyle = [
    styles.text,
    variant === 'primary' && styles.primaryText,
    variant === 'secondary' && styles.secondaryText,
    variant === 'outline' && styles.outlineText,
    disabled && styles.disabledText,
  ].filter(Boolean);

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.gray200,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  disabled: {
    backgroundColor: colors.gray300,
    opacity: 0.6,
  },
  text: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.gray900,
  },
  outlineText: {
    color: colors.primary,
  },
  disabledText: {
    color: colors.gray500,
  },
});
