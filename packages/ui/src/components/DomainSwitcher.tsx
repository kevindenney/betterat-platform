import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ViewStyle,
  Platform,
} from 'react-native';
import { Modal } from './Modal';
import { DomainCard, DomainMeta } from './DomainCard';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';

export interface DomainSwitcherProps {
  activeDomains: string[];
  currentDomainId: string | null;
  onSwitch: (domainId: string) => void;
  domainMetadata?: Record<string, DomainMeta>;
  style?: ViewStyle;
}

export const DomainSwitcher: React.FC<DomainSwitcherProps> = ({
  activeDomains,
  currentDomainId,
  onSwitch,
  domainMetadata = {},
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const currentDomain = currentDomainId
    ? domainMetadata[currentDomainId]
    : null;

  const handleDomainPress = (domainId: string) => {
    onSwitch(domainId);
    setModalVisible(false);
  };

  const getDomainMeta = (domainId: string): DomainMeta => {
    return (
      domainMetadata[domainId] || {
        id: domainId,
        name: domainId,
        icon: '📦',
        description: 'No description available',
      }
    );
  };

  const renderDomainCard = ({ item }: { item: string }) => {
    const domain = getDomainMeta(item);
    const isActive = item === currentDomainId;

    return (
      <View style={styles.cardWrapper}>
        <DomainCard
          domain={domain}
          isActive={isActive}
          onPress={() => handleDomainPress(item)}
        />
      </View>
    );
  };

  return (
    <View style={style}>
      {/* Trigger Button */}
      <Pressable
        style={({ pressed }) => [
          styles.triggerButton,
          pressed && styles.triggerPressed,
        ]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.triggerContent}>
          {currentDomain ? (
            <>
              <View
                style={[
                  styles.triggerIcon,
                  { backgroundColor: currentDomain.color || colors.primary },
                ]}
              >
                <Text style={styles.triggerIconText}>
                  {currentDomain.icon || '📦'}
                </Text>
              </View>
              <Text style={styles.triggerText} numberOfLines={1}>
                {currentDomain.name}
              </Text>
            </>
          ) : (
            <Text style={styles.triggerTextEmpty}>Select Domain</Text>
          )}
          <Text style={styles.chevron}>▼</Text>
        </View>
      </Pressable>

      {/* Modal with Domain List */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Switch Domain"
      >
        <FlatList
          data={activeDomains}
          renderItem={renderDomainCard}
          keyExtractor={(item) => item}
          numColumns={1}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No active domains</Text>
            </View>
          }
        />
      </Modal>
    </View>
  );
};

const baseTriggerStyle = {
  backgroundColor: colors.white,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.gray300,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
};

const styles = StyleSheet.create({
  triggerButton: Platform.OS === 'web'
    ? {
        ...baseTriggerStyle,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' as any,
      }
    : {
        ...baseTriggerStyle,
        shadowColor: colors.black,
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      },
  triggerPressed: {
    opacity: 0.8,
    backgroundColor: colors.gray50,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  triggerIconText: {
    fontSize: fontSizes.lg,
  },
  triggerText: {
    flex: 1,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.gray900,
  },
  triggerTextEmpty: {
    flex: 1,
    fontSize: fontSizes.base,
    color: colors.gray500,
  },
  chevron: {
    fontSize: fontSizes.sm,
    color: colors.gray500,
    marginLeft: spacing.sm,
  },
  gridContainer: {
    paddingVertical: spacing.sm,
  },
  cardWrapper: {
    marginBottom: spacing.md,
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSizes.base,
    color: colors.gray500,
    textAlign: 'center',
  },
});
