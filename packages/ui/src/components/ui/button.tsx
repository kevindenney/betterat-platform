// @ts-nocheck
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

export interface ButtonProps {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  isDisabled?: boolean;
  isLoading?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

const baseButtonStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    text: { color: '#FFFFFF' },
  },
  secondary: {
    container: { backgroundColor: '#E0ECFF', borderColor: '#2563EB' },
    text: { color: '#1D4ED8' },
  },
  outline: {
    container: { backgroundColor: 'transparent', borderColor: '#CBD5F5' },
    text: { color: '#1E293B' },
  },
};

export const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      isDisabled = false,
      isLoading = false,
      onPress,
      style,
      contentStyle,
    },
    ref
  ) => {
    const palette = baseButtonStyles[variant];
    const isInteractive = !isDisabled && !isLoading;

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          styles.buttonBase,
          palette.container,
          isDisabled && styles.buttonDisabled,
          style,
        ]}
        accessibilityRole="button"
        activeOpacity={0.8}
        disabled={!isInteractive}
        onPress={onPress}
      >
        <View style={[styles.content, contentStyle]}>
          {typeof children === 'string' ? (
            <Text style={[styles.textBase, palette.text]}>{children}</Text>
          ) : (
            children
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

export interface ButtonTextProps {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export const ButtonText: React.FC<ButtonTextProps> = ({ children, style }) => (
  <Text style={[styles.textBase, style]}>{children}</Text>
);

export interface ButtonIconProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const ButtonIcon: React.FC<ButtonIconProps> = ({ children, style }) => (
  <View style={[styles.iconWrapper, style]}>{children}</View>
);

export type buttonProps = ButtonProps;
export const button = Button;

const styles = StyleSheet.create({
  buttonBase: {
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  textBase: {
    fontSize: 15,
    fontWeight: '600',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
