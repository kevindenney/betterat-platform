// @ts-nocheck
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';

export type InputType = 'text' | 'email' | 'password' | 'number';

export interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  type?: InputType;
  style?: ViewStyle;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  type = 'text',
  style,
  disabled = false,
}) => {
  const getKeyboardType = (): KeyboardTypeOptions => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'number':
        return 'numeric';
      default:
        return 'default';
    }
  };

  const containerStyle = [styles.container, style].filter(Boolean);

  const inputStyle = [
    styles.input,
    error && styles.inputError,
    disabled && styles.inputDisabled,
  ].filter(Boolean);

  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={inputStyle}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray400}
        secureTextEntry={type === 'password'}
        keyboardType={getKeyboardType()}
        autoCapitalize={type === 'email' ? 'none' : 'sentences'}
        editable={!disabled}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.base,
    color: colors.gray900,
    backgroundColor: colors.white,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: colors.gray100,
    color: colors.gray500,
  },
  errorText: {
    fontSize: fontSizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
