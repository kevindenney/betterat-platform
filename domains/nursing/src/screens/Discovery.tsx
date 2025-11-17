import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DomainDashboardProps } from '@betterat/domain-sdk';
import {
  type VenueIntelStat,
  type VenueIntelChecklistSection,
} from '@betterat/ui/components/venue/VenueIntelSummary';
import { type TravelResourceChipsProps } from '@betterat/ui/components/venue/TravelResourceChips';
import { VenueIntelligenceLayout } from '@betterat/ui/components/venue/VenueIntelligenceLayout';
import { MapControls, type MapLayers } from '@betterat/ui/components/venue/MapControls';
import theme from '../theme';

const HUB = {
  id: 'betterat-clinical-floating-hospital',
  name: 'Floating Hospital Hub',
  country: 'BetterAt Health',
  region: 'Telemetry / ICU overlay',
  venue_type: 'hub',
  coordinates_lat: 22.281,
  coordinates_lng: 114.164,
};

const DEFAULT_LAYERS: MapLayers = {
  yachtClubs: true,
  sailmakers: true,
  riggers: true,
  coaches: true,
  chandlery: false,
  clothing: false,
  marinas: false,
  repair: true,
  engines: false,
};

const CHIP_OVERRIDES: TravelResourceChipsProps['metaOverrides'] = {
  yachtClubs: { label: 'Partner hospitals', icon: 'medkit', color: '#2563eb' },
  sailmakers: { label: 'ICU surge pods', icon: 'pulse-outline', color: '#f97316' },
  riggers: { label: 'Respiratory teams', icon: 'medkit-outline', color: '#8b5cf6' },
  coaches: { label: 'Clinical coaches', icon: 'person-circle-outline', color: '#10b981' },
  chandlery: { label: 'Supply depots', icon: 'cube-outline', color: '#f43f5e' },
  clothing: { label: 'PPE lockers', icon: 'shirt-outline', color: '#fb923c' },
  marinas: { label: 'Transit links', icon: 'bus-outline', color: '#0ea5e9' },
  repair: { label: 'Biomed coverage', icon: 'construct-outline', color: '#ec4899' },
  engines: { label: 'IT uptime', icon: 'hardware-chip-outline', color: '#64748b' },
};

type CareVenue = {
  id: string;
  name: string;
  country: string;
  region: string;
  venue_type: string;
  coordinates_lat: number;
  coordinates_lng: number;
  readiness: 'ready' | 'watch' | 'issue';
  detail: string;
};

const CARE_NETWORK: CareVenue[] = [
  {
    ...HUB,
    readiness: 'ready',
    detail: 'Telemetry anchor · Full AI routing online',
  },
  {
    id: 'betterat-heart-transit-center',
    name: 'Heart Transit Center',
    country: 'BetterAt Health',
    region: 'Cath recovery · Transit yard',
    venue_type: 'transit',
    coordinates_lat: 22.302,
    coordinates_lng: 114.176,
    readiness: 'watch',
    detail: 'Cath overflow · 2 crews en route',
  },
  {
    id: 'betterat-icu-surge-pod',
    name: 'ICU Surge Pod Charlie',
    country: 'BetterAt Health',
    region: 'Quay 7 · Rapid response dock',
    venue_type: 'surge',
    coordinates_lat: 22.2905,
    coordinates_lng: 114.162,
    readiness: 'issue',
    detail: 'PPE cache swap pending · Vent checks running',
  },
];

