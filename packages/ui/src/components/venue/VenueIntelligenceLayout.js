import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { VenueMapView } from './VenueMapView';
import { VenueOverview } from './VenueOverview';
export const VenueIntelligenceLayout = ({ overview, map, sidebar, detailsSheet, controls, mapOverlay, rightPanel, }) => (<View style={styles.container}>
    <View style={styles.mapContainer}>
      <VenueMapView {...map}/>
      {mapOverlay && <View style={styles.mapOverlay}>{mapOverlay}</View>}
      {controls && <View style={styles.controls}>{controls}</View>}
    </View>
    <View style={styles.sidebar}>{sidebar}</View>
    <ScrollView contentContainerStyle={styles.overview} showsVerticalScrollIndicator={false}>
      <VenueOverview {...overview}/>
      {rightPanel}
    </ScrollView>
    {detailsSheet}
  </View>);
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F5F7FA',
    },
    mapContainer: {
        flex: 1,
    },
    controls: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    mapOverlay: {
        position: 'absolute',
        left: 16,
        bottom: 16,
    },
    sidebar: {
        width: 320,
    },
    overview: {
        width: 420,
        padding: 20,
        gap: 16,
    },
});
export default VenueIntelligenceLayout;
