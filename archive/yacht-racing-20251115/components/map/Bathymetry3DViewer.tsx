import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { BoundingBox, GeoLocation } from '@/lib/types/advanced-map';

interface Bathymetry3DViewerProps {
  bounds: BoundingBox;
  venue: string;
  exaggeration: number;
  showContours: boolean;
  showSoundings: boolean;
  colorScheme: 'ocean' | 'bathymetric' | 'nautical';
  onDepthQuery?: (depth: number, location: GeoLocation) => void;
}

/**
 * Placeholder UI while the WebGL bathymetry renderer is being rebuilt.
 * The real implementation previously depended on React Three Fiber, which
 * breaks the Expo web bundler in this environment. Until the new renderer is
 * ready, we surface a lightweight callout so the rest of the map screen loads.
 */
export function Bathymetry3DViewer({ venue, colorScheme }: Bathymetry3DViewerProps) {
  const schemeCopy: Record<string, string> = {
    ocean: 'soft blues with depth-based luminance',
    bathymetric: 'traditional NOAA bathymetric palette',
    nautical: 'high-contrast racing palette',
  };

  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <ThemedText type="caption" style={styles.pillText}>Bathymetry preview</ThemedText>
      </View>
      <ThemedText type="title" style={styles.title}>
        Live depth mesh not available in this preview build
      </ThemedText>
      <ThemedText type="default" style={styles.body}>
        The 3D bathymetry renderer relies on React Three Fiber, which isn&rsquo;t supported in the
        current Expo web pipeline. Depth analytics for {venue || 'this venue'} are still fetched
        server-side, so tide windows and depth callouts remain accurate in other panels.
      </ThemedText>
      <View style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>Color scheme</ThemedText>
        <ThemedText type="default" style={styles.cardBody}>
          {schemeCopy[colorScheme] || 'custom palette'}
        </ThemedText>
      </View>
      <View style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>What&rsquo;s next</ThemedText>
        <ThemedText type="default" style={styles.cardBody}>
          We&rsquo;re porting the bathymetry mesh to a lightweight shader that works in Expo/React
          Native. You&rsquo;ll see contour slices, depth probes, and NOAA overlays as soon as that lands.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: {
    color: '#C7D2FE',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    color: '#CBD5F5',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1F2937',
  },
  cardTitle: {
    color: '#E0E7FF',
    marginBottom: 4,
  },
  cardBody: {
    color: '#A5B4FC',
    lineHeight: 18,
  },
});

export default Bathymetry3DViewer;
