/**
 * Sailing Network Service
 * Unified service for managing all "places" in a sailor's network
 * (venues, yacht clubs, sailmakers, chandlers, coaches, etc.)
 */
export type ServiceType = 'venue' | 'yacht_club' | 'sailmaker' | 'chandler' | 'rigger' | 'coach' | 'marina' | 'repair' | 'engine' | 'clothing' | 'other';
export interface NetworkPlace {
    id: string;
    type: ServiceType;
    name: string;
    country: string;
    location: {
        name: string;
        region: string;
    };
    coordinates: {
        lat: number;
        lng: number;
    };
    isSaved: boolean;
    savedId?: string;
    notes?: string;
    isHomeVenue?: boolean;
}
export interface LocationSummary {
    name: string;
    region: string;
    savedCount: number;
    hasHomeVenue: boolean;
    serviceTypes: ServiceType[];
}
export interface LocationContext {
    locationName: string;
    locationRegion: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    detectionMethod: 'gps' | 'manual' | 'calendar';
}
export declare class SailingNetworkService {
    /**
     * Get user's saved network for a specific location
     */
    static getMyNetwork(locationName?: string): Promise<NetworkPlace[]>;
    /**
     * Discover places in a location (not yet saved)
     */
    static discoverInLocation(locationName: string, filters?: {
        serviceTypes?: ServiceType[];
        searchQuery?: string;
    }): Promise<NetworkPlace[]>;
    /**
     * Save a place to user's network
     */
    static saveToNetwork(placeId: string, type: ServiceType, location: {
        name: string;
        region: string;
    }, options?: {
        notes?: string;
        isHomeVenue?: boolean;
    }): Promise<void>;
    /**
     * Remove a place from user's network
     */
    static removeFromNetwork(placeId: string): Promise<void>;
    /**
     * Get summary of user's locations with saved place counts
     */
    static getMyLocations(): Promise<LocationSummary[]>;
    /**
     * Get user's current location context
     */
    static getCurrentLocationContext(): Promise<LocationContext | null>;
    /**
     * Set user's current location context
     */
    static setLocationContext(locationName: string, locationRegion: string, coordinates: {
        lat: number;
        lng: number;
    }, detectionMethod?: 'gps' | 'manual' | 'calendar'): Promise<void>;
    /**
     * Auto-save a place during onboarding or calendar setup
     */
    static autoSave(placeId: string, placeName: string, type: ServiceType, location: {
        name: string;
        region: string;
    }, coordinates: {
        lat: number;
        lng: number;
    }, isHome?: boolean): Promise<void>;
    /**
     * Check if a place is in user's network
     */
    static isInNetwork(placeId: string): Promise<boolean>;
    /**
     * Update place details in network
     */
    static updateNetworkPlace(placeId: string, updates: {
        notes?: string;
        isHomeVenue?: boolean;
    }): Promise<void>;
}
//# sourceMappingURL=SailingNetworkService.d.ts.map