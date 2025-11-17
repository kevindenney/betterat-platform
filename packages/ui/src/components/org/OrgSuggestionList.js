import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
export const OrgSuggestionList = ({ title = 'Upcoming from your organization', suggestions, onApply, }) => {
    if (!suggestions.length)
        return null;
    return (<View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {suggestions.map((suggestion) => (<View key={suggestion.id} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.org}>{suggestion.orgName}</Text>
            <Text style={styles.cardTitle}>{suggestion.title}</Text>
            <Text style={styles.meta}>{suggestion.dateLabel}</Text>
            <Text style={styles.meta}>{suggestion.metadata}</Text>
          </View>
          <TouchableOpacity style={styles.applyButton} onPress={() => onApply(suggestion)}>
            <Text style={styles.applyLabel}>Use</Text>
          </TouchableOpacity>
        </View>))}
    </View>);
};
const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
        gap: 12,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 4,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    org: {
        fontSize: 12,
        textTransform: 'uppercase',
        color: '#64748B',
        fontWeight: '600',
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
        marginTop: 2,
    },
    meta: {
        fontSize: 13,
        color: '#475569',
    },
    applyButton: {
        backgroundColor: '#1D4ED8',
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 18,
    },
    applyLabel: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
