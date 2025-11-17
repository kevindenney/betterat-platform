import React, { useMemo, useState, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DomainDashboardProps } from '@betterat/domain-sdk';
import { MapControls, type MapLayers } from '../components/venue/MapControls';
import { type VenueIntelStat, type VenueIntelChecklistSection } from '@betterat/ui';
import { VenueIntelligenceDisplay } from '../components/venue/VenueIntelligenceDisplay';
import { VenueDetailsSheet } from '../components/venue/VenueDetailsSheet';
import { NetworkSidebar } from '../components/venue/NetworkSidebar';
import type { NetworkPlace } from '../services/SailingNetworkService';
import theme from '../theme';

const FEATURED_VENUE = {
  id: 'hong-kong-victoria-harbour',
  name: 'Victoria Harbour',
  country: 'Hong Kong',
  region: 'Central',
  venue_type: 'harbor',
  coordinates_lat: 22.287,
  coordinates_lng: 114.191,
};

const DEFAULT_LAYERS: MapLayers = {
  yachtClubs: true,
  sailmakers: true,
  riggers: false,
  coaches: true,
  chandlery: false,
  clothing: false,
  marinas: true,
  repair: false,
  engines: false,
};

const SAMPLE_NETWORK: NetworkPlace[] = [
  {
    id: 'rhkcy',
    name: 'Royal Hong Kong Yacht Club',
    country: 'Hong Kong',
    location: { name: 'Hong Kong', region: 'Causeway Bay' },
    coordinates: { lat: 22.285, lng: 114.192 },
    type: 'yacht_club',
    isSaved: true,
    notes: 'Club HQ · Chase boats + docks',
  },
  {
    id: 'north-sails-hk',
    name: 'North Sails Loft',
    country: 'Hong Kong',
    location: { name: 'Hong Kong', region: 'Kwai Chung' },
    coordinates: { lat: 22.36, lng: 114.13 },
    type: 'sailmaker',
    isSaved: true,
    notes: 'Main loft for 52 programme',
  },
  {
    id: 'simpson-marine',
    name: 'Simpson Marine Service Dock',
    country: 'Hong Kong',
    location: { name: 'Hong Kong', region: 'Aberdeen' },
    coordinates: { lat: 22.247, lng: 114.159 },
    type: 'repair',
    notes: 'Rigging + composite repairs',
  },
];

