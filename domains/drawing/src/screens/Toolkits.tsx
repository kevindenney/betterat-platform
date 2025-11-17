import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

const KITS = [
  {
    name: 'Figure Drawing Kit',
    items: 'Graphite 2H-6B · Newsprint · Kneaded eraser',
    status: 'Pinned for tonight',
  },
  {
    name: 'Gouache Travel Kit',
    items: 'Primary triad · 2 brushes · Cold-press block',
    status: 'Packed for weekend studio',
  },
  {
    name: 'Digital Sketch Rig',
    items: 'iPad Pro · Procreate brushes · Reference board',
    status: 'Synced with cloud',
  },
];

const ToolkitsScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Toolkits</Text>
      <Text style={styles.title}>Manage brushes, surfaces, and palettes</Text>
      <Text style={styles.subtitle}>
        Drawing’s version of the "Boats" tab—configure multiple setups, track readiness, and pin the
        kit that fuels the next session.
      </Text>

      {KITS.map((kit) => (
        <View key={kit.name} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{kit.name}</Text>
            <Text style={styles.status}>{kit.status}</Text>
          </View>
          <Text style={styles.items}>{kit.items}</Text>
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coming soon</Text>
        <Text style={styles.sectionCopy}>
          Inventory syncing, kit lending, AI-generated supply lists, and “ready room” alerts.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#8B5CF6',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  status: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
  },
  items: {
    fontSize: 14,
    color: '#4B5563',
  },
  section: {
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    padding: 16,
  },
  sectionTitle: {
    color: '#3730A3',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionCopy: {
    color: '#4338CA',
    fontSize: 14,
  },
});

export default ToolkitsScreen;
