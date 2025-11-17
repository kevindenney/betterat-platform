// @ts-nocheck
import React, { useMemo } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View, } from 'react-native';
const DOMAIN_META = {
    sailracing: {
        nowColor: '#22C55E',
        addLabel: 'Add Race',
        emptyHeadline: 'No races scheduled',
        emptyBody: 'Log your next regatta to unlock the full plan / act / analyze view.',
    },
    nursing: {
        nowColor: '#C026D3',
        addLabel: 'Add Case',
        emptyHeadline: 'No cases scheduled',
        emptyBody: 'Schedule your next shift or simulation to keep the timeline current.',
    },
};
const CARD_GAP = 16;
const TimelineStrip = ({ events, domain, selectedId, loading = false, onAdd, onSelect, }) => {
    const { width } = useWindowDimensions();
    const cardWidth = Platform.OS === 'web' ? 280 : Math.min(width * 0.8, 320);
    // Debug logging
    React.useEffect(() => {
        console.log('[TimelineStrip] render:', {
            eventsCount: events.length,
            loading,
            domain,
            firstEvent: events[0],
        });
    }, [events, loading, domain]);
    const content = useMemo(() => {
        if (loading) {
            return (<View style={styles.loadingRow}>
          <Text style={styles.loadingText}>Loading timeline…</Text>
        </View>);
        }
        if (events.length === 0) {
            const meta = DOMAIN_META[domain];
            return (<View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{meta.emptyHeadline}</Text>
          <Text style={styles.emptyBody}>{meta.emptyBody}</Text>
          <TouchableOpacity style={styles.addButton} onPress={onAdd}>
            <Text style={styles.addButtonText}>{meta.addLabel}</Text>
          </TouchableOpacity>
        </View>);
        }
        return (<FlatList horizontal showsHorizontalScrollIndicator={false} snapToInterval={cardWidth + CARD_GAP} decelerationRate="fast" contentContainerStyle={[
                styles.listContainer,
                Platform.OS !== 'web' && {
                    paddingHorizontal: (width - cardWidth) / 2,
                },
            ]} data={events} keyExtractor={(item) => item.id} renderItem={({ item }) => (<TouchableOpacity style={[
                    styles.card,
                    { width: cardWidth },
                    selectedId === item.id && styles.cardSelected,
                ]} onPress={() => onSelect(item.id)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDate}>{formatDate(item.start_time)}</Text>
            {item.location ? <Text style={styles.cardMeta}>{item.location}</Text> : null}
            {item.summary ? <Text style={styles.cardSummary}>{item.summary}</Text> : null}
          </TouchableOpacity>)} ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }}/>}/>);
    }, [events, selectedId, loading, width, cardWidth, domain, onAdd, onSelect]);
    return (<View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Timeline</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Text style={styles.addButtonText}>{DOMAIN_META[domain].addLabel}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.timelineContainer}>
        <View style={[styles.nowBar, { backgroundColor: DOMAIN_META[domain].nowColor }]}/>
        {content}
      </View>
    </View>);
};
const formatDate = (iso) => {
    const dt = new Date(iso);
    return dt.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};
const styles = StyleSheet.create({
    wrapper: {
        gap: 12,
        paddingVertical: 4,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0F172A',
    },
    addButton: {
        backgroundColor: '#1D4ED8',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    timelineContainer: {
        position: 'relative',
        paddingVertical: 12,
    },
    nowBar: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 3,
        left: '50%',
        transform: [{ translateX: -1.5 }],
        borderRadius: 3,
        zIndex: 1,
    },
    listContainer: {
        paddingVertical: 8,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 6,
    },
    cardSelected: {
        borderColor: '#1D4ED8',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    cardDate: {
        fontSize: 14,
        color: '#475569',
    },
    cardMeta: {
        fontSize: 13,
        color: '#94A3B8',
    },
    cardSummary: {
        fontSize: 14,
        color: '#475569',
    },
    loadingRow: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    loadingText: {
        color: '#94A3B8',
    },
    emptyState: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        gap: 8,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0F172A',
    },
    emptyBody: {
        fontSize: 14,
        color: '#475569',
        textAlign: 'center',
    },
});
export default TimelineStrip;
