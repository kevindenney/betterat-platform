/**
 * SimpleAddRaceModal Component
 * Quick form to add a new race manually
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ImageBackground,
} from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import { useAuth, type SailorBoat } from '@betterat/core';
import { AIAssistedEntryPanel } from '@betterat/ui';
import { RaceExtractionAgent } from '../../services/agents/RaceExtractionAgent';
import { supabase } from '../../services/supabase';
import { RaceWeatherService } from '../../services/RaceWeatherService';
import { BoatSelector } from './BoatSelector';
const isWeb = Platform.OS === 'web';
let NativeMapView: any = null;
let NativeMarker: any = null;
let NativeProviderGoogle: any = null;
let NativeProviderDefault: any = null;

declare global {
  interface Window {
    maplibregl?: any;
  }
}

if (!isWeb) {
  const maps = require('react-native-maps');
  NativeMapView = maps.default;
  NativeMarker = maps.Marker;
  NativeProviderGoogle = maps.PROVIDER_GOOGLE;
  NativeProviderDefault = maps.PROVIDER_DEFAULT;
}

const DEFAULT_COORDINATES = {
  latitude: 22.2855,
  longitude: 114.1577,
};

const MAPLIBRE_JS_URL = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
const MAPLIBRE_CSS_URL = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
let mapLibreAssetPromise: Promise<void> | null = null;

// MapLibre is loaded from a CDN since Expo's Metro bundler can't ingest its CSS bundle on native targets.
function ensureMapLibreAssets(): Promise<void> {
  if (!isWeb) return Promise.resolve();
  if (mapLibreAssetPromise) return mapLibreAssetPromise;
  if (typeof window === 'undefined' || typeof document === 'undefined') return Promise.reject(new Error('DOM not available'));

  const injectStylesheet = () =>
    new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`link[href="${MAPLIBRE_CSS_URL}"]`) as HTMLLinkElement | null;
      if (existing) {
        if (existing.dataset.loaded === 'true') {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (err) => reject(err));
        return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = MAPLIBRE_CSS_URL;
      link.onload = () => {
        link.dataset.loaded = 'true';
        resolve();
      };
      link.onerror = (err) => reject(err);
      document.head.appendChild(link);
    });

  const injectScript = () =>
    new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[src="${MAPLIBRE_JS_URL}"]`) as HTMLScriptElement | null;
      if (existing) {
        if ((window as any).maplibregl) {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (err) => reject(err));
        return;
      }
      const script = document.createElement('script');
      script.src = MAPLIBRE_JS_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });

  mapLibreAssetPromise = (async () => {
    await Promise.all([injectStylesheet(), injectScript()]);
    if (!(window as any).maplibregl) {
      throw new Error('MapLibre GL not available on window after loading assets.');
    }
  })();

  mapLibreAssetPromise.catch(() => {
    mapLibreAssetPromise = null;
  });

  return mapLibreAssetPromise;
}

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${title ? `${title}: ` : ''}${message}`);
  } else {
    Alert.alert(title || 'Notice', message);
  }
};
interface SimpleAddRaceModalProps {
  visible: boolean;
  onClose: () => void;
  onRaceAdded: () => void;
}

export function SimpleAddRaceModal({ visible, onClose, onRaceAdded }: SimpleAddRaceModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [raceLocationName, setRaceLocationName] = useState('');
  const [raceLocationCoordinates, setRaceLocationCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [aiEntryText, setAiEntryText] = useState('');
  const [aiEntryUrl, setAiEntryUrl] = useState('');
  const [aiHighlights, setAiHighlights] = useState<{ label: string; value: string }[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [pendingCoordinates, setPendingCoordinates] = useState<{ latitude: number; longitude: number }>(DEFAULT_COORDINATES);
  const [mapDimensions, setMapDimensions] = useState({ width: 1, height: 1 });
  const [mapTile, setMapTile] = useState(() => (isWeb ? computeTileForCoords(DEFAULT_COORDINATES.latitude, DEFAULT_COORDINATES.longitude) : null));
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const webMapRef = useRef<any>(null);
  const webMarkerRef = useRef<any>(null);
  const [webMapReady, setWebMapReady] = useState(false);
  const [webMapError, setWebMapError] = useState<string | null>(null);
  const [selectedBoatId, setSelectedBoatId] = useState<string | undefined>();
  const [selectedBoat, setSelectedBoat] = useState<SailorBoat | undefined>();
  const [boatError, setBoatError] = useState<string | null>(null);

  const normalizedTime = useMemo(() => normalizeTimeInput(time), [time]);
  const webPinPosition = useMemo(() => {
    if (!mapTile) return null;
    const bounds = mapTile.bounds;
    const longitudeSpan = bounds.east - bounds.west;
    const latitudeSpan = bounds.north - bounds.south;
    if (longitudeSpan === 0 || latitudeSpan === 0) return null;
    const normalizedX = (pendingCoordinates.longitude - bounds.west) / longitudeSpan;
    const normalizedY = (bounds.north - pendingCoordinates.latitude) / latitudeSpan;
    return {
      left: `${Math.min(Math.max(normalizedX, 0), 1) * 100}%`,
      top: `${Math.min(Math.max(normalizedY, 0), 1) * 100}%`,
    };
  }, [mapTile, pendingCoordinates.latitude, pendingCoordinates.longitude]);

  useEffect(() => {
    if (!isWeb) return;
    setMapTile(computeTileForCoords(pendingCoordinates.latitude, pendingCoordinates.longitude));
  }, [pendingCoordinates.latitude, pendingCoordinates.longitude]);

  useEffect(() => {
    if (!isWeb || !locationPickerVisible) return;
    let isCancelled = false;
    const initialCenter = { ...pendingCoordinates };
    setWebMapReady(false);
    setWebMapError(null);

    const initializeWebMap = async () => {
      try {
        await ensureMapLibreAssets();
        const maplibregl = window.maplibregl;
        if (!maplibregl) {
          throw new Error('MapLibre GL script failed to expose maplibregl global.');
        }
        if (!mapContainerRef.current || isCancelled) return;

        webMapRef.current?.remove();
        webMarkerRef.current?.remove();

        webMapRef.current = new maplibregl.Map({
          container: mapContainerRef.current,
          style: {
            version: 8,
            sources: {
              osm: {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors',
                maxzoom: 19,
              },
            },
            layers: [
              {
                id: 'background',
                type: 'background',
                paint: { 'background-color': '#E4ECF5' },
              },
              {
                id: 'osm',
                type: 'raster',
                source: 'osm',
                minzoom: 0,
                maxzoom: 22,
              },
            ],
          },
          center: [initialCenter.longitude, initialCenter.latitude],
          zoom: 11,
          attributionControl: false,
        });

        webMapRef.current.on('load', () => {
          if (isCancelled) return;
          setWebMapReady(true);
          setWebMapError(null);
          webMarkerRef.current = new maplibregl.Marker({ color: '#0B3A60' })
            .setLngLat([initialCenter.longitude, initialCenter.latitude])
            .addTo(webMapRef.current);
        });

        webMapRef.current.on('click', (event: any) => {
          const { lng, lat } = event.lngLat;
          setPendingCoordinates({ latitude: lat, longitude: lng });
        });
      } catch (error) {
        console.error('Failed to initialize web map', error);
        setWebMapError('Unable to load the interactive map right now.');
      }
    };

    initializeWebMap();

    return () => {
      isCancelled = true;
      setWebMapReady(false);
      webMarkerRef.current?.remove();
      webMarkerRef.current = null;
      webMapRef.current?.remove();
      webMapRef.current = null;
    };
  }, [locationPickerVisible]);

  useEffect(() => {
    if (!isWeb || !locationPickerVisible) return;
    if (!webMapRef.current || !webMarkerRef.current) return;

    const nextLocation = [pendingCoordinates.longitude, pendingCoordinates.latitude];
    webMarkerRef.current.setLngLat(nextLocation);
    webMapRef.current.easeTo({ center: nextLocation, duration: 250 });
  }, [pendingCoordinates.latitude, pendingCoordinates.longitude, locationPickerVisible]);

  const openLocationPicker = () => {
    setPendingCoordinates(raceLocationCoordinates ?? { latitude: 22.2855, longitude: 114.1577 });
    setLocationPickerVisible(true);
  };

  const handleMapPress = (event: any) => {
    const nextCoordinate = event?.nativeEvent?.coordinate;
    if (!nextCoordinate) return;
    setPendingCoordinates(nextCoordinate);
  };

  const handleWebMapPress = (event: any) => {
    if (!mapTile) return;
    const { locationX, locationY } = event.nativeEvent;
    const normalizedX = Math.min(Math.max(locationX / mapDimensions.width, 0), 1);
    const normalizedY = Math.min(Math.max(locationY / mapDimensions.height, 0), 1);
    const longitude = mapTile.bounds.west + (mapTile.bounds.east - mapTile.bounds.west) * normalizedX;
    const latitude = mapTile.bounds.north - (mapTile.bounds.north - mapTile.bounds.south) * normalizedY;
    setPendingCoordinates({ latitude, longitude });
  };

  const handleMapLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setMapDimensions({ width: Math.max(width, 1), height: Math.max(height, 1) });
  };

  const confirmLocationSelection = () => {
    setRaceLocationCoordinates(pendingCoordinates);
    setLocationPickerVisible(false);
  };

  const resetForm = () => {
    setName('');
    setVenue('');
    setRaceLocationName('');
    setRaceLocationCoordinates(null);
    setDate('');
    setTime('');
    setAiEntryText('');
    setAiEntryUrl('');
    setAiHighlights([]);
    setPendingCoordinates(DEFAULT_COORDINATES);
    setSelectedBoatId(undefined);
    setSelectedBoat(undefined);
    setBoatError(null);
  };

  const buildRaceHighlights = (data: any) => {
    if (!data) return [];
    const rows: { label: string; value: string }[] = [];
    if (data.startTime) rows.push({ label: 'Start time', value: data.startTime });
    if (data?.critical_details?.warning_signal) {
      rows.push({ label: 'Warning signal', value: data.critical_details.warning_signal });
    }
    if (data?.critical_details?.vhf_channel) {
      rows.push({ label: 'VHF channel', value: data.critical_details.vhf_channel });
    }
    if (data?.critical_details?.race_area) {
      rows.push({ label: 'Race area', value: data.critical_details.race_area });
    }
    if (data?.critical_details?.courses?.length) {
      rows.push({ label: 'Courses', value: data.critical_details.courses.join(', ') });
    }
    if (data?.wind) {
      rows.push({
        label: 'Wind',
        value: `${data.wind.direction} · ${data.wind.speedMin}-${data.wind.speedMax} kts`,
      });
    }
    if (data?.tide) {
      rows.push({
        label: 'Tide',
        value: `${data.tide.state} · ${data.tide.height}m`,
      });
    }
    if (data?.strategy) {
      rows.push({ label: 'Strategy', value: data.strategy });
    }
    return rows;
  };

  const handleAIExtraction = async ({ text, url }: { text: string; url?: string }) => {
    const payload = [text, url ? `\nSource: ${url}` : null].filter(Boolean).join('\n\n').trim();
    if (!payload) return;
    setIsExtracting(true);
    try {
      const agent = new RaceExtractionAgent();
      const result = await agent.extractRaceData(payload, {
        boatName: selectedBoat?.name,
        boatClass: selectedBoat?.boat_class?.name,
      });
      if (!result.success || !result.data) {
        showAlert('Could not extract race details', result.error || 'Try adding more context.');
        return;
      }

      const extracted = result.data;
      if (extracted.name) setName(extracted.name);
      if (extracted.venue) setVenue(extracted.venue);
      if (extracted.date) setDate(extracted.date);
      if (extracted.startTime) setTime(extracted.startTime);
      if (extracted.raceLocation) setRaceLocationName(extracted.raceLocation);
      if (extracted?.critical_details?.race_area && !extracted.raceLocation) {
        setRaceLocationName(extracted.critical_details.race_area);
      }
      setAiHighlights(buildRaceHighlights(extracted));

      showAlert('Race details loaded', 'We filled the form with the extracted NOR / SI data.');
    } catch (error: any) {
      console.error('[SimpleAddRaceModal] AI extraction failed', error);
      showAlert('AI Error', error?.message ?? 'Could not parse the document.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async () => {
    console.log('[SimpleAddRaceModal] handleSave called');
    console.log('[SimpleAddRaceModal] user:', user?.id);
    console.log('[SimpleAddRaceModal] name:', name);
    console.log('[SimpleAddRaceModal] date:', date);

    if (!user) {
      console.log('[SimpleAddRaceModal] No user - showing alert');
      showAlert('Error', 'You must be logged in to add a race');
      return;
    }

    if (!name.trim()) {
      console.log('[SimpleAddRaceModal] No name - showing alert');
      showAlert('Error', 'Please enter a race name');
      return;
    }

    if (!date.trim()) {
      console.log('[SimpleAddRaceModal] No date - showing alert');
      showAlert('Error', 'Please enter a race date (YYYY-MM-DD)');
      return;
    }

    if (!venue.trim()) {
      console.log('[SimpleAddRaceModal] No venue - showing alert');
      showAlert('Error', 'Please enter a race venue');
      return;
    }

    if (!time.trim()) {
      console.log('[SimpleAddRaceModal] No time - showing alert');
      showAlert('Error', 'Please enter a race start time (HH:MM:SS)');
      return;
    }

    if (!normalizedTime) {
      showAlert('Error', 'Please enter a valid start time (HH:MM or HH:MM:SS)');
      return;
    }

    if (!raceLocationName.trim()) {
      showAlert('Error', 'Please enter a race location (course area)');
      return;
    }

    if (!raceLocationCoordinates) {
      showAlert('Error', 'Please drop a pin on the map to capture coordinates');
      return;
    }

    if (!selectedBoatId || !selectedBoat) {
      const message = 'Select your boat (or add a new one) so we can tailor rig tuning.';
      setBoatError(message);
      showAlert('Boat required', message);
      return;
    }

    console.log('[SimpleAddRaceModal] Starting insert...');
    setIsSaving(true);

    try {
      const trimmedName = name.trim();
      const trimmedDate = date.trim();
      const trimmedVenue = venue.trim();
      const trimmedLocationName = raceLocationName.trim();
      const userEnteredTime = normalizedTime;
      const startTimeToSave = userEnteredTime;

      // Store venue and location info in weather_conditions metadata since they don't exist as top-level columns
      const boatMetadata = {
        id: selectedBoat.id,
        name: selectedBoat.name,
        sail_number: selectedBoat.sail_number,
        class: selectedBoat.boat_class
          ? {
              id: selectedBoat.boat_class.id,
              name: selectedBoat.boat_class.name,
              manufacturer: selectedBoat.boat_class.manufacturer,
              slug: selectedBoat.boat_class.slug,
            }
          : null,
      };

      const initialWeatherConditions: any = {
        location_name: trimmedLocationName || null,
        location_coordinates: raceLocationCoordinates || null,
        venue_name: trimmedVenue || null,
        boat: boatMetadata,
      };

      const basePayload: Record<string, any> = {
        club_id: user.id,
        name: trimmedName,
        event_date: trimmedDate,
        start_time: startTimeToSave,
        status: 'planned',
        boat_id: selectedBoatId,
        weather_conditions: initialWeatherConditions,
      };

      console.log('[SimpleAddRaceModal] inserting payload:', JSON.stringify(basePayload, null, 2));

      const { data, error } = await supabase.from('race_events').insert(basePayload).select('id').single();

      console.log('[SimpleAddRaceModal] Insert response - data:', data, 'error:', error);

      if (error || !data) {
        console.error('[SimpleAddRaceModal] Error saving race:', error);
        showAlert('Error', 'Failed to save race: ' + (error?.message || 'unknown error'));
        return;
      }

      if (trimmedDate && startTimeToSave) {
        try {
          console.log('[SimpleAddRaceModal] Fetching weather data for new race...');
          const weatherData = raceLocationCoordinates
            ? await RaceWeatherService.fetchWeatherByCoordinates(
                raceLocationCoordinates.latitude,
                raceLocationCoordinates.longitude,
                `${trimmedDate}T${startTimeToSave}`,
                trimmedLocationName || trimmedVenue,
                { warningSignalTime: startTimeToSave }
              )
            : trimmedVenue
            ? await RaceWeatherService.fetchWeatherByVenueName(trimmedVenue, trimmedDate, {
                warningSignalTime: startTimeToSave,
              })
            : null;

          if (weatherData) {
            const averageWind = Math.round((weatherData.wind.speedMin + weatherData.wind.speedMax) / 2);

            // Merge weather data with the initial location metadata
            await supabase
              .from('race_events')
              .update({
                weather_conditions: {
                  // Keep the initial metadata
                  location_name: trimmedLocationName,
                  location_coordinates: raceLocationCoordinates,
                  venue_name: trimmedVenue,
                  boat: boatMetadata,
                  // Add weather data
                  wind_speed: averageWind,
                  wind_speed_min: weatherData.wind.speedMin,
                  wind_speed_max: weatherData.wind.speedMax,
                  wind_direction: weatherData.wind.direction,
                  tide_state: weatherData.tide.state,
                  tide_height: weatherData.tide.height,
                  tide_direction: weatherData.tide.direction,
                  fetched_at: weatherData.fetchedAt,
                  provider: weatherData.provider,
                  confidence: weatherData.confidence,
                },
              })
              .eq('id', data.id);

            console.log('[SimpleAddRaceModal] Weather data saved for race', data.id);
          } else {
            console.log('[SimpleAddRaceModal] Weather service returned no data (likely too far out).');
          }
        } catch (weatherError) {
          console.warn('[SimpleAddRaceModal] Weather enrichment failed:', weatherError);
        }
      }

      // Success!
      console.log('[SimpleAddRaceModal] Race added successfully!');
      showAlert('Success', 'Race added successfully!');
      resetForm();
      onRaceAdded();
      onClose();
    } catch (err: any) {
      console.error('Unexpected error:', err);
      showAlert('Error', 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerEyebrow}>RACE DISPATCH</Text>
              <Text style={styles.title}>Add a new entry</Text>
              <Text style={styles.headerSubtitle}>Coaches will enrich these notes automatically.</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#6D6357" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <AIAssistedEntryPanel
              title="AI race entry"
              description="Paste a NOR, sailing instructions, email, or drop a link. We'll map the important fields below and pre-fill the form."
              helperText="AI works best with the official document text or a shared link."
              textValue={aiEntryText}
              urlValue={aiEntryUrl}
              onChangeText={setAiEntryText}
              onChangeUrl={setAiEntryUrl}
              onSubmit={handleAIExtraction}
              isProcessing={isExtracting}
              highlights={aiHighlights}
              highlightTitle="Extracted details"
            />
            {/* Race Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Race Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Hong Kong Island Race"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Venue */}
            <View style={styles.field}>
              <Text style={styles.label}>Venue *</Text>
              <TextInput
                style={styles.input}
                value={venue}
                onChangeText={setVenue}
                placeholder="e.g., Royal Hong Kong Yacht Club"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Boat */}
            <View style={styles.field}>
              <BoatSelector
                selectedBoatId={selectedBoatId}
                onSelect={setSelectedBoatId}
                onBoatChange={(boat) => {
                  setSelectedBoat(boat);
                  if (boat) {
                    setBoatError(null);
                  }
                }}
                required
                showQuickAdd
              />
              {boatError && <Text style={styles.errorText}>{boatError}</Text>}
              <Text style={styles.supportingText}>Rig & sail plan AI needs the boat profile to deliver tuning suggestions.</Text>
            </View>

            {/* Race Location */}
            <View style={styles.field}>
              <Text style={styles.label}>Race Location *</Text>
              <TextInput
                style={styles.input}
                value={raceLocationName}
                onChangeText={setRaceLocationName}
                placeholder="e.g., Victoria Harbour Outer Course"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Coordinates */}
            <View style={styles.field}>
              <Text style={styles.label}>Coordinates *</Text>
              <TouchableOpacity style={styles.coordinateSelector} onPress={openLocationPicker}>
                <View>
                  <Text style={styles.coordinateSelectorTitle}>Drop a pin</Text>
                  {raceLocationCoordinates ? (
                    <Text style={styles.coordinateSelectorValue}>
                      {raceLocationCoordinates.latitude.toFixed(5)}, {raceLocationCoordinates.longitude.toFixed(5)}
                    </Text>
                  ) : (
                    <Text style={styles.coordinateSelectorPlaceholder}>
                      Tap to drop a pin on the course map
                    </Text>
                  )}
                </View>
                <MapPin size={18} color="#0B3A60" />
              </TouchableOpacity>
            </View>

            {/* Date */}
            <View style={styles.field}>
              <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="2025-11-20"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Time */}
            <View style={styles.field}>
              <Text style={styles.label}>Start Time (HH:MM:SS) *</Text>
              <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="14:00 or 14:00:00"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <Text style={styles.hint}>
              * Required fields. Weather data and AI strategy will be generated automatically.
            </Text>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Add Race'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal
        visible={locationPickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLocationPickerVisible(false)}
      >
        <View style={styles.mapModalOverlay}>
          <View style={styles.mapModalContent}>
            <Text style={styles.mapModalTitle}>Drop a pin for the race course</Text>
            <Text style={styles.mapModalSubtitle}>Tap anywhere on the map to set exact coordinates</Text>
            {NativeMapView ? (
              <NativeMapView
                style={styles.locationMap}
                provider={Platform.OS === 'android' ? NativeProviderGoogle : NativeProviderDefault}
                initialRegion={{
                  latitude: pendingCoordinates.latitude,
                  longitude: pendingCoordinates.longitude,
                  latitudeDelta: 0.2,
                  longitudeDelta: 0.2,
                }}
                onPress={handleMapPress}
              >
                {pendingCoordinates && <NativeMarker coordinate={pendingCoordinates} />}
              </NativeMapView>
            ) : (
              <View style={styles.webMapContainer}>
                {isWeb && !webMapError ? (
                  <>
                    <div
                      ref={mapContainerRef}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 16,
                      }}
                    />
                    {!webMapReady && (
                      <View style={styles.webMapLoadingOverlay}>
                        <Text style={styles.webMapLoadingText}>Loading interactive map…</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View
                    style={styles.webMapFallback}
                    onLayout={handleMapLayout}
                    onStartShouldSetResponder={() => true}
                    onResponderRelease={handleWebMapPress}
                  >
                    {mapTile && (
                      <ImageBackground
                        source={{ uri: mapTile.url }}
                        resizeMode="cover"
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    {webPinPosition && (
                      <View style={[styles.webPinMarker, webPinPosition]} />
                    )}
                  </View>
                )}
                <View style={styles.webMapFrostedHeader}>
                  <Text style={styles.webMapHeaderTitle}>Interactive preview</Text>
                  <Text style={styles.webMapHeaderSubtitle}>Pan, zoom & click to drop a pin</Text>
                </View>
                {webMapError && (
                  <View style={styles.webMapErrorBanner}>
                    <Text style={styles.webMapErrorText}>
                      Interactive map unavailable. Tap the fallback map to pick a location.
                    </Text>
                  </View>
                )}
              </View>
            )}
            <View style={styles.mapModalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setLocationPickerVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={confirmLocationSelection}
              >
                <Text style={styles.saveButtonText}>Use Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

function normalizeTimeInput(value: string): string | null {
  if (!value) return null;
  const parts = value.trim().split(':');
  if (parts.length < 2 || parts.length > 3) return null;
  const [rawHours, rawMinutes, rawSeconds] = parts;
  const hours = rawHours.padStart(2, '0');
  const minutes = rawMinutes.padStart(2, '0');
  const seconds = (rawSeconds ?? '00').padStart(2, '0');

  const numericHours = Number(hours);
  const numericMinutes = Number(minutes);
  const numericSeconds = Number(seconds);

  if (
    Number.isNaN(numericHours) ||
    Number.isNaN(numericMinutes) ||
    Number.isNaN(numericSeconds) ||
    numericHours > 23 ||
    numericMinutes > 59 ||
    numericSeconds > 59
  ) {
    return null;
  }

  return `${hours}:${minutes}:${seconds}`;
}

function computeTileForCoords(latitude: number, longitude: number, zoom = 11) {
  const tileCount = 2 ** zoom;
  const x = Math.floor(((longitude + 180) / 360) * tileCount);
  const latitudeRad = (latitude * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latitudeRad) + 1 / Math.cos(latitudeRad)) / Math.PI) / 2) * tileCount
  );

  return {
    url: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
    bounds: tileToBounds(x, y, zoom),
    zoom,
  };
}

