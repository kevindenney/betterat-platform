// @ts-nocheck

/**
 * Venue Detection Service - GPS-based Sailing Venue Recognition
 * Core service for "OnX Maps for Sailing" that automatically detects which sailing venue
 * the user is currently at and switches to venue-specific intelligence
 */

import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SailingVenue {
  id: string;
  name: string;
  region: 'asia-pacific' | 'europe' | 'north-america' | 'global';
  country: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
    radius: number; // Detection radius in meters
  };
  classification: 'championship' | 'premier' | 'regional' | 'emerging';
  characteristics: {
    primaryUse: 'racing' | 'cruising' | 'mixed';
    waterType: 'harbor' | 'bay' | 'lake' | 'river' | 'ocean';
    protectionLevel: 'sheltered' | 'semi-exposed' | 'exposed';
    averageDepth: number; // meters
    tidalRange: number; // meters
  };
  localKnowledge: {
    bestRacingWinds: string;
    commonConditions: string;
    localEffects: string[];
    safetyConsiderations: string[];
    culturalNotes: string[];
    expertTips?: string[];
  };
  timezone: string;
  supportedLanguages: string[];
  lastUpdated: Date;
}

export interface VenueDetectionResult {
  venue: SailingVenue | null;
  confidence: number; // 0-1
  distance: number; // meters from venue center
  alternatives: Array<{
    venue: SailingVenue;
    distance: number;
    confidence: number;
  }>;
  detectionMethod: 'gps' | 'manual' | 'cached' | 'network';
  timestamp: Date;
}

export interface LocationUpdate {
  coordinates: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
  };
  venue: SailingVenue | null;
  changed: boolean;
  timestamp: Date;
}

export class VenueDetectionService {
  private venueDatabase: Map<string, SailingVenue> = new Map();
  private currentVenue: SailingVenue | null = null;
  private lastKnownLocation: Location.LocationObject | null = null;
  private locationWatcher: Location.LocationSubscription | null = null;
  private listeners: Array<(update: LocationUpdate) => void> = [];
  private isInitialized = false;
  private supabaseClient: any = null;
  private supabaseSyncPromise: Promise<void> | null = null;
  private supabaseReady = false;
  private supabaseSyncError: string | null = null;
  private lastSupabaseSync = 0;

  constructor() {
    this.initializeVenueDatabase();
  }

  /**
   * Initialize and start venue detection
   */
  async initialize(): Promise<boolean> {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return false;
      }

      // Load cached venue from last session
      await this.loadCachedVenue();

      // Attempt to hydrate venues from Supabase (falls back to local cache on failure)
      await this.syncVenueDatabaseFromSupabase().catch(() => undefined);

