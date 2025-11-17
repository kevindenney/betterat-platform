/**
 * Venue Intelligence Service
 * Saves and retrieves AI-generated venue insights to/from database
 */
export interface VenueInsights {
    venueId: string;
    venueName: string;
    analysis: string;
    generatedAt: string;
    intelligence?: any;
    recommendations: {
        safety: string;
        racing: string;
        cultural: string;
        practice: string;
        timing: string;
    };
}
export declare class VenueIntelligenceService {
    /**
     * Save AI-generated insights to venue_conditions table
     */
    saveVenueInsights(insights: VenueInsights): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Retrieve saved AI insights for a venue
     */
    getVenueInsights(venueId: string): Promise<VenueInsights | null>;
    /**
     * Check if AI insights exist for a venue
     */
    hasInsights(venueId: string): Promise<boolean>;
    /**
     * Delete AI insights for a venue (if user wants to regenerate)
     */
    deleteInsights(venueId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export declare const venueIntelligenceService: VenueIntelligenceService;
//# sourceMappingURL=VenueIntelligenceService.d.ts.map