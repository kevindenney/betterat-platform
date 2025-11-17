// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
const defaultTheme = {
    background: '#FFFBF5',
    border: '#E4D7C6',
    heading: '#3F372D',
    text: '#5E5549',
    accent: '#0061FF',
    pill: '#D3C4B2',
    peerBackground: '#F7F2EA',
};
export const StrategyCollaborationPanel = ({ heading, description, connectionLabel, connectionDescription, onConnect, collaborators, topics, theme, }) => {
    const appliedTheme = { ...defaultTheme, ...(theme || {}) };
    return (<View style={[styles.container, { backgroundColor: appliedTheme.background, borderColor: appliedTheme.border }]} accessibilityRole="summary">
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.heading, { color: appliedTheme.heading }]}>{heading}</Text>
          <Text style={[styles.description, { color: appliedTheme.text }]}>{description}</Text>
        </View>
        <TouchableOpacity onPress={onConnect} style={[styles.connectButton, { backgroundColor: appliedTheme.accent }]} accessibilityRole="button">
          <Text style={styles.connectLabel}>{connectionLabel}</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.connectionDescription, { color: appliedTheme.text }]}>{connectionDescription}</Text>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionEyebrow, { color: appliedTheme.text }]}>Collaboration roster</Text>
      </View>
      <View style={styles.collaboratorGrid}>
        {collaborators.map((collaborator, index) => (<View key={collaborator.id} style={[
                styles.collaboratorCard,
                {
                    borderColor: appliedTheme.pill,
                    marginRight: index % 2 === 0 ? 8 : 0,
                },
            ]}>
            <Text style={[styles.collaboratorName, { color: appliedTheme.heading }]}>{collaborator.name}</Text>
            <Text style={[styles.collaboratorSubtitle, { color: appliedTheme.text }]}>{collaborator.subtitle}</Text>
            {collaborator.planFocus ? (<Text style={[styles.collaboratorFocus, { color: appliedTheme.text }]}>Focus: {collaborator.planFocus}</Text>) : null}
            {collaborator.status ? (<View style={[styles.statusPill, { backgroundColor: appliedTheme.pill }]}>
                <Text style={styles.statusText}>{collaborator.status}</Text>
              </View>) : null}
          </View>))}
      </View>

      <Text style={[styles.sectionEyebrow, { color: appliedTheme.text, marginTop: 16 }]}>What teams are sharing</Text>
      <View style={styles.topicStack}>
        {topics.map((topic) => (<View key={topic.id} style={[styles.topicCard, { borderColor: appliedTheme.border }]}>
            <View style={styles.topicHeader}>
              <Text style={[styles.topicTitle, { color: appliedTheme.heading }]}>{topic.title}</Text>
              {topic.tags?.length ? (<View style={styles.tagRow}>
                  {topic.tags.map((tag) => (<View key={`${topic.id}-${tag}`} style={[styles.tagPill, { borderColor: appliedTheme.pill }]}>
                      <Text style={[styles.tagText, { color: appliedTheme.text }]}>{tag}</Text>
                    </View>))}
                </View>) : null}
            </View>
            <Text style={[styles.topicDetail, { color: appliedTheme.text }]}>{topic.detail}</Text>
            <View style={styles.topicComparisons}>
              <View style={styles.planColumn}>
                <Text style={[styles.planLabel, { color: appliedTheme.text }]}>{topic.ourPlanLabel ?? 'Your plan'}</Text>
                <Text style={[styles.planValue, { color: appliedTheme.heading }]}>{topic.ourPlan}</Text>
              </View>
              <View style={[styles.planColumn, styles.peerColumn, { backgroundColor: appliedTheme.peerBackground }]}>
                <Text style={[styles.planLabel, { color: appliedTheme.text }]}>{topic.peerPlanLabel}</Text>
                <Text style={[styles.planValue, { color: appliedTheme.heading }]}>{topic.peerPlan}</Text>
                <Text style={[styles.peerSource, { color: appliedTheme.text }]}>{topic.peerSource}</Text>
              </View>
            </View>
            {topic.callout ? <Text style={[styles.callout, { color: appliedTheme.text }]}>{topic.callout}</Text> : null}
          </View>))}
      </View>
    </View>);
};
const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerCopy: {
        flex: 1,
        marginRight: 16,
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    connectButton: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 999,
    },
    connectLabel: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 13,
    },
    connectionDescription: {
        fontSize: 13,
        marginTop: 10,
    },
    sectionHeader: {
        marginTop: 16,
    },
    sectionEyebrow: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    collaboratorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    collaboratorCard: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        width: '48%',
        marginBottom: 12,
    },
    collaboratorName: {
        fontSize: 15,
        fontWeight: '600',
    },
    collaboratorSubtitle: {
        fontSize: 13,
        marginTop: 4,
    },
    collaboratorFocus: {
        fontSize: 12,
        marginTop: 6,
    },
    statusPill: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        marginTop: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#3F372D',
    },
    topicStack: {
        marginTop: 16,
    },
    topicCard: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
    },
    topicHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 8,
    },
    tagPill: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginLeft: 6,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
    },
    topicDetail: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    topicComparisons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    planColumn: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E4D7C6',
        marginRight: 12,
    },
    peerColumn: {
        borderStyle: 'dashed',
        marginRight: 0,
    },
    planLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    planValue: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
    },
    peerSource: {
        marginTop: 8,
        fontSize: 12,
    },
    callout: {
        fontSize: 13,
        borderLeftWidth: 2,
        paddingLeft: 10,
    },
});
