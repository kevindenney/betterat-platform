import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const TimelineStrip = ({ events, currentTime = new Date() }) => {
    const meta = useMemo(() => {
        if (!events || events.length === 0) {
            return { nodes: [], nowPercent: null };
        }
        const parsed = events.map((event, index) => {
            const ts = event.timestamp ? Date.parse(event.timestamp) : NaN;
            const timestamp = Number.isNaN(ts) ? null : ts;
            return {
                ...event,
                timestamp,
                index,
            };
        });
        const timed = parsed.filter((event) => event.timestamp !== null);
        let useTemporalScale = timed.length >= 2;
        let minTs = 0;
        let maxTs = 0;
        if (useTemporalScale) {
            minTs = Math.min(...timed.map((event) => event.timestamp));
            maxTs = Math.max(...timed.map((event) => event.timestamp));
            if (minTs === maxTs) {
                useTemporalScale = false;
            }
        }
        const range = maxTs - minTs || 1;
        const nodes = parsed.map((event, index) => {
            const percent = useTemporalScale && event.timestamp !== null
                ? clamp((event.timestamp - minTs) / range)
                : events.length === 1
                    ? 0.5
                    : index / (events.length - 1);
            const timeLabel = event.timestamp
                ? new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : null;
            return {
                ...event,
                percent,
                timeLabel,
            };
        });
        const nowPercent = useTemporalScale
            ? clamp((currentTime.getTime() - minTs) / range)
            : null;
        return { nodes, nowPercent };
    }, [currentTime, events]);
    if (!meta.nodes.length) {
        return null;
    }
    const trackWidth = Math.max(meta.nodes.length * 180, 640);
    return (<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.trackContainer, { width: trackWidth }]} accessible accessibilityRole="summary">
        <View style={styles.trackLine}/>
        {meta.nowPercent !== null && (<View style={[styles.nowMarker, { left: `${meta.nowPercent * 100}%` }]}>
            <View style={styles.nowLine}/>
            <Text style={styles.nowLabel}>Now</Text>
          </View>)}
        {meta.nodes.map((event) => (<View key={event.id} style={[styles.node, { left: `${event.percent * 100}%` }]}>
            <View style={styles.dot}/>
            {event.timeLabel ? <Text style={styles.timeLabel}>{event.timeLabel}</Text> : null}
            <Text style={styles.nodeLabel}>{event.label}</Text>
            <Text style={styles.nodeSummary} numberOfLines={2}>{event.summary}</Text>
          </View>))}
      </View>
    </ScrollView>);
};
const styles = StyleSheet.create({
    scrollContent: {
        paddingVertical: 8,
    },
    trackContainer: {
        position: 'relative',
        height: 140,
        justifyContent: 'center',
    },
    trackLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        height: 2,
        backgroundColor: '#E2E8F0',
    },
    node: {
        position: 'absolute',
        transform: [{ translateX: -80 }],
        width: 160,
        alignItems: 'center',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4338CA',
        marginBottom: 8,
    },
    timeLabel: {
        fontSize: 12,
        color: '#475569',
        marginBottom: 4,
    },
    nodeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 2,
        textAlign: 'center',
    },
    nodeSummary: {
        fontSize: 12,
        color: '#475569',
        textAlign: 'center',
    },
    nowMarker: {
        position: 'absolute',
        top: 0,
        alignItems: 'center',
        transform: [{ translateX: -1 }],
    },
    nowLine: {
        width: 2,
        height: 80,
        backgroundColor: '#F97316',
    },
    nowLabel: {
        marginTop: 4,
        fontSize: 11,
        fontWeight: '700',
        color: '#F97316',
    },
});