export const VenueScreen: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  const [layers, setLayers] = useState<MapLayers>(DEFAULT_LAYERS);
  const [selectedVenue, setSelectedVenue] = useState<typeof FEATURED_VENUE | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isThreeDEnabled, setIsThreeDEnabled] = useState(false);
  const [areLayersVisible, setAreLayersVisible] = useState(true);
  const [showOnlySavedVenues, setShowOnlySavedVenues] = useState(false);
  const savedVenueIds = useMemo(() => new Set<string>([FEATURED_VENUE.id]), []);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [savedPlaces, setSavedPlaces] = useState<NetworkPlace[]>(SAMPLE_NETWORK.slice(0, 2));

  const savedIds = useMemo(
    () => new Set(savedPlaces.map((place) => place.id)),
    [savedPlaces],
  );

  const searchResults = useMemo(() => {
    if (!sidebarSearchQuery.trim()) {
      return [];
    }
    const query = sidebarSearchQuery.toLowerCase();
    return SAMPLE_NETWORK.filter((place) => {
      const region = place.location.region
        ? place.location.region.toLowerCase()
        : '';
      return (
        place.name.toLowerCase().includes(query) ||
        place.country?.toLowerCase().includes(query) ||
        region.includes(query)
      );
    }).map((place) => ({
      ...place,
      isSaved: savedIds.has(place.id),
    }));
  }, [sidebarSearchQuery, savedIds]);

  const quickStats = useMemo<VenueIntelStat[]>(() => [
    { id: 'wind', label: 'Wind', value: '12-15 kts NE', detail: 'Gusts to 18 kts this afternoon', icon: '🌬️' },
    { id: 'tide', label: 'Tide', value: 'Flood +1.3 m', detail: 'Slack at 14:20 local', icon: '🌊' },
    { id: 'traffic', label: 'Traffic', value: 'Ferry peak', detail: 'Peak harbour ferries 17:00', icon: '⛴️' },
  ], []);

  const checklist = useMemo<VenueIntelChecklistSection[]>(() => [
    {
      id: 'arrival',
      title: 'Arrival Prep',
      items: [
        { id: 'permits', label: 'Port paperwork', status: 'ready', description: 'Harbour entry documents uploaded', icon: '📄' },
        { id: 'towing', label: 'Tow + chase boat', status: 'warning', description: 'Confirm RHKYC chase boat for training day', icon: '🚤' },
        { id: 'services', label: 'Rig + sail support', status: 'todo', description: 'Lock sail loft + spare rig inspection', icon: '🧰' },
      ],
    },
  ], []);

  const handleToggleLayer = useCallback((layer: keyof MapLayers) => {
    setLayers(prev => ({
      ...prev,
      [layer]: !prev[layer],
    }));
    services.analytics.trackEvent('venue_layer_toggle', { userId, layer });
  }, [services.analytics, userId]);

  const handleSaveVenue = useCallback(() => {
    services.analytics.trackEvent('venue_saved', { userId, venueId: FEATURED_VENUE.id });
  }, [services.analytics, userId]);

  const overviewFooter = useMemo(() => (
    <View style={styles.footerCard}>
      <Text style={styles.footerTitle}>Mapped services</Text>
      <Text style={styles.footerCopy}>
        Next step: embed the shared map + checklist interactions here so nursing can reuse the same API surface.
      </Text>
    </View>
  ), []);

  const overviewProps = useMemo(() => ({
    hero: {
      venueName: FEATURED_VENUE.name,
      country: FEATURED_VENUE.country,
      region: FEATURED_VENUE.region,
      distanceLabel: 'Club HQ · 0 km',
      windSummary: '9-15 kts gradient breeze with tidal relief under Hong Kong Island.',
      travelTip: 'Cache your foul-weather shops and riggers before the typhoon window closes.',
      onSave: handleSaveVenue,
      isSaved: true,
      latitude: FEATURED_VENUE.coordinates_lat,
      longitude: FEATURED_VENUE.coordinates_lng,
    },
    stats: quickStats,
    checklist,
    chips: { layers, onToggleLayer: handleToggleLayer },
    children: overviewFooter,
  }), [checklist, handleToggleLayer, handleSaveVenue, layers, overviewFooter, quickStats]);

  const sidebarNode = (
    <NetworkSidebar
      searchQuery={sidebarSearchQuery}
      onSearchQueryChange={setSidebarSearchQuery}
      searchResults={searchResults}
      savedPlaces={savedPlaces.map((place) => ({ ...place, isSaved: true }))}
      isSearching={false}
      isLoadingSaved={false}
      isCollapsed={isSidebarCollapsed}
      onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      onPlacePress={(place: NetworkPlace) => {
        const venue = {
          id: place.id,
          name: place.name,
          country: place.country ?? '',
          region: place.location.region ?? '',
          venue_type: place.type,
          coordinates_lat: place.coordinates?.lat ?? FEATURED_VENUE.coordinates_lat,
          coordinates_lng: place.coordinates?.lng ?? FEATURED_VENUE.coordinates_lng,
        };
        setSelectedVenue(venue as typeof FEATURED_VENUE);
      }}
      onSaveToggle={(place, nextSaved) => {
        setSavedPlaces((prev) => {
          if (nextSaved) {
            if (prev.find((item) => item.id === place.id)) {
              return prev;
            }
            return [...prev, { ...place, isSaved: true }];
          }
          return prev.filter((item) => item.id !== place.id);
        });
      }}
    />
  );

  const controlsNode = (
    <MapControls
      onToggle3D={() => setIsThreeDEnabled(prev => !prev)}
      onToggleLayers={() => setAreLayersVisible(prev => !prev)}
      onToggleSavedVenues={() => setShowOnlySavedVenues(prev => !prev)}
      is3DEnabled={isThreeDEnabled}
      areLayersVisible={areLayersVisible}
      showOnlySavedVenues={showOnlySavedVenues}
      savedVenuesCount={savedVenueIds.size}
      layers={layers}
      onLayersChange={setLayers}
    />
  );

  const detailsSheetNode = (
    <VenueDetailsSheet
      venue={selectedVenue}
      onClose={() => setSelectedVenue(null)}
    />
  );

  return (
    <View style={styles.container}>
      <VenueIntelligenceDisplay
        overview={overviewProps}
        map={{
          currentVenue: FEATURED_VENUE,
          selectedVenue,
          onMarkerPress: (venue: any) => setSelectedVenue(venue),
          showAllVenues: true,
          showOnlySavedVenues,
          savedVenueIds,
          mapLayers: layers,
        }}
        sidebar={sidebarNode}
        controls={controlsNode}
        detailsSheet={detailsSheetNode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  footerCard: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    gap: 6,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  footerCopy: {
    fontSize: 13,
    color: '#0F172A',
  },
});
