// @ts-nocheck
// Temporary placeholder for @betterat/ui/components/landing/HeroPhones
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export type HeroPhonesProps = {};

const cards = [
  {
    label: 'Tactics',
    title: 'Course Brief',
    location: 'Porto Cervo',
    copy: 'Structured pre-race notes keep the team aligned on wind bends, tide, and expected traffic.',
    accent: '#002b45',
  },
  {
    label: 'Culture',
    title: 'Crew Routine',
    location: 'Barcelona',
    copy: 'Editorial-style checklists ensure every sailor knows the briefing, wardrobe, and timing cadence.',
    accent: '#003e63',
  },
  {
    label: 'Field Notes',
    title: 'Travel Guides',
    location: 'Sydney',
    copy: 'City-inspired tiles highlight new venues and keep stakeholders curious about the calendar ahead.',
    accent: '#0d5c8c',
  },
];

const serifFont = Platform.select({
  ios: 'Iowan Old Style',
  android: 'serif',
  default: 'Georgia',
});

const sansFont = Platform.select({
  ios: 'Helvetica Neue',
  android: 'sans-serif-light',
  default: 'System',
});

export const HeroPhones: React.FC<HeroPhonesProps> = () => {
  return (
    <View style={styles.section}>
      <View style={styles.wrapper}>
        <View style={styles.leadColumn}>
          <Text style={styles.label}>BETTERAT BRIEFING</Text>
          <Text style={styles.headline}>Editorial calm for world-class race control</Text>
          <Text style={styles.deck}>
            Borrowing from Monocle's restrained palette and typography, we deliver strategy moments that feel
            curated instead of chaotic.
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>INSIGHT</Text>
            <View style={styles.metaDivider} />
            <Text style={styles.metaItem}>12 MIN REVIEW</Text>
            <View style={styles.metaDivider} />
            <Text style={styles.metaItem}>FILM STILL</Text>
          </View>
        </View>

        <View style={styles.cardColumn}>
          {cards.map((card, index) => (
            <View
              key={card.title}
              style={[styles.card, index !== cards.length - 1 && styles.cardSpacing, { borderColor: card.accent }]}
            >
              <Text style={styles.cardLabel}>{card.label.toUpperCase()}</Text>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardLocation}>{card.location}</Text>
              <Text style={styles.cardCopy}>{card.copy}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f7f3eb',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  wrapper: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  leadColumn: {
    flex: 1,
    paddingRight: 16,
  },
  label: {
    fontFamily: sansFont,
    fontSize: 12,
    letterSpacing: 3,
    color: '#000',
    marginBottom: 12,
  },
  headline: {
    fontFamily: serifFont,
    fontSize: 42,
    lineHeight: 50,
    color: '#111',
    marginBottom: 20,
  },
  deck: {
    fontFamily: sansFont,
    fontSize: 18,
    lineHeight: 28,
    color: '#3f3b36',
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    fontFamily: sansFont,
    fontSize: 12,
    letterSpacing: 2,
    color: '#6b6258',
    marginRight: 12,
  },
  metaDivider: {
    width: 18,
    height: 1,
    backgroundColor: '#cfc7bb',
    marginRight: 12,
  },
  cardColumn: {
    flex: 1,
    paddingLeft: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardSpacing: {
    marginBottom: 16,
  },
  cardLabel: {
    fontFamily: sansFont,
    fontSize: 11,
    letterSpacing: 2,
    color: '#7a746c',
    marginBottom: 6,
  },
  cardTitle: {
    fontFamily: serifFont,
    fontSize: 26,
    color: '#0d0c0a',
    marginBottom: 4,
  },
  cardLocation: {
    fontFamily: sansFont,
    fontSize: 13,
    color: '#b08c42',
    marginBottom: 12,
  },
  cardCopy: {
    fontFamily: sansFont,
    fontSize: 15,
    lineHeight: 24,
    color: '#3a342c',
  },
});