const DiscoveryScreen: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  const [layers, setLayers] = useState<MapLayers>(DEFAULT_LAYERS);
  const [selectedVenue, setSelectedVenue] = useState<CareVenue | null>(CARE_NETWORK[0]);
  const [isThreeDEnabled, setIsThreeDEnabled] = useState(false);
  const [areLayersVisible, setAreLayersVisible] = useState(true);
  const [showOnlySaved, setShowOnlySaved] = useState(false);

  const savedVenueIds = useMemo(
    () => new Set<string>(['betterat-clinical-floating-hospital', 'betterat-icu-surge-pod']),
    [],
  );

  const stats = useMemo<VenueIntelStat[]>(() => [
    { id: 'capacity', label: 'Bed capacity', value: '118 beds', detail: '64 telemetry · 24 step-down · 30 ICU', icon: '🛏️' },
    { id: 'acuity', label: 'Acuity', value: 'Level 3.1', detail: '⬆️ +0.4 vs national baseline', icon: '📈' },
    { id: 'transfers', label: 'Transfers', value: '8 today', detail: 'Mainly cath-lab overflow', icon: '🚑' },
  ], []);

  const checklist = useMemo<VenueIntelChecklistSection[]>(() => [
    {
      id: 'handoff',
      title: 'Handoff readiness',
      items: [
        { id: 'admitting', label: 'Admitting criteria', status: 'ready', description: 'Telemetry + cath recovery slots synced', icon: '📋' },
        { id: 'escalation', label: 'Rapid response routing', status: 'warning', description: 'Escalate respiratory alerts to ICU surge pod', icon: '⚠️' },
        { id: 'supply', label: 'Supply caches', status: 'todo', description: 'Restock PPE locker C + crash-cart swap', icon: '📦' },
      ],
    },
  ], []);

  const handleToggleLayer = useCallback((layer: keyof MapLayers) => {
    setLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
    services.analytics.trackEvent('nursing_discovery_layer_toggle', { userId, layer });
  }, [services.analytics, userId]);

  const handleSaveHub = useCallback(() => {
    services.analytics.trackEvent('nursing_discovery_save_hub', { userId, hubId: HUB.id });
    setShowOnlySaved(false);
  }, [services.analytics, userId]);

  const overviewFooter = useMemo(() => (
    <View style={styles.footerCard}>
      <Text style={styles.footerTitle}>Next up</Text>
      <Text style={styles.footerCopy}>
        Venue intel now powers the same shared surface as yacht racing—clinics embed once and keep their palette.
      </Text>
    </View>
  ), []);

  const overviewProps = useMemo(() => ({
    hero: {
      venueName: HUB.name,
      country: HUB.country,
      region: HUB.region,
      distanceLabel: 'Network · 0 km',
      windSummary: 'Telemetry staffing balanced with ICU surge. Transit routes clear.',
      travelTip: 'Cache partner contact trees + transfer playbooks before shift launch.',
      onSave: handleSaveHub,
      isSaved: true,
      latitude: HUB.coordinates_lat,
      longitude: HUB.coordinates_lng,
    },
    stats,
    checklist,
    chips: { layers, onToggleLayer: handleToggleLayer, metaOverrides: CHIP_OVERRIDES },
    children: overviewFooter,
  }), [checklist, handleSaveHub, handleToggleLayer, layers, overviewFooter, stats]);

  const sidebar = (
    <ScrollView style={styles.sidebar} contentContainerStyle={styles.sidebarContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sidebarTitle}>Care network</Text>
      <Text style={styles.sidebarCopy}>Tap a facility to pin routing + staffing overlays.</Text>
      <TouchableOpacity
        style={[styles.toggleButton, showOnlySaved && styles.toggleButtonActive]}
        onPress={() => setShowOnlySaved((prev) => !prev)}
      >
        <Text style={[styles.toggleButtonText, showOnlySaved && styles.toggleButtonTextActive]}>
          {showOnlySaved ? 'Showing saved coverage' : 'Saved coverage'}
        </Text>
      </TouchableOpacity>
      {CARE_NETWORK.filter((venue) => !showOnlySaved || savedVenueIds.has(venue.id)).map((venue) => (
        <TouchableOpacity
          key={venue.id}
          style={[styles.facilityCard, selectedVenue?.id === venue.id && styles.facilityCardActive]}
          onPress={() => setSelectedVenue(venue)}
        >
          <View style={styles.facilityHeader}>
            <Text style={styles.facilityName}>{venue.name}</Text>
            <Text
              style={[
                styles.facilityBadge,
                venue.readiness === 'ready'
                  ? styles.badgeReady
                  : venue.readiness === 'watch'
                    ? styles.badgeWatch
                    : styles.badgeIssue,
              ]}
            >
              {venue.readiness === 'ready' ? 'Ready' : venue.readiness === 'watch' ? 'Watch' : 'Issue'}
            </Text>
          </View>
          <Text style={styles.facilityRegion}>{venue.region}</Text>
          <Text style={styles.facilityDetail}>{venue.detail}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const controls = (
    <MapControls
      onToggle3D={() => setIsThreeDEnabled((prev) => !prev)}
      onToggleLayers={() => setAreLayersVisible((prev) => !prev)}
      onSearchNearby={() => {}}
      onSettings={() => {}}
      onToggleSavedVenues={() => setShowOnlySaved((prev) => !prev)}
      is3DEnabled={isThreeDEnabled}
      areLayersVisible={areLayersVisible}
      showOnlySavedVenues={showOnlySaved}
      savedVenuesCount={savedVenueIds.size}
      layers={layers}
      onLayersChange={setLayers}
    />
  );

  const detailsSheet = selectedVenue ? (
    <View style={styles.detailSheet}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>{selectedVenue.name}</Text>
        <Text style={styles.detailRegion}>{selectedVenue.region}</Text>
      </View>
      <Text style={styles.detailBody}>{selectedVenue.detail}</Text>
      <View style={styles.detailFooter}>
        <Text style={styles.detailFooterText}>Next huddle in 12 min · EMS sync live</Text>
      </View>
    </View>
  ) : null;

  const mapOverlay = (
    <View style={styles.mapOverlay}>
      <Text style={styles.mapOverlayTitle}>Clinical overlay</Text>
      <Text style={styles.mapOverlayCopy}>Routing + surge pods mirror racing intel controls.</Text>
    </View>
  );

  return (
    <VenueIntelligenceLayout
      overview={overviewProps}
      map={{
        currentVenue: HUB,
        selectedVenue,
        onMarkerPress: (venue: any) => setSelectedVenue(venue as CareVenue),
        showAllVenues: true,
        showOnlySavedVenues: showOnlySaved,
        savedVenueIds,
        mapLayers: layers,
      }}
      sidebar={sidebar}
      controls={controls}
      detailsSheet={detailsSheet}
      mapOverlay={mapOverlay}
      rightPanel={null}
    />
  );
};

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
  },
  sidebarContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sidebarCopy: {
    fontSize: 13,
    color: '#475569',
  },
  toggleButton: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  facilityCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: theme.spacing.md,
    backgroundColor: '#fff',
    gap: 4,
  },
  facilityCardActive: {
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  facilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  facilityName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  facilityBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeReady: { color: '#15803D' },
  badgeWatch: { color: '#B45309' },
  badgeIssue: { color: '#B91C1C' },
  facilityRegion: {
    fontSize: 12,
    color: '#475569',
  },
  facilityDetail: {
    fontSize: 12,
    color: '#0F172A',
  },
  footerCard: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  detailSheet: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 320,
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: theme.spacing.lg,
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    gap: 8,
  },
  detailHeader: {
    gap: 4,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailRegion: {
    fontSize: 13,
    color: '#475569',
  },
  detailBody: {
    fontSize: 13,
    color: '#0F172A',
  },
  detailFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  detailFooterText: {
    fontSize: 12,
    color: '#475569',
  },
  mapOverlay: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.85)',
    maxWidth: 260,
  },
  mapOverlayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  mapOverlayCopy: {
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 4,
  },
});

export default DiscoveryScreen;
