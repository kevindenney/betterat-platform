import React from 'react';
import { View, StyleSheet } from 'react-native';
import { type VenueHeroCardProps } from './VenueHeroCard';
import { VenueIntelSummary, type VenueIntelStat, type VenueIntelChecklistSection } from './VenueIntelSummary';
import { TravelResourceChipsProps, TravelResourceChips } from './TravelResourceChips';

export interface VenueOverviewProps {
  hero: VenueHeroCardProps;
  stats?: VenueIntelStat[];
  checklist?: VenueIntelChecklistSection[];
  chips?: TravelResourceChipsProps;
  children?: React.ReactNode;
}

export const VenueOverview = ({ hero, stats = [], checklist = [], chips, children }: VenueOverviewProps) => (
  <View style={styles.container}>
    <VenueIntelSummary
      hero={hero}
      stats={stats}
      checklist={checklist}
      resourceChips={chips ? <TravelResourceChips {...chips} /> : undefined}
    />
    {children ? <View style={styles.sectionSpacing}>{children}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionSpacing: {
    marginTop: 12,
  },
});

export default VenueOverview;
