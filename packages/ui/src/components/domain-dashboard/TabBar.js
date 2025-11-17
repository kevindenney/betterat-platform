/**
 * TabBar - A shared tab navigation component for domain dashboards
 *
 * Provides a consistent Orient → Execute → Share → Reflect loop across domains
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
const palette = {
    background: '#F7F3EB',
    card: '#FFFFFF',
    border: '#DED3C2',
    text: '#1F1810',
    muted: '#6D6357',
    primary: '#8C5D2A',
    primaryLight: '#F1E5D4',
};
const sansFont = Platform.select({
    ios: 'Helvetica Neue',
    android: 'sans-serif-light',
    default: 'System',
});
export const DEFAULT_TAB_DEFINITIONS = [
    { key: 'gather', label: 'Orient', description: 'Prep + align' },
    { key: 'create', label: 'Execute', description: 'Do the work' },
    { key: 'share', label: 'Share', description: 'Broadcast outcomes' },
    { key: 'reflect', label: 'Reflect', description: 'Capture learnings' },
];
export const TabBar = ({ activeTab, onTabChange, style, tabs, }) => {
    const tabConfig = tabs ?? DEFAULT_TAB_DEFINITIONS;
    return (<View style={[styles.container, style]}>
      <View style={styles.tabRow}>
        {tabConfig.map((tab) => {
            const isActive = activeTab === tab.key;
            return (<TouchableOpacity key={tab.key} style={[styles.tab, isActive && styles.tabActive]} onPress={() => onTabChange(tab.key)} activeOpacity={0.7}>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {tab.description ? (<Text style={[
                        styles.tabDescription,
                        isActive && styles.tabDescriptionActive,
                    ]}>
                  {tab.description}
                </Text>) : null}
            </TouchableOpacity>);
        })}
      </View>
    </View>);
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: palette.background,
        borderBottomWidth: 1,
        borderBottomColor: palette.border,
    },
    tabRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
    },
    tab: {
        paddingVertical: 16,
        paddingHorizontal: 18,
        marginRight: 10,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: palette.primary,
    },
    tabText: {
        fontFamily: sansFont,
        fontSize: 13,
        letterSpacing: 1,
        color: palette.muted,
        textTransform: 'uppercase',
    },
    tabTextActive: {
        color: palette.primary,
        fontWeight: '600',
    },
    tabDescription: {
        fontFamily: sansFont,
        fontSize: 11,
        color: palette.muted,
        marginTop: 4,
    },
    tabDescriptionActive: {
        color: palette.text,
    },
});
export default TabBar;
