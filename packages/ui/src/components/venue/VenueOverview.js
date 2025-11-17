import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VenueIntelSummary } from './VenueIntelSummary';
import { TravelResourceChips } from './TravelResourceChips';
export const VenueOverview = ({ hero, stats = [], checklist = [], chips, children }) => (<View style={styles.container}>
    <VenueIntelSummary hero={hero} stats={stats} checklist={checklist} resourceChips={chips ? <TravelResourceChips {...chips}/> : undefined}/>
    {children ? <View style={styles.sectionSpacing}>{children}</View> : null}
  </View>);
const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    sectionSpacing: {
        marginTop: 12,
    },
});
export default VenueOverview;
