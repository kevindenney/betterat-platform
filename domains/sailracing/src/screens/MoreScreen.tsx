import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { DomainDashboardProps } from '@betterat/domain-sdk';

interface MenuItemProps {
  icon: string;
  label: string;
  badge?: string | number;
  badgeType?: 'count' | 'new';
  onPress: () => void;
}

interface SectionHeaderProps {
  title: string;
  isFirst?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, badge, badgeType = 'count', onPress }) => {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {badge && (
          <View style={[
            styles.badge,
            badgeType === 'new' ? styles.badgeNew : styles.badgeCount
          ]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, isFirst = false }) => {
  return (
    <Text style={[styles.sectionHeader, isFirst && styles.sectionHeaderFirst]}>
      {title}
    </Text>
  );
};

export const MoreScreen: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  const handleComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature is under development!');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Optional Warning Banner */}
        {/* Uncomment when boat checking is implemented */}
        {/* <View style={styles.warningBanner}>
          <Text style={styles.warningText}>⚠️ Add a boat to unlock all features</Text>
        </View> */}

        {/* YOUR NETWORK Section */}
        <SectionHeader title="YOUR NETWORK" isFirst={true} />
        <View style={styles.section}>
          <MenuItem
            icon="🚢"
            label="Fleets"
            badge={3}
            onPress={handleComingSoon}
          />
          <MenuItem
            icon="⚓"
            label="Clubs"
            badge={2}
            onPress={handleComingSoon}
          />
          <MenuItem
            icon="👥"
            label="Crew"
            badge={8}
            onPress={handleComingSoon}
          />
        </View>

        {/* TOOLS & LEARNING Section */}
        <SectionHeader title="TOOLS & LEARNING" />
        <View style={styles.section}>
          <MenuItem
            icon="🎓"
            label="Coaching Marketplace"
            badge="NEW"
            badgeType="new"
            onPress={handleComingSoon}
          />
          <MenuItem
            icon="📚"
            label="Tuning Guides"
            onPress={handleComingSoon}
          />
          <MenuItem
            icon="🎯"
            label="Practice Plans"
            badge="NEW"
            badgeType="new"
            onPress={handleComingSoon}
          />
        </View>

        {/* SETTINGS Section */}
        <SectionHeader title="SETTINGS" />
        <View style={styles.section}>
          <MenuItem
            icon="👤"
            label="Profile"
            onPress={handleComingSoon}
          />
          <MenuItem
            icon="⚙️"
            label="Settings"
            onPress={handleComingSoon}
          />
          <MenuItem
            icon="📊"
            label="Analytics"
            onPress={handleComingSoon}
          />
          <MenuItem
            icon="ℹ️"
            label="About"
            onPress={handleComingSoon}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  warningBanner: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  warningText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#6B7280',
    paddingLeft: 16,
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionHeaderFirst: {
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCount: {
    backgroundColor: '#3B82F6',
  },
  badgeNew: {
    backgroundColor: '#F97316',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: '300',
  },
});
