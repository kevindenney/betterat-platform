// @ts-nocheck
import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Pressable,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  title,
  style,
}) => {
  const contentStyle = [styles.content, style].filter(Boolean);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={contentStyle}>
          {/* Header */}
          <View style={styles.header}>
            {title && <Text style={styles.title}>{title}</Text>}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.body}>{children}</View>
        </View>
      </View>
    </RNModal>
  );
};

const baseContentStyle = {
  backgroundColor: colors.white,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  maxHeight: '90%' as const,
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
    opacity: 0.5,
  },
  content: Platform.OS === 'web'
    ? {
        ...baseContentStyle,
        boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)' as any,
      }
    : {
        ...baseContentStyle,
        shadowColor: colors.black,
        shadowOffset: {
          width: 0,
          height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
      },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.gray900,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  closeButtonText: {
    fontSize: fontSizes.xl,
    color: colors.gray600,
    lineHeight: 24,
  },
  body: {
    padding: spacing.lg,
  },
});