function tileToBounds(x: number, y: number, zoom: number) {
  const tileCount = 2 ** zoom;
  const west = (x / tileCount) * 360 - 180;
  const east = ((x + 1) / tileCount) * 360 - 180;
  const north = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / tileCount))) * 180) / Math.PI;
  const south = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / tileCount))) * 180) / Math.PI;
  return { west, east, north, south };
}

const serifFont = Platform.select({ ios: 'Iowan Old Style', android: 'serif', default: 'Georgia' });
const sansFont = Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif-light', default: 'System' });

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFDF8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8CCBA',
    width: '100%',
    maxWidth: 520,
    maxHeight: '82%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E4D9C8',
    gap: 16,
  },
  headerEyebrow: {
    fontFamily: sansFont,
    fontSize: 12,
    letterSpacing: 3,
    color: '#86735C',
    marginBottom: 6,
  },
  headerSubtitle: {
    marginTop: 6,
    fontFamily: sansFont,
    fontSize: 14,
    color: '#7A6D5F',
  },
  title: {
    fontSize: 26,
    color: '#1F1810',
    fontFamily: serifFont,
  },
  closeButton: {
    padding: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E4D9C8',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontFamily: sansFont,
    fontSize: 12,
    letterSpacing: 2,
    color: '#7A6D5F',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  supportingText: {
    marginTop: 8,
    fontFamily: sansFont,
    fontSize: 12,
    color: '#6B7280',
  },
  errorText: {
    marginTop: 6,
    fontFamily: sansFont,
    fontSize: 12,
    color: '#DC2626',
  },
  coordinateSelector: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4D9C8',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coordinateSelectorTitle: {
    fontFamily: sansFont,
    fontSize: 11,
    letterSpacing: 2,
    color: '#7A6D5F',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  coordinateSelectorValue: {
    fontFamily: serifFont,
    fontSize: 18,
    color: '#1F1810',
  },
  coordinateSelectorPlaceholder: {
    fontFamily: sansFont,
    fontSize: 14,
    color: '#94A3B8',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4D9C8',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F1810',
  },
  hint: {
    fontSize: 12,
    color: '#8B7965',
    marginTop: 6,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E4D9C8',
    backgroundColor: '#FFFFFF',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F7F3EB',
    borderWidth: 1,
    borderColor: '#E4D9C8',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#7A6D5F',
  },
  saveButton: {
    backgroundColor: '#0B3A60',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  mapModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapModalContent: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFDF8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8CCBA',
    padding: 20,
  },
  mapModalTitle: {
    fontFamily: serifFont,
    fontSize: 22,
    color: '#1F1810',
  },
  mapModalSubtitle: {
    fontFamily: sansFont,
    fontSize: 13,
    color: '#7A6D5F',
    marginBottom: 16,
  },
  locationMap: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    marginBottom: 16,
  },
  webMapContainer: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E0E7FF',
    marginBottom: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#D3DCEB',
  },
  webMapFallback: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  webMapFrostedHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(15,23,42,0.75)',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  webMapHeaderTitle: {
    fontFamily: sansFont,
    fontSize: 11,
    color: '#E2E8F0',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  webMapHeaderSubtitle: {
    marginTop: 2,
    fontFamily: serifFont,
    fontSize: 14,
    color: '#F8FAFC',
  },
  webMapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248,250,252,0.85)',
    padding: 16,
  },
  webMapLoadingText: {
    fontFamily: sansFont,
    fontSize: 14,
    color: '#0F172A',
  },
  webMapErrorBanner: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(15,23,42,0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  webMapErrorText: {
    fontFamily: sansFont,
    fontSize: 12,
    color: '#FEE2E2',
  },
  webPinMarker: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#2563EB',
    transform: [{ translateX: -7 }, { translateY: -7 }],
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  mapModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
});