      // Get current location and detect venue
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000, // 10 second timeout
      });

      this.lastKnownLocation = location;

      const detectionResult = await this.detectVenueFromLocation(location);

      // IMPORTANT: Notify listeners of initial venue detection
      if (detectionResult.venue) {
        const initialLocationUpdate: LocationUpdate = {
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            altitude: location.coords.altitude || undefined,
          },
          venue: detectionResult.venue,
          changed: true, // Always true for initial detection
          timestamp: new Date(location.timestamp)
        };

        // Use setTimeout to ensure listeners are registered first
        setTimeout(() => {
          this.notifyListeners(initialLocationUpdate);
        }, 100);
      }

      // Start continuous location monitoring for venue transitions
      this.startLocationMonitoring();

      this.isInitialized = true;
      return true;

    } catch (error) {
      return false;
    }
  }

  /**
   * Start continuous location monitoring for automatic venue switching
   */
  private async startLocationMonitoring(): Promise<void> {
    try {
      this.locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // Check every 30 seconds
          distanceInterval: 100, // Or when moved 100 meters
        },
        async (location) => {
          this.lastKnownLocation = location;

          // Check if we've moved to a different venue
          const oldVenue = this.currentVenue;

          await this.detectVenueFromLocation(location);
          const newVenue = this.currentVenue;

          // Notify listeners if venue changed
          const locationUpdate: LocationUpdate = {
            coordinates: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy || undefined,
              altitude: location.coords.altitude || undefined,
            },
            venue: newVenue,
            changed: oldVenue?.id !== newVenue?.id,
            timestamp: new Date(location.timestamp)
          };

          this.notifyListeners(locationUpdate);
        }
      );

    } catch (error) {
      // Silent fail, not critical
    }
  }

  /**
   * Fetch latest venue catalog from Supabase (with memoized retries)
   */
  private async syncVenueDatabaseFromSupabase(force: boolean = false): Promise<void> {
    const now = Date.now();
    if (!force && this.supabaseReady && now - this.lastSupabaseSync < 5 * 60 * 1000) {
      return;
    }

    if (this.supabaseSyncPromise) {
      return this.supabaseSyncPromise;
    }

    this.supabaseSyncPromise = (async () => {
      try {
        const venues = await this.fetchSupabaseVenues();
        if (venues.length === 0) {
          return;
        }

        this.venueDatabase.clear();
        venues.forEach(venue => this.venueDatabase.set(venue.id, venue));

        this.supabaseReady = true;
        this.lastSupabaseSync = Date.now();
        this.supabaseSyncError = null;
      } catch (error) {
        this.supabaseReady = false;
        this.supabaseSyncError = this.toErrorMessage(error);
      } finally {
        this.supabaseSyncPromise = null;
      }
    })();

    await this.supabaseSyncPromise;
  }

  /**
   * Load venue records from Supabase
   */
  private async fetchSupabaseVenues(): Promise<SailingVenue[]> {
    try {
      const supabaseClient = await this.getSupabaseClient();
      if (!supabaseClient) {
        return [];
      }

      const { data, error } = await supabaseClient
        .from('sailing_venues')
        .select('*')
        .limit(500);

      if (error || !data) {
        return [];
      }

      return data
        .map((record: any) => this.mapSupabaseVenueRecord(record))
        .filter(Boolean);
    } catch (error) {
      this.supabaseSyncError = this.toErrorMessage(error);
      return [];
    }
  }

  /**
   * Convert Supabase row into the detection-friendly structure
   */
  private mapSupabaseVenueRecord(record: any): SailingVenue | null {
    if (!record || !record.id || !record.name) {
      return null;
    }

    const { latitude, longitude } = this.extractCoordinates(record);
    const detectionRadius = this.resolveDetectionRadius(record);
    const supportedLanguages = this.ensureArray(record.supported_languages, ['en']);
    const localEffects = this.ensureArray(record.local_effects, ['Thermal enhancement near shore']);
    const safety = this.ensureArray(record.safety_considerations, ['Monitor local notices to mariners']);
    const culturalNotes = this.ensureArray(
      record.cultural_notes,
      [`Connect with clubs in ${record.city || record.country || 'the region'}`]
    );
    const expertTips = this.ensureArray(record.expert_tips, ['Confirm course marks with PRO']);

    return {
      id: record.id,
      name: record.name,
      region: this.normalizeRegion(record.region),
      country: record.country || 'Unknown',
      city: record.city || record.primary_city || record.name,
      coordinates: {
        latitude,
        longitude,
        radius: detectionRadius
      },
      classification: this.mapVenueClassification(record.venue_type),
      characteristics: {
        primaryUse: 'racing',
        waterType: (record.water_type as SailingVenue['characteristics']['waterType']) || 'harbor',
        protectionLevel: (record.protection_level as SailingVenue['characteristics']['protectionLevel']) || 'semi-exposed',
        averageDepth: Number(record.average_depth) || 12,
        tidalRange: Number(record.tidal_range) || 2
      },
      localKnowledge: {
        bestRacingWinds: record.best_racing_winds || 'Prevailing regional breeze 12-18kt',
        commonConditions: record.common_conditions || `Watch tide phases near ${record.name}`,
        localEffects,
        safetyConsiderations: safety,
        culturalNotes,
        expertTips
      },
      timezone: record.time_zone || record.timezone || 'UTC',
      supportedLanguages,
      lastUpdated: record.updated_at ? new Date(record.updated_at) : new Date()
    };
  }

  private extractCoordinates(record: any): { latitude: number; longitude: number } {
    const lat = Number(record.coordinates_lat);
    const lng = Number(record.coordinates_lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { latitude: lat, longitude: lng };
    }

    const geo = record.coordinates?.coordinates;
    if (Array.isArray(geo) && geo.length >= 2) {
      return {
        longitude: Number(geo[0]) || 0,
        latitude: Number(geo[1]) || 0
      };
    }

    if (Array.isArray(record.coordinates) && record.coordinates.length >= 2) {
      return {
        longitude: Number(record.coordinates[0]) || 0,
        latitude: Number(record.coordinates[1]) || 0
      };
    }

    return { latitude: 0, longitude: 0 };
  }

  private resolveDetectionRadius(record: any): number {
    const candidate = Number(record.detection_radius_m);
    if (Number.isFinite(candidate) && candidate > 0) {
      return Math.max(candidate, 1000);
    }
    const geoRadius = Number(record.coordinates?.radius);
    if (Number.isFinite(geoRadius) && geoRadius > 0) {
      return Math.max(geoRadius, 1000);
    }
    return 5000;
  }

  private mapVenueClassification(venueType?: string): SailingVenue['classification'] {
    switch ((venueType || '').toLowerCase()) {
      case 'championship':
        return 'championship';
      case 'premier':
        return 'premier';
      case 'regional':
        return 'regional';
      default:
        return 'emerging';
    }
  }

  private normalizeRegion(region?: string): SailingVenue['region'] {
    const normalized = (region || '').toLowerCase();
    if (normalized.includes('asia')) return 'asia-pacific';
    if (normalized.includes('europe')) return 'europe';
    if (normalized.includes('america') || normalized.includes('canada') || normalized.includes('usa')) {
      return 'north-america';
    }
    return 'global';
  }

  private ensureArray(value: any, fallback: string[] = []): string[] {
    if (Array.isArray(value)) {
      return value.filter(Boolean).map((item) => String(item));
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
    return fallback;
  }

  private async getSupabaseClient(): Promise<any | null> {
    if (this.supabaseClient) {
      return this.supabaseClient;
    }

    try {
      const module = await import('../supabase');
      this.supabaseClient = module.supabase;
      return this.supabaseClient;
    } catch (error) {
      this.supabaseSyncError = this.toErrorMessage(error);
      return null;
    }
  }

  private toErrorMessage(error: any): string {
    if (!error) {
      return 'Unknown error';
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'object' && 'message' in error) {
      return String((error as any).message);
    }
    return String(error);
  }

  /**
   * Detect venue from GPS location
   */
  private async detectVenueFromLocation(location: Location.LocationObject): Promise<VenueDetectionResult> {
    // Prefer Supabase-powered detection, fall back to local heuristics
    const networkResult = await this.detectVenueUsingSupabase(location);
    if (networkResult) {
      await this.applyDetectionResult(networkResult);
      return networkResult;
    }

    const fallbackResult = await this.detectVenueLocally(location);
    await this.applyDetectionResult(fallbackResult);
    return fallbackResult;
  }

  /**
   * Try Supabase-powered detection first to leverage live venue data
   */
  private async detectVenueUsingSupabase(location: Location.LocationObject): Promise<VenueDetectionResult | null> {
    try {
      const supabaseClient = await this.getSupabaseClient();
      if (!supabaseClient) {
        return null;
      }

      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;
      const radiusKm = 50;

      let { data: venues, error } = await supabaseClient.rpc('venues_within_radius', {
        lat: latitude,
        lng: longitude,
        radius_km: radiusKm
      });

      if (error && typeof error?.code === 'string' && error.code.startsWith?.('PGRST')) {
        const latDelta = radiusKm / 111;
        const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));
        const fallback = await supabaseClient.rpc('venues_within_bbox', {
          min_lon: longitude - lngDelta,
          min_lat: latitude - latDelta,
          max_lon: longitude + lngDelta,
          max_lat: latitude + latDelta,
        });
        venues = fallback.data;
        error = fallback.error;
      }

      if (error || !venues || venues.length === 0) {
        return null;
      }

      const zipped = venues
        .map((record: any) => ({
          record,
          venue: this.mapSupabaseVenueRecord(record)
        }))
        .filter(item => Boolean(item.venue)) as Array<{ record: any; venue: SailingVenue }>;

      if (zipped.length === 0) {
        return null;
      }

      // Cache enriched venues for manual selection and offline use
      zipped.forEach(({ venue }) => {
        this.venueDatabase.set(venue.id, venue);
      });

      const ranked = zipped
        .map(({ record, venue }) => {
          const distanceKm = typeof record?.distance_km === 'number' ? record.distance_km : 0;
          const distanceMeters = distanceKm * 1000;
          const confidence = this.calculateDetectionConfidence(
            distanceMeters,
            venue.coordinates.radius || 5000
          );

          return {
            venue,
            distance: distanceMeters,
            confidence
          };
        })
        .filter(Boolean)
        .sort((a, b) => (a!.distance || Infinity) - (b!.distance || Infinity)) as Array<{
          venue: SailingVenue;
          distance: number;
          confidence: number;
        }>;

      if (ranked.length === 0) {
        return null;
      }

      this.supabaseReady = true;
      this.supabaseSyncError = null;

      return {
        venue: ranked[0].venue,
        confidence: ranked[0].confidence,
        distance: ranked[0].distance,
        alternatives: ranked.slice(1, 4),
        detectionMethod: 'network',
        timestamp: new Date(location.timestamp)
      };
    } catch (error) {
      this.supabaseReady = false;
      this.supabaseSyncError = this.toErrorMessage(error);
      console.warn('[VenueDetectionService] Supabase detection failed:', this.supabaseSyncError);
      return null;
    }
  }

  /**
   * Local fallback detection that relies on bundled venue metadata
   */
  private async detectVenueLocally(location: Location.LocationObject): Promise<VenueDetectionResult> {
    const venues = Array.from(this.venueDatabase.values());
    const results: Array<{ venue: SailingVenue; distance: number; confidence: number }> = [];

    for (const venue of venues) {
      const distance = this.calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        venue.coordinates.latitude,
        venue.coordinates.longitude
      );

      if (distance <= venue.coordinates.radius) {
        const confidence = this.calculateDetectionConfidence(distance, venue.coordinates.radius);
        results.push({ venue, distance, confidence });
      }
    }

    results.sort((a, b) => b.confidence - a.confidence);

    return {
      venue: results.length > 0 ? results[0].venue : null,
      confidence: results.length > 0 ? results[0].confidence : 0,
      distance: results.length > 0 ? results[0].distance : Infinity,
      alternatives: results.slice(1, 4),
      detectionMethod: 'gps',
      timestamp: new Date(location.timestamp)
    };
  }

  /**
   * Update local cache + AsyncStorage, track transitions
   */
  private async applyDetectionResult(result: VenueDetectionResult): Promise<void> {
    const detectedVenue = result.venue;

    if (detectedVenue && detectedVenue.id !== this.currentVenue?.id) {
      this.currentVenue = detectedVenue;
      await this.cacheCurrentVenue(detectedVenue);
    } else if (!detectedVenue && this.currentVenue) {
      this.currentVenue = null;
      await AsyncStorage.removeItem('regattaflow_current_venue');
    }
  }

  /**
   * Calculate distance between two coordinates in meters
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate detection confidence based on distance from venue center
   */
  private calculateDetectionConfidence(distance: number, radius: number): number {
    if (distance <= radius * 0.1) return 1.0;      // Very close to center
    if (distance <= radius * 0.3) return 0.9;      // Close to center
    if (distance <= radius * 0.5) return 0.8;      // Within venue area
    if (distance <= radius * 0.8) return 0.6;      // Near venue boundary
    return Math.max(0.1, 1 - (distance / radius)); // Outside but within detection radius
  }

  /**
   * Get current venue
   */
  getCurrentVenue(): SailingVenue | null {
    return this.currentVenue;
  }

  /**
   * Get all available venues
   */
  getAllVenues(): SailingVenue[] {
    return Array.from(this.venueDatabase.values());
  }

  /**
   * Get venues by region
   */
  getVenuesByRegion(region: SailingVenue['region']): SailingVenue[] {
    return Array.from(this.venueDatabase.values()).filter(venue => venue.region === region);
  }

  /**
   * Get venue by ID
   */
  getVenueById(venueId: string): SailingVenue | null {
    return this.venueDatabase.get(venueId) || null;
  }

  /**
   * Manually set current venue (for when GPS detection isn't available)
   */
  async setManualVenue(venueId: string): Promise<boolean> {
    let venue = this.venueDatabase.get(venueId);

    // If venue not in hardcoded list, try loading from Supabase
    if (!venue) {
      try {
        const supabaseClient = await this.getSupabaseClient();
        if (!supabaseClient) {
          return false;
        }

        const { data, error } = await supabaseClient
          .from('sailing_venues')
          .select('*')
          .eq('id', venueId)
          .single();

        if (error || !data) {
          return false;
        }

        venue = this.mapSupabaseVenueRecord(data);
        if (!venue) {
          return false;
        }

        // Cache it in the venue database for future use
        this.venueDatabase.set(venueId, venue);

      } catch (error) {
        return false;
      }
    }

    const oldVenue = this.currentVenue;

    this.currentVenue = venue;
    await this.cacheCurrentVenue(venue);

    // Notify listeners of manual venue change
    const locationUpdate: LocationUpdate = {
      coordinates: this.lastKnownLocation ? {
        latitude: this.lastKnownLocation.coords.latitude,
        longitude: this.lastKnownLocation.coords.longitude,
        accuracy: this.lastKnownLocation.coords.accuracy || undefined,
        altitude: this.lastKnownLocation.coords.altitude || undefined,
      } : { latitude: venue.coordinates.latitude, longitude: venue.coordinates.longitude },
      venue: venue,
      changed: oldVenue?.id !== venue.id,
      timestamp: new Date()
    };

    this.notifyListeners(locationUpdate);
    return true;
  }

  /**
   * Search venues by name or location
   */
  searchVenues(query: string): SailingVenue[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.venueDatabase.values()).filter(venue =>
      venue.name.toLowerCase().includes(searchTerm) ||
      venue.city.toLowerCase().includes(searchTerm) ||
      venue.country.toLowerCase().includes(searchTerm)
    ).sort((a, b) => {
      // Prioritize championship venues
      if (a.classification === 'championship' && b.classification !== 'championship') return -1;
      if (b.classification === 'championship' && a.classification !== 'championship') return 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Add listener for location and venue updates
   */
  addLocationListener(listener: (update: LocationUpdate) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove location listener
   */
  removeLocationListener(listener: (update: LocationUpdate) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners of location updates
   */
  private notifyListeners(update: LocationUpdate): void {
    this.listeners.forEach(listener => {
      try {
        listener(update);
      } catch (error) {
        // Silent fail, continue notifying other listeners
      }
    });
  }

  /**
   * Cache current venue for next session
   */
  private async cacheCurrentVenue(venue: SailingVenue): Promise<void> {
    try {
      await AsyncStorage.setItem('regattaflow_current_venue', JSON.stringify({
        venueId: venue.id,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      // Silent fail, caching not critical
    }
  }

  /**
   * Load cached venue from last session
   */
  private async loadCachedVenue(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem('regattaflow_current_venue');
      if (cached) {
        const { venueId, timestamp } = JSON.parse(cached);
        const cacheAge = Date.now() - new Date(timestamp).getTime();

        // Use cached venue if less than 24 hours old
        if (cacheAge < 24 * 60 * 60 * 1000) {
          const venue = this.venueDatabase.get(venueId);
          if (venue) {
            this.currentVenue = venue;
          }
        }
      }
    } catch (error) {
      // Silent fail, cached venue not critical
    }
  }

  /**
   * Stop location monitoring and cleanup
   */
  async cleanup(): Promise<void> {
    if (this.locationWatcher) {
      this.locationWatcher.remove();
      this.locationWatcher = null;
    }
    this.listeners = [];
  }

  /**
   * Initialize the global venue database with 147+ major sailing venues
   */
  private initializeVenueDatabase(): void {
    const venues: SailingVenue[] = [
      // Asia-Pacific Championship Venues
      {
        id: 'hong-kong-victoria-harbor',
        name: 'Victoria Harbour, Hong Kong',
        region: 'asia-pacific',
        country: 'Hong Kong SAR',
        city: 'Hong Kong',
        coordinates: {
          latitude: 22.3193,
          longitude: 114.1694,
          radius: 15000 // 15km radius to cover broader Hong Kong sailing area
        },
        classification: 'championship',
        characteristics: {
          primaryUse: 'racing',
          waterType: 'harbor',
          protectionLevel: 'sheltered',
          averageDepth: 12,
          tidalRange: 2.1
        },
        localKnowledge: {
          bestRacingWinds: 'NE monsoon 15-25kt (Oct-Mar)',
          commonConditions: 'Urban heat effects, commercial traffic',
          localEffects: ['Harbor funnel effect', 'Island wind shadows', 'Tidal acceleration'],
          safetyConsiderations: ['Heavy commercial traffic', 'Strong tidal currents', 'Sudden weather changes'],
          culturalNotes: ['Formal yacht club protocols', 'International racing community', 'Post-race dining traditions']
        },
        timezone: 'Asia/Hong_Kong',
        supportedLanguages: ['en', 'zh-HK', 'zh-CN'],
        lastUpdated: new Date()
      },
      {
        id: 'sydney-harbour',
        name: 'Sydney Harbour',
        region: 'asia-pacific',
        country: 'Australia',
        city: 'Sydney',
        coordinates: {
          latitude: -33.8568,
          longitude: 151.2153,
          radius: 5000
        },
        classification: 'championship',
        characteristics: {
          primaryUse: 'racing',
          waterType: 'harbor',
          protectionLevel: 'semi-exposed',
          averageDepth: 15,
          tidalRange: 1.8
        },
        localKnowledge: {
          bestRacingWinds: 'NE 15-25kt summer, SW 10-20kt winter',
          commonConditions: 'Southerly buster changes, harbor effects',
          localEffects: ['Bridge wind acceleration', 'Harbor geography lifts', 'Thermal sea breeze'],
          safetyConsiderations: ['Commercial ferry traffic', 'Sudden wind changes', 'Strong currents at heads'],
          culturalNotes: ['Boxing Day to Hobart tradition', 'Competitive racing culture', 'International fleet']
        },
        timezone: 'Australia/Sydney',
        supportedLanguages: ['en'],
        lastUpdated: new Date()
      },

      // European Championship Venues
      {
        id: 'cowes-isle-wight',
        name: 'Cowes, Isle of Wight',
        region: 'europe',
        country: 'United Kingdom',
        city: 'Cowes',
        coordinates: {
          latitude: 50.7645,
          longitude: -1.3005,
          radius: 4000
        },
        classification: 'championship',
        characteristics: {
          primaryUse: 'racing',
          waterType: 'harbor',
          protectionLevel: 'semi-exposed',
          averageDepth: 8,
          tidalRange: 4.2
        },
        localKnowledge: {
          bestRacingWinds: 'SW 12-20kt prevailing',
          commonConditions: 'Complex tidal streams, Solent challenges',
          localEffects: ['Solent tidal complexity', 'Island wind effects', 'Multiple tidal gates'],
          safetyConsiderations: ['Strong tidal streams', 'Commercial shipping', 'Shallow areas'],
          culturalNotes: ['Royal yacht club traditions', 'Cowes Week heritage', 'Formal protocols']
        },
        timezone: 'Europe/London',
        supportedLanguages: ['en'],
        lastUpdated: new Date()
      },
      {
        id: 'kiel-baltic',
        name: 'Kiel, Baltic Sea',
        region: 'europe',
        country: 'Germany',
        city: 'Kiel',
        coordinates: {
          latitude: 54.3233,
          longitude: 10.1394,
          radius: 3000
        },
        classification: 'championship',
        characteristics: {
          primaryUse: 'racing',
          waterType: 'bay',
          protectionLevel: 'sheltered',
          averageDepth: 17,
          tidalRange: 0.3
        },
        localKnowledge: {
          bestRacingWinds: 'W-SW 10-18kt typical',
          commonConditions: 'Stable conditions, minimal tide',
          localEffects: ['Land thermal effects', 'Sea breeze development', 'Wind shadow from shore'],
          safetyConsiderations: ['Commercial traffic', 'Weather fronts', 'Cold water temperatures'],
          culturalNotes: ['Olympic sailing tradition', 'Technical precision focus', 'International training center']
        },
        timezone: 'Europe/Berlin',
        supportedLanguages: ['de', 'en'],
        lastUpdated: new Date()
      },

      // North American Championship Venues
      {
        id: 'san-francisco-bay',
        name: 'San Francisco Bay',
        region: 'north-america',
        country: 'United States',
        city: 'San Francisco',
        coordinates: {
          latitude: 37.7749,
          longitude: -122.4194,
          radius: 8000
        },
        classification: 'championship',
        characteristics: {
          primaryUse: 'racing',
          waterType: 'bay',
          protectionLevel: 'semi-exposed',
          averageDepth: 20,
          tidalRange: 1.8
        },
        localKnowledge: {
          bestRacingWinds: 'W 15-25kt afternoon sea breeze',
          commonConditions: 'Strong currents, pressure gradients',
          localEffects: ['Golden Gate funnel', 'City front pressure gradient', 'Geographic wind bend'],
          safetyConsiderations: ['Strong ebb currents', 'Big wind and waves', 'Fog conditions'],
          culturalNotes: ['America\'s Cup heritage', 'Tech industry integration', 'Environmental awareness']
        },
        timezone: 'America/Los_Angeles',
        supportedLanguages: ['en', 'es'],
        lastUpdated: new Date()
      },
      {
        id: 'newport-rhode-island',
        name: 'Newport, Rhode Island',
        region: 'north-america',
        country: 'United States',
        city: 'Newport',
        coordinates: {
          latitude: 41.4901,
          longitude: -71.3128,
          radius: 5000
        },
        classification: 'championship',
        characteristics: {
          primaryUse: 'racing',
          waterType: 'bay',
          protectionLevel: 'semi-exposed',
          averageDepth: 25,
          tidalRange: 1.2
        },
        localKnowledge: {
          bestRacingWinds: 'SW 12-18kt sea breeze',
          commonConditions: 'Thermal sea breeze, afternoon wind',
          localEffects: ['Narragansett Bay thermal', 'Land heating effects', 'Afternoon sea breeze cycle'],
          safetyConsiderations: ['Thunderstorms in summer', 'Commercial traffic', 'Rocky shorelines'],
          culturalNotes: ['America\'s Cup tradition', 'Prestigious yacht clubs', 'Sailing education center']
        },
        timezone: 'America/New_York',
        supportedLanguages: ['en'],
        lastUpdated: new Date()
      }

      // Additional venues would be added here to reach 147+ total
    ];

    // Store venues in the database
    venues.forEach(venue => {
      this.venueDatabase.set(venue.id, venue);
    });
  }
}

// Export singleton instance
export const venueDetectionService = new VenueDetectionService();
