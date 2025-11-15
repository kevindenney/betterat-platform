// @ts-nocheck
/**
 * Supabase Venue Intelligence Service
 * Integrates global venue database with Supabase for persistent storage and real-time updates
 * Leverages Supabase MCP for seamless database operations
 */

import type {
    Coordinates,
    SailingVenue,
    UserVenueProfile,
    VenueTransition,
    VenueType
} from '@/lib/types/global-venues';
import { supabase } from '../supabase';

export class SupabaseVenueService {
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private initializationFailed: boolean = false;
  private lastFailureTime: number = 0;
  private failureCount: number = 0;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly FAILURE_COOLDOWN_MS = 30000; // 30 seconds

  constructor() {
  }

  private handleSupabaseError(operation: string, error: any): never {
    const message = error?.message ?? 'Unknown Supabase error';
    console.error(`[SupabaseVenueService] ${operation} failed:`, error);
    throw new Error(`${operation} failed: ${message}`);
  }

  /**
   * Initializes the Supabase schema used for venue intelligence data.
   * Applies a simple circuit breaker so UI components never block on setup during render.
   *
   * @throws Error when initialization is throttled or fails permanently.
   */
  async initializeVenueSchema(): Promise<void> {
    // Return cached initialization if already completed
    if (this.isInitialized) {
      return;
    }

    // Circuit breaker: Check if we're in failure cooldown period
    const now = Date.now();
    if (this.initializationFailed && (now - this.lastFailureTime) < this.FAILURE_COOLDOWN_MS) {
      const remainingTime = Math.round((this.FAILURE_COOLDOWN_MS - (now - this.lastFailureTime)) / 1000);
      throw new Error(`Circuit breaker: Retrying in ${remainingTime} seconds`);
    }

    // Circuit breaker: Check if we've exceeded max retry attempts
    if (this.failureCount >= this.MAX_RETRY_ATTEMPTS) {
      throw new Error(`Circuit breaker: Max retry attempts exceeded`);
    }

    // Return ongoing initialization promise if already in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Create and cache the initialization promise
    this.initializationPromise = this._performInitialization();

    try {
      await this.initializationPromise;
      this.isInitialized = true;
      this.initializationFailed = false;
      this.failureCount = 0; // Reset failure count on success

    } catch (error) {
      this.initializationPromise = null; // Reset on failure to allow retry
      this.initializationFailed = true;
      this.lastFailureTime = Date.now();
      this.failureCount++;
      throw error;
    }
  }

