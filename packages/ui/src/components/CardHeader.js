/**
 * CardHeader Component
 *
 * Header section for Card components with icon, title, and optional badge.
 * Works across all domains (yacht racing, nursing, drawing, etc.)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
export const CardHeader = ({ icon, title, badge, badgeColor = '#10B981', iconColor = '#64748B', style, }) => {
    return (<View style={[styles.container, style]}>
      <View style={styles.left}>
        {icon && (<Ionicons name={icon} size={20} color={iconColor} style={styles.icon}/>)}
        <Text style={styles.title}>{title}</Text>
      </View>

      {badge && (<View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>)}
    </View>);
};
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
});
export default CardHeader;
