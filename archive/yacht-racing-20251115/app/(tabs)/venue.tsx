/**
 * Venue Intelligence - Apple Maps-Style Interface
 * Full-screen map with collapsible sidebar and floating controls
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@betterat/ui/components/themed-text';
import { ThemedView } from '@betterat/ui/components/themed-view';
import { useVenueIntelligence } from '@betterat/core/hooks/useVenueIntelligence';
import { useAuth } from '@betterat/core/providers/AuthProvider';
import { venueDetectionService } from '@/services/location/VenueDetectionService';
import { VenueIntelligenceLayout } from '@betterat/ui/components/venue/VenueIntelligenceLayout';
import { MapControls, MapLayers } from '@betterat/ui/components/venue/MapControls';
import { VenueDetailsSheet } from '@betterat/ui/components/venue/VenueDetailsSheet';
import { NetworkSidebar, type NetworkSidebarPlace } from '@betterat/ui/components/venue/NetworkSidebar';
import {
  type VenueIntelStat,
  type VenueIntelChecklistSection,
  type VenueIntelChecklistItem,
} from '@betterat/ui/components/venue/VenueIntelSummary';
import { VenueIntelligenceAgent } from '@/services/agents/VenueIntelligenceAgent';
import { SailingNetworkService, type NetworkPlace, type ServiceType } from '@/services/SailingNetworkService';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';

interface Venue {
  id: string;
  name: string;
  country: string;
  region: string;
  venue_type: string;
  coordinates_lat: number;
  coordinates_lng: number;
}

type VenueDetectionResult = {
  success: boolean;
  venueId?: string;
  venueName?: string;
  distance?: number;
  confidence?: number;
  coordinates?: { lat: number; lng: number };
  detectionMethod?: string;
  message?: string;
  alternatives?: { venueId: string; name: string; distance?: number }[];
};

export default function VenueIntelligenceScreen() {
  const { user } = useAuth();
  const { currentVenue: rawCurrentVenue, isDetecting, initializeDetection, setVenueManually } = useVenueIntelligence();
  // Transform SailingVenue to Venue type for compatibility
  const currentVenue = rawCurrentVenue ? {
    id: rawCurrentVenue.id,
    name: rawCurrentVenue.name,
    country: rawCurrentVenue.country,
    region: rawCurrentVenue.region,
    venue_type: rawCurrentVenue.venueType,
    coordinates_lat: rawCurrentVenue.coordinates[1],
    coordinates_lng: rawCurrentVenue.coordinates[0],
  } : null;


  // UI State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedVenueForSheet, setSelectedVenueForSheet] = useState<Venue | null>(null);
  const [isThreeDEnabled, setIsThreeDEnabled] = useState(false);
  const [areLayersVisible, setAreLayersVisible] = useState(true);
  const [showOnlySavedVenues, setShowOnlySavedVenues] = useState(false);
  const [mapLayers, setMapLayers] = useState<MapLayers>({
    yachtClubs: true,
    sailmakers: false,
    riggers: false,
    coaches: false,
    chandlery: false,
    clothing: false,
    marinas: false,
    repair: false,
    engines: false,
  });
  const [sidebarSavedPlaces, setSidebarSavedPlaces] = useState<NetworkSidebarPlace[]>([]);
  const [sidebarSearchResults, setSidebarSearchResults] = useState<NetworkSidebarPlace[]>([]);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [isSidebarSearching, setIsSidebarSearching] = useState(false);
  const [isSidebarLoadingSaved, setIsSidebarLoadingSaved] = useState(false);
  const sidebarSavedIds = useMemo(
    () => new Set(sidebarSavedPlaces.map((place) => place.id)),
    [sidebarSavedPlaces],
  );
  // AI Venue Detection State
  const [isDetectingVenue, setIsDetectingVenue] = useState(false);
  const [aiVenueResult, setAiVenueResult] = useState<VenueDetectionResult | null>(null);
  const [showVenueConfirmModal, setShowVenueConfirmModal] = useState(false);

  // AI Venue Analysis State
  const [loadingVenueAnalysis, setLoadingVenueAnalysis] = useState(false);
  const [venueAnalysis, setVenueAnalysis] = useState<any>(null);
  const [showVenueAnalysisModal, setShowVenueAnalysisModal] = useState(false);
  const [analysisCacheInfo, setAnalysisCacheInfo] = useState<{
    fromCache: boolean;
    cacheAge?: string;
    tokensUsed?: number;
  } | null>(null);


  // Fallback GPS detection without AI (uses Supabase RPC)
  const detectVenueWithoutAI = async (latitude: number, longitude: number) => {
    try {
      // Try PostGIS function first
      let { data: venues, error } = await supabase.rpc('venues_within_radius', {
        lat: latitude,
        lng: longitude,
        radius_km: 50,
      });

      // Fallback to bounding box if RPC not available
      if (error && (error as any)?.code?.startsWith?.('PGRST2')) {
        const radiusKm = 50;
        const latDelta = radiusKm / 111;
        const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

        const fallback = await supabase.rpc('venues_within_bbox', {
          min_lon: longitude - lngDelta,
          min_lat: latitude - latDelta,
          max_lon: longitude + lngDelta,
          max_lat: latitude + latDelta,
        });
        venues = fallback.data as any[] | null;
        error = fallback.error as any;
      }

      if (error) throw error;

      if (!venues || venues.length === 0) {
        return {
          success: false,
          message: `No sailing venues found within 50km of your location`,
        };
      }

      // Get the closest venue
      const closest = venues[0];
      const distanceKm = closest.distance_km;
      const confidence = Math.max(0.1, Math.min(1.0, 1 - (distanceKm / 50)));

      return {
        success: true,
        venueId: closest.id,
        venueName: closest.name,
        distance: distanceKm,
        confidence,
        coordinates: {
          lat: closest.coordinates.coordinates[1],
          lng: closest.coordinates.coordinates[0],
        },
        alternatives: venues.slice(1, 4).map((v: any) => ({
          venueId: v.id,
          name: v.name,
          distance: v.distance_km,
        })),
      };
    } catch (error: any) {

      return {
        success: false,
        message: error.message,
      };
    }
  };

  // Handle AI venue detection with fallback
  const handleAIVenueDetection = async () => {
    try {
      setIsDetectingVenue(true);
      setAiVenueResult(null); // Clear previous result

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsDetectingVenue(false);
        Alert.alert(
          'Permission Required',
          'Location access is needed to detect your sailing venue. Please enable location permissions in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Try AI detection first
      let venueData: VenueDetectionResult | null = null;
      let usedFallback = false;

      try {
        const agent = new VenueIntelligenceAgent();
        const agentResult = await agent.switchVenueByGPS({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });


        if (agentResult.success && agentResult.toolResults?.detect_venue_from_gps) {
          venueData = agentResult.toolResults.detect_venue_from_gps;
        } else {
          // AI failed, use fallback

          usedFallback = true;
          venueData = await detectVenueWithoutAI(location.coords.latitude, location.coords.longitude);
        }
      } catch (aiError: any) {
        // AI error, use fallback

        usedFallback = true;
        venueData = await detectVenueWithoutAI(location.coords.latitude, location.coords.longitude);
      }

      setIsDetectingVenue(false);

      // Check if detection found a venue
      if (venueData?.success && venueData.venueId) {
        if (usedFallback) {
          venueData.detectionMethod = 'GPS Fallback';
        }
        setAiVenueResult(venueData);
        setShowVenueConfirmModal(true);
      } else {
        // No venue found
        Alert.alert(
          'No Venue Found',
          venueData?.message || 'No sailing venues found within 50km of your location. Try manual selection or move closer to a registered venue.',
          [
            { text: 'Manual Select', onPress: handleManualSelect },
            { text: 'OK', style: 'cancel' }
          ]
        );
      }
    } catch (error: any) {
      setIsDetectingVenue(false);

      Alert.alert(
        'Detection Error',
        error.message || 'An unexpected error occurred while detecting your venue.',
        [
          { text: 'Manual Select', onPress: handleManualSelect },
          { text: 'OK', style: 'cancel' }
        ]
      );
    }
  };

  // Confirm AI detected venue
  const handleConfirmVenue = async () => {
    if (!aiVenueResult?.venueId) {

      return;
    }

    try {
      const success = await setVenueManually(aiVenueResult.venueId);
      setShowVenueConfirmModal(false);

      if (success) {
        Alert.alert(
          'Venue Confirmed',
          `Successfully switched to ${aiVenueResult.venueName || 'selected venue'}`
        );
      } else {
        Alert.alert(
          'Switch Failed',
          'Could not switch to the detected venue. Please try manual selection.'
        );
      }
    } catch (error: any) {

      Alert.alert(
        'Error',
        error.message || 'Failed to confirm venue selection'
      );
    }
  };

  // Manual venue selection fallback
  const handleManualSelect = () => {
    setShowVenueConfirmModal(false);
    Alert.alert('Manual Selection', 'Please select a venue from the map or sidebar.');
  };

  const toSidebarPlace = useCallback((place: NetworkPlace): NetworkSidebarPlace => ({
    id: place.id,
    name: place.name,
    country: place.country,
    location: place.location,
    coordinates: place.coordinates,
    type: place.type,
    isSaved: place.isSaved,
    isHomeVenue: place.isHomeVenue,
    notes: place.notes,
  }), []);

  const refreshSavedNetwork = useCallback(async () => {
    if (!user?.id) {
      setSidebarSavedPlaces([]);
      setIsSidebarLoadingSaved(false);
      return;
    }

    setIsSidebarLoadingSaved(true);
    try {
      const network = await SailingNetworkService.getMyNetwork();
      setSidebarSavedPlaces(network.map(toSidebarPlace));
    } catch (error) {
      console.error('[VenueTab] Failed to load saved network:', error);
      setSidebarSavedPlaces([]);
    } finally {
      setIsSidebarLoadingSaved(false);
    }
  }, [toSidebarPlace, user?.id]);

  const handleSidebarSaveToggle = useCallback(async (place: NetworkSidebarPlace, nextSaved: boolean) => {
    try {
      if (nextSaved) {
        await SailingNetworkService.saveToNetwork(
          place.id,
          (place.type as ServiceType) || 'venue',
          {
            name: place.location?.name || place.name,
            region: place.location?.region || place.country || 'Unknown region',
          },
        );
      } else {
        await SailingNetworkService.removeFromNetwork(place.id);
      }

      await refreshSavedNetwork();
      setSidebarSearchResults((prev) =>
        prev.map((result) =>
          result.id === place.id ? { ...result, isSaved: nextSaved } : result,
        ),
      );
    } catch (error: any) {
      console.error('[VenueTab] Failed to toggle saved state:', error);
      Alert.alert(
        'Network update failed',
        error?.message || 'Unable to update your sailing network. Please try again.',
      );
    }
  }, [refreshSavedNetwork]);

  useEffect(() => {
    if (!sidebarSearchQuery.trim()) {
      setSidebarSearchResults([]);
      setIsSidebarSearching(false);
      return;
    }

    let isActive = true;
    setIsSidebarSearching(true);

    const handler = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('sailing_venues')
          .select('id, name, country, region, coordinates_lat, coordinates_lng')
          .or(`name.ilike.%${sidebarSearchQuery}%,country.ilike.%${sidebarSearchQuery}%`)
          .limit(20);

        if (error) {
          throw error;
        }

        if (!isActive) return;

        const results: NetworkSidebarPlace[] = (data || []).map((venue: any) => ({
          id: venue.id,
          name: venue.name,
          country: venue.country,
          location: {
            name: venue.name,
            region: venue.region,
          },
          coordinates: {
            lat: venue.coordinates_lat,
            lng: venue.coordinates_lng,
          },
          type: 'venue',
          isSaved: sidebarSavedIds.has(venue.id),
        }));

        setSidebarSearchResults(results);
      } catch (error) {
        console.error('[VenueTab] Venue search failed:', error);
        if (isActive) {
          setSidebarSearchResults([]);
        }
      } finally {
        if (isActive) {
          setIsSidebarSearching(false);
        }
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(handler);
    };
  }, [sidebarSavedIds, sidebarSearchQuery]);

  // Ask AI about current venue
  const handleAskAIAboutVenue = async (forceRefresh: boolean = false) => {
    if (!currentVenue?.id) {
      Alert.alert('No Venue', 'Please select a venue first.');
      return;
    }

    setLoadingVenueAnalysis(true);
    try {
      const agent = new VenueIntelligenceAgent();
      const result = await agent.analyzeVenue(
        currentVenue.id,
        user?.id, // Pass user ID for caching
        forceRefresh
      );


      setLoadingVenueAnalysis(false);

      if (result.success) {
        setVenueAnalysis(result.insights);
        setAnalysisCacheInfo({
          fromCache: result.fromCache || false,
          cacheAge: result.cacheAge,
          tokensUsed: result.tokensUsed,
        });
        setShowVenueAnalysisModal(true);
      } else {
        Alert.alert('Analysis Failed', result.error || 'Could not analyze venue');
      }
    } catch (error: any) {
      setLoadingVenueAnalysis(false);
      Alert.alert('Error', error.message || 'Failed to analyze venue');
    }
  };

  // Refresh venue analysis (bypass cache)
  const handleRefreshVenueAnalysis = async () => {
    await handleAskAIAboutVenue(true); // Force refresh
  };

  // Initialize venue detection
  useEffect(() => {
    const initVenue = async () => {
      // On web, skip GPS detection and just set a default venue immediately
      // GPS permission prompts on web can hang the UI
      if (Platform.OS === 'web') {
        // Check if there's already a cached venue
        const currentVenueCheck = venueDetectionService.getCurrentVenue();

        if (!currentVenueCheck) {
          try {
            const success = await setVenueManually('hong-kong-victoria-harbor');
            if (!success) {
              await setVenueManually('newport-rhode-island');
            }
          } catch (error) {
            // Silent fail, user can select venue manually
          }
        }
        return; // Skip GPS initialization on web
      }

      // On native platforms, try GPS detection
      try {
        await initializeDetection();
      } catch (error) {
        // Silent fail, user can select venue manually
      }

      // Auto-select default venue if no venue was detected
      setTimeout(async () => {
        const currentVenueCheck = venueDetectionService.getCurrentVenue();

        if (!currentVenueCheck) {
          try {
            const success = await setVenueManually('hong-kong-victoria-harbor');
            if (!success) {
              await setVenueManually('newport-rhode-island');
            }
          } catch (error) {
            // Silent fail, user can select venue manually
          }
        }
      }, 500);
    };

    initVenue();
  }, [initializeDetection, setVenueManually]);

  useEffect(() => {
    void refreshSavedNetwork();
  }, [refreshSavedNetwork]);

  useEffect(() => {
    setSidebarSearchResults((prev) =>
      prev.map((place) => ({
        ...place,
        isSaved: sidebarSavedIds.has(place.id),
      })),
    );
  }, [sidebarSavedIds]);

  // Handle marker press on map
  const handleMarkerPress = (venue: Venue) => {
    setSelectedVenueForSheet(venue);
  };

  // Handle closing details sheet
  const handleCloseSheet = () => {
    setSelectedVenueForSheet(null);
  };

  const shorten = (text?: string | null, limit: number = 42) => {
    if (!text) return undefined;
    return text.length > limit ? `${text.slice(0, limit)}…` : text;
  };

  const quickStats = useMemo<VenueIntelStat[]>(() => {
    const stats: VenueIntelStat[] = [];

    const windSummary =
      venueAnalysis?.conditions?.windSummary ||
      venueAnalysis?.weather?.windSummary ||
      venueAnalysis?.recommendations?.timing;

    if (windSummary) {
      stats.push({
        id: 'wind',
        label: 'Wind',
        value: shorten(windSummary),
        detail: windSummary,
        icon: '🌬️',
      });
    }

    if (venueAnalysis?.recommendations?.practice) {
      stats.push({
        id: 'practice',
        label: 'Practice',
        value: shorten(venueAnalysis.recommendations.practice),
        detail: venueAnalysis.recommendations.practice,
        icon: '🧭',
      });
    }

    if (aiVenueResult?.distance) {
      stats.push({
        id: 'distance',
        label: 'Distance',
        value: `${aiVenueResult.distance.toFixed(1)} km`,
        detail: 'From your current location',
        icon: '📍',
      });
    }

    const fallback: VenueIntelStat[] = [
      { id: 'wind', label: 'Wind', value: '12-16 kts NE', detail: 'Gusts up to 18 kts', icon: '🌬️' },
      { id: 'tide', label: 'Tide', value: 'Flood +1.2 m', detail: 'Slack at 14:32', icon: '🌊' },
      { id: 'sea', label: 'Sea State', value: 'Short chop', detail: '0.6 m @ 3s', icon: '🌊' },
    ];

    fallback.forEach((item) => {
      if (!stats.find((stat) => stat.id === item.id)) {
        stats.push(item);
      }
    });

    return stats.slice(0, 4);
  }, [venueAnalysis, aiVenueResult]);

  const checklistSections = useMemo<VenueIntelChecklistSection[]>(() => {
    const recs = venueAnalysis?.recommendations;
    const items: VenueIntelChecklistItem[] = [];

    if (recs?.safety) {
      items.push({
        id: 'safety',
        label: 'Safety briefing',
        status: 'warning',
        description: recs.safety,
        icon: '⚠️',
      });
    }

    if (recs?.racing) {
      items.push({
        id: 'racing',
        label: 'Race plan',
        status: 'ready',
        description: recs.racing,
        icon: '🏁',
      });
    }

    if (recs?.cultural) {
      items.push({
        id: 'culture',
        label: 'Local customs',
        status: 'todo',
        description: recs.cultural,
        icon: '🌍',
      });
    }

    if (items.length === 0) {
      items.push(
        {
          id: 'docs',
          label: 'Docs uploaded',
          status: 'ready',
          description: 'SI + NOR synced to Drive',
          icon: '📄',
        },
        {
          id: 'weather-brief',
          label: 'Weather brief',
          status: 'warning',
          description: 'Pull latest HKO + NOAA files',
          icon: '🌤️',
        },
        {
          id: 'services',
          label: 'Service partners',
          status: 'todo',
          description: 'Lock sail loft & rigging backup',
          icon: '🧰',
        }
      );
    }

    return [
      {
        id: 'local-intel',
        title: 'Local Intelligence',
        items,
      },
    ];
  }, [venueAnalysis]);

  const discoveryContent = useMemo(() => (
    <View style={styles.discoveryCard}>
      <ThemedText style={styles.discoveryTitle}>Find your next sailing base</ThemedText>
      <ThemedText style={styles.discoveryCopy}>
        Explore yacht clubs, fuel docks, repair yards, and local coaching before you travel.
        Tap a venue on the map or let AI detect where you are headed.
      </ThemedText>
      <View style={styles.discoveryHighlights}>
        <View style={styles.discoveryHighlight}>
          <Ionicons name="airplane-outline" size={18} color="#2563EB" />
          <ThemedText style={styles.discoveryHighlightText}>Destination-ready intel</ThemedText>
        </View>
        <View style={styles.discoveryHighlight}>
          <Ionicons name="cloud-outline" size={18} color="#2563EB" />
          <ThemedText style={styles.discoveryHighlightText}>Live conditions & tactics</ThemedText>
        </View>
        <View style={styles.discoveryHighlight}>
          <Ionicons name="briefcase-outline" size={18} color="#2563EB" />
          <ThemedText style={styles.discoveryHighlightText}>Service directory in one view</ThemedText>
        </View>
      </View>
    </View>
  ), []);

  const handleChipToggle = useCallback((layer: keyof MapLayers) => {
    setMapLayers(prev => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  }, []);

  const overviewProps = useMemo(() => {
    const hero = currentVenue
      ? {
          venueName: currentVenue.name,
          country: currentVenue.country,
          region: currentVenue.region,
          distanceLabel: aiVenueResult?.distance
            ? `You are ${aiVenueResult.distance.toFixed(1)} km away`
            : undefined,
          windSummary:
            venueAnalysis?.recommendations?.timing ||
            venueAnalysis?.summary ||
            undefined,
          travelTip:
            venueAnalysis?.recommendations?.practice ||
            venueAnalysis?.recommendations?.racing ||
            'Local sailing intel, service providers, and practice spots at a glance.',
          onSave: () => setShowOnlySavedVenues(true),
          isSaved: sidebarSavedIds.has(currentVenue.id),
          latitude: currentVenue.coordinates_lat,
          longitude: currentVenue.coordinates_lng,
        }
      : {
          venueName: 'Find your next sailing base',
          travelTip: 'Tap a venue on the map or let AI detect where you are headed.',
        };

    return {
      hero,
      stats: currentVenue ? quickStats : [],
      checklist: currentVenue ? checklistSections : [],
      chips: {
        layers: mapLayers,
        onToggleLayer: handleChipToggle,
      },
      children: currentVenue ? undefined : discoveryContent,
    };
  }, [
    aiVenueResult,
    checklistSections,
    currentVenue,
    handleChipToggle,
    mapLayers,
    quickStats,
    sidebarSavedIds,
    venueAnalysis,
    discoveryContent,
  ]);

  if (isDetecting) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>🌍 Detecting your sailing venue...</ThemedText>
      </ThemedView>
    );
  }

  const sidebarNode = (
    <NetworkSidebar
      searchQuery={sidebarSearchQuery}
      onSearchQueryChange={setSidebarSearchQuery}
      searchResults={sidebarSearchResults}
      savedPlaces={sidebarSavedPlaces}
      isSearching={isSidebarSearching}
      isLoadingSaved={isSidebarLoadingSaved}
      isCollapsed={isSidebarCollapsed}
      onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      onPlacePress={(place) => {
        const venue: Venue = {
          id: place.id,
          name: place.name,
          country: place.country ?? '',
          region: place.location?.region ?? '',
          venue_type: place.type ?? 'venue',
          coordinates_lat: place.coordinates?.lat ?? 0,
          coordinates_lng: place.coordinates?.lng ?? 0,
        };
        setSelectedVenueForSheet(venue);
      }}
      onSaveToggle={(place, nextSaved) => {
        const base =
          sidebarSearchResults.find((candidate) => candidate.id === place.id) ||
          sidebarSavedPlaces.find((candidate) => candidate.id === place.id);
        if (base) {
          handleSidebarSaveToggle(base, nextSaved);
        }
      }}
    />
  );

  const controlsNode = (
    <MapControls
      onToggle3D={() => setIsThreeDEnabled(prev => !prev)}
      onToggleLayers={() => setAreLayersVisible(prev => !prev)}
      onToggleSavedVenues={() => setShowOnlySavedVenues(prev => !prev)}
      onSearchNearby={() => {
        void initializeDetection();
      }}
      is3DEnabled={isThreeDEnabled}
      areLayersVisible={areLayersVisible}
      showOnlySavedVenues={showOnlySavedVenues}
      savedVenuesCount={sidebarSavedPlaces.length}
      layers={mapLayers}
      onLayersChange={(layers) => setMapLayers(layers)}
    />
  );

  const detailsSheetNode = (
    <VenueDetailsSheet
      venue={selectedVenueForSheet}
      onClose={handleCloseSheet}
    />
  );

  const mapOverlayNode = (
    <View style={styles.aiOverlayContainer}>
      {currentVenue && (
        <TouchableOpacity
          style={[styles.aiDetectionButton, { backgroundColor: '#10B981' }]}
          onPress={() => handleAskAIAboutVenue()}
          disabled={loadingVenueAnalysis}
        >
          {loadingVenueAnalysis ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.aiDetectionButtonText}>
              💡 Ask AI About This Venue
            </ThemedText>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.aiDetectionButton}
        onPress={handleAIVenueDetection}
        disabled={isDetectingVenue}
      >
        {isDetectingVenue ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText style={styles.aiDetectionButtonText}>
            🤖 Detect Current Venue
          </ThemedText>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <VenueIntelligenceLayout
        overview={overviewProps}
        map={{
          currentVenue,
          selectedVenue: selectedVenueForSheet,
          onMarkerPress: handleMarkerPress,
          showAllVenues: true,
          showOnlySavedVenues,
          savedVenueIds: sidebarSavedIds,
          mapLayers,
        }}
        sidebar={sidebarNode}
        controls={controlsNode}
        detailsSheet={detailsSheetNode}
        mapOverlay={mapOverlayNode}
      />

      {/* AI Venue Analysis Modal */}
      <Modal
        visible={showVenueAnalysisModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVenueAnalysisModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>AI Venue Intelligence</ThemedText>
              <TouchableOpacity onPress={() => setShowVenueAnalysisModal(false)}>
                <ThemedText style={styles.closeButton}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Cache Status Indicator */}
            {analysisCacheInfo && (
              <View style={[
                styles.cacheIndicator,
                { backgroundColor: analysisCacheInfo.fromCache ? '#FEF3C7' : '#D1FAE5' }
              ]}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[
                    styles.cacheStatusText,
                    { color: analysisCacheInfo.fromCache ? '#78350F' : '#065F46' }
                  ]}>
                    {analysisCacheInfo.fromCache
                      ? `📦 Cached ${analysisCacheInfo.cacheAge}`
                      : '✨ Fresh analysis'
                    }
                  </ThemedText>
                  {analysisCacheInfo.tokensUsed && (
                    <ThemedText style={styles.cacheMetaText}>
                      {analysisCacheInfo.tokensUsed} tokens used
                    </ThemedText>
                  )}
                </View>
                {analysisCacheInfo.fromCache && (
                  <TouchableOpacity
                    onPress={handleRefreshVenueAnalysis}
                    disabled={loadingVenueAnalysis}
                    style={styles.refreshButton}
                  >
                    {loadingVenueAnalysis ? (
                      <ActivityIndicator size="small" color="#78350F" />
                    ) : (
                      <ThemedText style={styles.refreshButtonText}>🔄 Refresh</ThemedText>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {venueAnalysis && (
                <>
                  {/* Venue Name */}
                  <View style={styles.venueInfoCard}>
                    <ThemedText style={styles.venueName}>{venueAnalysis.venueName}</ThemedText>
                    <ThemedText style={styles.venueDistance}>
                      🤖 AI-Generated Intelligence
                    </ThemedText>
                  </View>

                  {/* Safety Recommendations */}
                  {venueAnalysis.recommendations?.safety && (
                    <View style={[styles.adaptationsCard, { backgroundColor: '#FEE2E2' }]}>
                      <ThemedText style={[styles.adaptationsTitle, { color: '#991B1B' }]}>
                        ⚠️ Safety Recommendations
                      </ThemedText>
                      <ThemedText style={[styles.adaptationValue, { color: '#7F1D1D' }]}>
                        {venueAnalysis.recommendations.safety}
                      </ThemedText>
                    </View>
                  )}

                  {/* Racing Tips */}
                  {venueAnalysis.recommendations?.racing && (
                    <View style={[styles.adaptationsCard, { backgroundColor: '#D1FAE5' }]}>
                      <ThemedText style={[styles.adaptationsTitle, { color: '#065F46' }]}>
                        🏆 Racing Tips
                      </ThemedText>
                      <ThemedText style={[styles.adaptationValue, { color: '#047857' }]}>
                        {venueAnalysis.recommendations.racing}
                      </ThemedText>
                    </View>
                  )}

                  {/* Cultural Notes */}
                  {venueAnalysis.recommendations?.cultural && (
                    <View style={styles.adaptationsCard}>
                      <ThemedText style={styles.adaptationsTitle}>
                        🌍 Cultural Notes
                      </ThemedText>
                      <ThemedText style={styles.adaptationValue}>
                        {venueAnalysis.recommendations.cultural}
                      </ThemedText>
                    </View>
                  )}

                  {/* Practice Areas */}
                  {venueAnalysis.recommendations?.practice && (
                    <View style={[styles.adaptationsCard, { backgroundColor: '#FEF3C7' }]}>
                      <ThemedText style={[styles.adaptationsTitle, { color: '#78350F' }]}>
                        📍 Practice Areas
                      </ThemedText>
                      <ThemedText style={[styles.adaptationValue, { color: '#92400E' }]}>
                        {venueAnalysis.recommendations.practice}
                      </ThemedText>
                    </View>
                  )}

                  {/* Optimal Conditions */}
                  {venueAnalysis.recommendations?.timing && (
                    <View style={[styles.adaptationsCard, { backgroundColor: '#E0E7FF' }]}>
                      <ThemedText style={[styles.adaptationsTitle, { color: '#3730A3' }]}>
                        ⏰ Optimal Conditions
                      </ThemedText>
                      <ThemedText style={[styles.adaptationValue, { color: '#4338CA' }]}>
                        {venueAnalysis.recommendations.timing}
                      </ThemedText>
                    </View>
                  )}

                  {/* Full Analysis */}
                  <View style={styles.toolsCard}>
                    <ThemedText style={styles.toolsLabel}>
                      Complete AI Analysis
                    </ThemedText>
                    <ThemedText style={{ fontSize: 14, color: '#374151', marginTop: 8 }}>
                      {venueAnalysis.analysis}
                    </ThemedText>
                  </View>
                </>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setShowVenueAnalysisModal(false)}
              >
                <ThemedText style={styles.confirmButtonText}>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Venue Confirmation Modal */}
      <Modal
        visible={showVenueConfirmModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVenueConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {aiVenueResult?.venueId ? 'Venue Detected' : 'No Venue Found'}
              </ThemedText>
              <TouchableOpacity onPress={() => setShowVenueConfirmModal(false)}>
                <ThemedText style={styles.closeButton}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Detected Venue Info */}
              {aiVenueResult ? (
                <>
                  <View style={styles.venueInfoCard}>
                    <ThemedText style={styles.venueName}>
                      {aiVenueResult.venueName || 'Unknown Venue'}
                    </ThemedText>
                    {aiVenueResult.distance !== undefined && (
                      <ThemedText style={styles.venueDistance}>
                        📍 {aiVenueResult.distance.toFixed(1)} km from your location
                      </ThemedText>
                    )}
                  </View>

                  {/* Confidence Score */}
                  {aiVenueResult.confidence !== undefined && (
                    <View style={styles.confidenceCard}>
                      <ThemedText style={styles.confidenceLabel}>Detection Confidence</ThemedText>
                      <ThemedText style={styles.confidenceValue}>
                        {(aiVenueResult.confidence * 100).toFixed(0)}%
                      </ThemedText>
                    </View>
                  )}

                  {/* Alternative Venues */}
                  {aiVenueResult.alternatives && aiVenueResult.alternatives.length > 0 && (
                    <View style={styles.alternativesCard}>
                      <ThemedText style={styles.alternativesTitle}>Nearby Alternatives</ThemedText>
                      {aiVenueResult.alternatives.map((alt: any, index: number) => (
                        <View key={index} style={styles.alternativeItem}>
                          <ThemedText style={styles.alternativeName}>{alt.name}</ThemedText>
                          <ThemedText style={styles.alternativeDistance}>
                            {alt.distance.toFixed(1)} km
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.venueInfoCard}>
                  <ThemedText style={styles.venueName}>No venue detected</ThemedText>
                  <ThemedText style={styles.venueDistance}>
                    Unable to detect a venue at your current location
                  </ThemedText>
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.manualButton} onPress={handleManualSelect}>
                <ThemedText style={styles.manualButtonText}>Manual Select</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!aiVenueResult?.venueId) && styles.confirmButtonDisabled
                ]}
                onPress={handleConfirmVenue}
                disabled={!aiVenueResult?.venueId}
              >
                <ThemedText style={[
                  styles.confirmButtonText,
                  (!aiVenueResult?.venueId) && styles.confirmButtonTextDisabled
                ]}>
                  Confirm
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayColumn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 80 : 40,
    left: 20,
    right: 20,
    gap: 16,
    zIndex: 90,
    alignItems: 'flex-start',
  },
  discoveryCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 18,
    padding: 20,
    maxWidth: 420,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  discoveryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  discoveryCopy: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 14,
  },
  discoveryHighlights: {
    gap: 8,
  },
  discoveryHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discoveryHighlightText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },

  // AI Detection Overlay
  aiOverlayContainer: {
    gap: 12,
    width: 280,
  },
  aiDetectionButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  aiDetectionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
  },
  modalBody: {
    marginBottom: 16,
  },
  venueInfoCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  venueName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  venueDistance: {
    fontSize: 14,
    color: '#6B7280',
  },
  confidenceCard: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#065F46',
    marginBottom: 4,
  },
  confidenceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  adaptationsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  adaptationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1E3A8A',
  },
  adaptationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  adaptationLabel: {
    fontSize: 14,
    color: '#3B82F6',
  },
  adaptationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  alternativesCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  alternativesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#78350F',
  },
  alternativeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  alternativeName: {
    fontSize: 14,
    color: '#92400E',
  },
  alternativeDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
  toolsCard: {
    marginTop: 8,
  },
  toolsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  toolsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toolBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  toolText: {
    fontSize: 12,
    color: '#374151',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  manualButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  manualButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CBD5E1',
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  confirmButtonTextDisabled: {
    color: '#94A3B8',
  },

  // Cache Indicator Styles
  cacheIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  cacheStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cacheMetaText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  refreshButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78350F',
  },
});
