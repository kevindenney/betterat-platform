// @ts-nocheck
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface SegmentTabOption {
  label: string;
  value: string;
  badge?: string;
}

interface SegmentTabsProps {
  options: SegmentTabOption[];
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

const SegmentTabs: React.FC<SegmentTabsProps> = ({ options, value, onChange, style }) => {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.9}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
            {option.badge ? (
              <Text style={[styles.badge, isActive && styles.badgeActive]}>{option.badge}</Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    padding: 4,
    alignSelf: 'center',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    color: '#475569',
    fontWeight: '600',
  },
  labelActive: {
    color: '#111827',
  },
  badge: {
    marginLeft: 6,
    fontSize: 12,
    color: '#475569',
  },
  badgeActive: {
    color: '#1D4ED8',
  },
});

export default SegmentTabs;
