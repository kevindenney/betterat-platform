import React from 'react';
import { ScrollView, View, Text, StyleSheet, Image } from 'react-native';

const INSPIRATION_FEED = [
  {
    title: 'Hong Kong Street Markets',
    description: 'Night palette · reflective surfaces · compressed perspective',
    location: 'Mong Kok · Reference pack #14',
  },
  {
    title: 'Museum Lighting Study',
    description: 'Rembrandt lighting · high contrast portraits',
    location: 'Louvre · Gallery wing 2B',
  },
  {
    title: 'Botanical Textures',
    description: 'Macro look at petals, dew, and translucency',
    location: 'Singapore Gardens · Cloud Forest',
  },
];

const InspirationScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Inspiration</Text>
      <Text style={styles.title}>Reference locations & visual research</Text>
      <Text style={styles.subtitle}>
        Mirroring the "Venues" tab for sailors—curate location intel, lighting references, and journey
        plans for on-location sketching.
      </Text>

      {INSPIRATION_FEED.map((entry) => (
        <View key={entry.title} style={styles.card}>
          <View style={styles.thumbnail}>
            <Text style={styles.thumbnailEmoji}>📷</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{entry.title}</Text>
            <Text style={styles.cardCopy}>{entry.description}</Text>
            <Text style={styles.cardMeta}>{entry.location}</Text>
          </View>
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Studio scouting</Text>
        <Text style={styles.sectionCopy}>
          Coming soon: map overlays, booking links, and shared inspiration boards synced with Apple
          Maps + Street View.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1,
    color: '#2563EB',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 15,
    color: '#334155',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    overflow: 'hidden',
  },
  thumbnail: {
    width: 80,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailEmoji: {
    fontSize: 32,
  },
  cardBody: {
    flex: 1,
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  cardCopy: {
    fontSize: 14,
    color: '#1E293B',
  },
  cardMeta: {
    fontSize: 13,
    color: '#475569',
  },
  section: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
  },
  sectionTitle: {
    color: '#1D4ED8',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionCopy: {
    color: '#1E3A8A',
    fontSize: 14,
  },
});

export default InspirationScreen;
