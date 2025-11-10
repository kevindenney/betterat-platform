import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export interface CardProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style }) => {
  const cardStyle = [styles.card, style].filter(Boolean);

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