  /**
   * Internal initialization method
   */
  private async _performInitialization(): Promise<void> {
    try {
      const { error: existenceError } = await supabase
        .from('sailing_venues')
        .select('id')
        .limit(1);

      if (existenceError) {
        if (existenceError.code === 'PGRST205') {
          await this.seedGlobalVenues();
          return;
        }
        this.handleSupabaseError('Check sailing_venues existence', existenceError);
      }

      const { count, error: countError } = await supabase
        .from('sailing_venues')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        this.handleSupabaseError('Count sailing_venues rows', countError);
      }

      if (count && count >= 12) {
        return;
      }

      await this.seedGlobalVenues();

    } catch (error: any) {
      throw new Error(`Schema initialization failed: ${error.message}`);
    }
  }

  /**
   * Finds the closest venue around the provided coordinates using Supabase RPC.
   *
   * @param coordinates Tuple of [lng, lat].
   * @param radiusKm Radius (km) to search.
   * @param userId Optional user for analytics tracking.
   * @returns Matching venue or null when none detected.
   */
  async findVenueByLocation(
    coordinates: Coordinates,
    radiusKm: number = 50,
    userId?: string
  ): Promise<SailingVenue | null> {
    const [longitude, latitude] = coordinates;


    try {
      // Use PostGIS for geographic queries
      const { data, error } = await supabase.rpc('find_venues_by_location', {
        lat: latitude,
        lng: longitude,
        radius_km: radiusKm
      });

      if (error) this.handleSupabaseError('RPC find_venues_by_location', error);

      if (data && data.length > 0) {
        const venue = data[0] as SailingVenue;

        // Track venue detection if user provided
        if (userId) {
          await this.trackVenueDetection(userId, venue.id, 'gps', data[0].distance_km);
        }

        return venue;
      }

      return null;

    } catch (error: any) {

      throw new Error(`Location-based venue search failed: ${error.message}`);
    }
  }

  /**
   * Returns every venue row along with club metadata for the map UI.
   *
   * @returns Array of transformed `SailingVenue` entries or empty list when unavailable.
   */
  async getAllVenues(): Promise<SailingVenue[]> {
    // CRITICAL FIX: Always return empty array if initialization has failed
    // This prevents any component re-renders that could cause infinite loops
    if (this.initializationFailed) {
      return [];
    }

    // CRITICAL FIX: If not initialized, return empty array immediately
    // Do NOT attempt initialization during component render cycles
    if (!this.isInitialized) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('sailing_venues')
        .select(`
          *,
          yacht_clubs (*)
        `)
        .order('name');

      if (error) {
        this.handleSupabaseError('Fetch sailing_venues list', error);
      }

      if (data && data.length > 0) {

        // Transform to match our SailingVenue interface
        const venues: SailingVenue[] = data.map(venue => ({
          id: venue.id,
          name: venue.name,
          coordinates: [venue.coordinates_lng, venue.coordinates_lat],
          country: venue.country,
          region: venue.region,
          venueType: venue.venue_type,
          establishedYear: venue.established_year,
          timeZone: venue.time_zone,
          primaryClubs: [],
          sailingConditions: {
            windPatterns: [],
            typicalConditions: {
              windSpeed: { min: 5, max: 25, average: 15 },
              windDirection: { primary: 180 },
              waveHeight: { typical: 1, maximum: 3 },
              visibility: { typical: 10, minimum: 2 }
            },
            seasonalVariations: [],
            hazards: [],
            racingAreas: []
          },
          culturalContext: {
            primaryLanguages: [{ code: 'en', name: 'English', prevalence: 'primary' }],
            sailingCulture: {
              tradition: 'established',
              competitiveness: 'regional',
              formality: 'relaxed',
              inclusivity: 'welcoming',
              characteristics: []
            },
            racingCustoms: [],
            socialProtocols: [],
            economicFactors: {
              currency: 'USD',
              costLevel: 'moderate',
              entryFees: { typical: 200, range: { min: 100, max: 500 } },
              accommodation: { budget: 100, moderate: 200, luxury: 400 },
              dining: { budget: 20, moderate: 50, upscale: 100 },
              services: { rigger: 200, sail_repair: 150, chandlery: 'moderate' },
              tipping: { expected: false, contexts: [] }
            },
            regulatoryEnvironment: {
              racingRules: { authority: 'World Sailing', variations: [] },
              safetyRequirements: [],
              environmentalRestrictions: [],
              entryRequirements: []
            }
          },
          weatherSources: {
            primary: {
              name: 'Generic Weather Service',
              type: 'global_model',
              region: venue.region,
              accuracy: 'moderate',
              forecastHorizon: 72,
              updateFrequency: 6,
              specialties: []
            },
            secondary: [],
            updateFrequency: 6,
            reliability: 0.8
          },
          localServices: [],
          createdAt: new Date(venue.created_at),
          updatedAt: new Date(venue.updated_at),
          dataQuality: (venue.data_quality as 'verified' | 'community' | 'estimated') || 'estimated'
        }));

        return venues;
      }

      return [];

    } catch (error: any) {

      throw new Error(`Failed to load venues from database: ${error.message}`);
    }
  }

  /**
   * Loads a single venue plus its related intelligence tables.
   *
   * @param venueId Venue identifier.
   * @param userId Optional user to scope profile joins.
   * @returns Venue payload or null when not found.
   */
  async getVenueWithIntelligence(venueId: string, userId?: string): Promise<SailingVenue | null> {

    try {
      const { data, error } = await supabase
        .from('sailing_venues')
        .select(`
          *,
          yacht_clubs (*),
          venue_conditions (*),
          cultural_profiles (*),
          weather_sources (*),
          user_venue_profiles!inner (
            familiarity_level,
            visit_count,
            last_visit,
            racing_history,
            preferences
          )
        `)
        .eq('id', venueId)
        .eq('user_venue_profiles.user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        this.handleSupabaseError('Fetch venue intelligence', error);
      }

      if (data) {
        return data as SailingVenue;
      }

      // If no user profile exists, get venue without user data
      const { data: venueData, error: venueError } = await supabase
        .from('sailing_venues')
        .select(`
          *,
          yacht_clubs (*),
          venue_conditions (*),
          cultural_profiles (*),
          weather_sources (*)
        `)
        .eq('id', venueId)
        .single();

      if (venueError) {
        this.handleSupabaseError('Fetch venue without profile join', venueError);
      }

      return venueData as SailingVenue;

    } catch (error: any) {
      console.error('[SupabaseVenueService] getVenueWithIntelligence failed:', error);
      return null;
    }
  }

  /**
   * Performs a fuzzy Supabase text search across venues.
   *
   * @param query Free-form text.
   * @param filters Optional filters for venue type/region/country.
   * @returns Matching venue results (empty when none/error).
   */
  async searchVenues(
    query: string,
    filters?: {
      venueType?: VenueType[];
      region?: string;
      country?: string;
      limit?: number;
    }
  ): Promise<SailingVenue[]> {

    try {
      let queryBuilder = supabase
        .from('sailing_venues')
        .select(`
          *,
          yacht_clubs (*)
        `);

      // Add text search
      if (query.trim()) {
        queryBuilder = queryBuilder.textSearch('search_vector', query, {
          type: 'websearch',
          config: 'english'
        });
      }

      // Add filters
      if (filters?.venueType) {
        queryBuilder = queryBuilder.in('venue_type', filters.venueType);
      }
      if (filters?.region) {
        queryBuilder = queryBuilder.eq('region', filters.region);
      }
      if (filters?.country) {
        queryBuilder = queryBuilder.eq('country', filters.country);
      }

      // Limit results
      queryBuilder = queryBuilder.limit(filters?.limit || 20);

      const { data, error } = await queryBuilder;

      if (error) this.handleSupabaseError('Search sailing_venues', error);

      return (data || []) as SailingVenue[];

    } catch (error: any) {
      console.error('[SupabaseVenueService] searchVenues failed:', error);
      return [];
    }
  }

  /**
   * Uses Supabase RPC to find venues near a coordinate.
   *
   * @param coordinates Tuple [lng, lat].
   * @param maxDistanceKm Maximum distance in km.
   * @param limit Max rows to return.
   */
  async getNearbyVenues(
    coordinates: Coordinates,
    maxDistanceKm: number = 500,
    limit: number = 10
  ): Promise<Array<SailingVenue & { distance_km: number }>> {
    const [longitude, latitude] = coordinates;


    try {
      const { data, error } = await supabase.rpc('get_nearby_venues', {
        lat: latitude,
        lng: longitude,
        max_distance_km: maxDistanceKm,
        result_limit: limit
      });

      if (error) this.handleSupabaseError('RPC get_nearby_venues', error);

      return data || [];

    } catch (error: any) {
      console.error('[SupabaseVenueService] getNearbyVenues failed:', error);
      return [];
    }
  }

  /**
   * Create or update user venue profile
   */
  private async upsertUserVenueProfile(
    userId: string,
    venueId: string,
    updates: Partial<UserVenueProfile>
  ): Promise<UserVenueProfile | null> {

    const { data, error } = await supabase
      .from('user_venue_profiles')
      .upsert({
        user_id: userId,
        venue_id: venueId,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) this.handleSupabaseError('Upsert user_venue_profiles', error);

    return data as UserVenueProfile;
  }

  /**
   * Records a venue transition plus updates visit counters for the destination.
   *
   * @param userId Authenticated user.
   * @param transition Venue transition payload without timestamp.
   * @throws Error when Supabase insert or profile update fails.
   */
  async recordVenueTransition(
    userId: string,
    transition: Omit<VenueTransition, 'transitionDate'>
  ): Promise<void> {

    try {
      const { error } = await supabase
        .from('venue_transitions')
        .insert({
          user_id: userId,
          from_venue_id: transition.fromVenue?.id,
          to_venue_id: transition.toVenue.id,
          transition_type: transition.transitionType,
          transition_date: new Date().toISOString(),
          adaptation_required: transition.adaptationRequired?.length > 0,
          metadata: {
            adaptations: transition.adaptationRequired,
            cultural_briefing: transition.culturalBriefing
          }
        });

      if (error) this.handleSupabaseError('Insert venue_transitions', error);

      await this.upsertUserVenueProfile(userId, transition.toVenue.id, {
        visitCount: 1, // This will be incremented by DB function
        lastVisit: new Date()
      });

    } catch (error: any) {
      console.error('[SupabaseVenueService] recordVenueTransition failed:', error);
      throw error instanceof Error ? error : new Error('Failed to record venue transition');
    }
  }

  /**
   * Track venue detection event
   */
  private async trackVenueDetection(
    userId: string,
    venueId: string,
    method: 'gps' | 'network' | 'manual',
    accuracy?: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('venue_detections')
        .insert({
          user_id: userId,
          venue_id: venueId,
          detection_method: method,
          accuracy_meters: accuracy ? accuracy * 1000 : null,
          detected_at: new Date().toISOString()
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.warn('[SupabaseVenueService] trackVenueDetection insert failed:', error);
      }
    } catch (error) {
      console.warn('[SupabaseVenueService] trackVenueDetection error:', error);
    }
  }

  /**
   * Seed database with initial global venues (cached to prevent repeated seeding)
   */
  private async seedGlobalVenues(): Promise<void> {
    try {
      // Check if the table exists first
      const { error: testError } = await supabase
        .from('sailing_venues')
        .select('id')
        .limit(1);

      if (testError && testError.code === 'PGRST205') {
        // Table doesn't exist - set up the database directly
        const { setupSupabaseDatabase } = await import('@/scripts/setup-supabase-db');
        await setupSupabaseDatabase();
        return;
      }

      if (testError) {
        throw testError;
      }

      // Table exists, check if we need to add more data
      const { count, error: countError } = await supabase
        .from('sailing_venues')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw countError;
      }

      if (count && count >= 12) {
        return;
      }

      // Need more data, run the seeding ONCE
      const { seedVenueDatabase } = await import('@/scripts/seed-venues');
      await seedVenueDatabase();

    } catch (error: any) {
      console.error('[SEED DEBUG] Failed to seed venues:', error.message);

      // Don't throw - allow app to continue with empty venues

    }
  }
}

// Export singleton instance
export const supabaseVenueService = new SupabaseVenueService();
