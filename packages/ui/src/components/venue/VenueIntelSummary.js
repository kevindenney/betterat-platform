// @ts-nocheck
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@betterat/ui/components/themed-text';
import { VenueHeroCard } from './VenueHeroCard';
export function VenueIntelSummary({ hero, stats = [], checklist = [], headerEyebrow, headerTitle, headerSubtitle, resourceChips, footer, }) {
    const hasStats = stats.length > 0;
    const hasChecklist = checklist.some(section => section.items.length > 0);
    return (<View style={styles.container}>
      {(headerEyebrow || headerTitle || headerSubtitle) && (<View style={styles.header}>
          {headerEyebrow && <ThemedText style={styles.eyebrow}>{headerEyebrow}</ThemedText>}
          {headerTitle && <ThemedText style={styles.headerTitle}>{headerTitle}</ThemedText>}
          {headerSubtitle && (<ThemedText style={styles.headerSubtitle}>{headerSubtitle}</ThemedText>)}
        </View>)}

      <VenueHeroCard {...hero}/>

      {resourceChips && <View style={styles.sectionSpacing}>{resourceChips}</View>}

      {hasStats && (<View style={styles.sectionSpacing}>
          <ThemedText style={styles.sectionTitle}>Quick Intel</ThemedText>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (<View key={stat.id} style={styles.statCard}>
                <View style={styles.statHeader}>
                  {stat.icon && <ThemedText style={styles.statIcon}>{stat.icon}</ThemedText>}
                  <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
                </View>
                <ThemedText style={[styles.statValue, stat.accentColor && { color: stat.accentColor }]}>
                  {stat.value}
                </ThemedText>
                {stat.detail && (<ThemedText style={styles.statDetail}>{stat.detail}</ThemedText>)}
                {stat.trend && (<ThemedText style={styles.trendLabel}>
                    {stat.trend === 'up' && '↗️ Building'}
                    {stat.trend === 'down' && '↘️ Easing'}
                    {stat.trend === 'flat' && '→ Steady'}
                  </ThemedText>)}
              </View>))}
          </View>
        </View>)}

      {hasChecklist && (<View style={styles.sectionSpacing}>
          <ThemedText style={styles.sectionTitle}>Travel Checklist</ThemedText>
          <View style={styles.checklistContainer}>
            {checklist.map((section) => (<View key={section.id} style={styles.checklistSection}>
                <ThemedText style={styles.checklistTitle}>{section.title}</ThemedText>
                {section.items.map((item) => (<View key={item.id} style={styles.checklistItem}>
                    <View style={styles.checklistLeft}>
                      <View style={[styles.statusDot, getStatusStyle(item.status)]}/>
                      <View>
                        <ThemedText style={styles.checklistLabel}>{item.label}</ThemedText>
                        {item.description && (<ThemedText style={styles.checklistDescription}>
                            {item.description}
                          </ThemedText>)}
                      </View>
                    </View>
                    {item.icon && <ThemedText style={styles.checklistIcon}>{item.icon}</ThemedText>}
                  </View>))}
              </View>))}
          </View>
        </View>)}

      {footer && <View style={styles.sectionSpacing}>{footer}</View>}
    </View>);
}
const getStatusStyle = (status) => {
    switch (status) {
        case 'ready':
            return { backgroundColor: '#10b981' };
        case 'warning':
            return { backgroundColor: '#f97316' };
        case 'todo':
        default:
            return { backgroundColor: '#d1d5db' };
    }
};
const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxWidth: 440,
        gap: 12,
    },
    header: {
        backgroundColor: 'rgba(255,255,255,0.85)',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        gap: 6,
    },
    eyebrow: {
        fontSize: 12,
        letterSpacing: 1,
        fontWeight: '700',
        color: '#6b7280',
        textTransform: 'uppercase',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#4b5563',
    },
    sectionSpacing: {
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        flexBasis: '47%',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 14,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        gap: 4,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statIcon: {
        fontSize: 14,
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    statDetail: {
        fontSize: 12,
        color: '#4b5563',
    },
    trendLabel: {
        fontSize: 12,
        color: '#6b7280',
    },
    checklistContainer: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        gap: 16,
    },
    checklistSection: {
        gap: 10,
    },
    checklistTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1f2937',
        textTransform: 'uppercase',
    },
    checklistItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    checklistLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        flex: 1,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 6,
    },
    checklistLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    checklistDescription: {
        fontSize: 13,
        color: '#4b5563',
        marginTop: 2,
    },
    checklistIcon: {
        fontSize: 16,
    },
});
export default VenueIntelSummary;
