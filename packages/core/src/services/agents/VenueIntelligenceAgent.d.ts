import { type VenueInsights } from '../VenueIntelligenceService';
import { BaseAgentService } from './BaseAgentService';
export declare class VenueIntelligenceAgent extends BaseAgentService {
    private regionalIntelligenceService;
    constructor();
    /**
     * Tool: Detect venue from GPS coordinates
     */
    private createDetectVenueTool;
    /**
     * Tool: Load regional intelligence for venue
     */
    private createLoadIntelligenceTool;
    /**
     * Tool: Fetch regional weather data
     */
    private createFetchWeatherTool;
    /**
     * Tool: Apply cultural settings
     */
    private createApplyCulturalSettingsTool;
    /**
     * Tool: Cache offline data
     */
    private createCacheOfflineDataTool;
    /**
     * High-level method: Switch venue by GPS
     */
    switchVenueByGPS(coordinates: {
        latitude: number;
        longitude: number;
    }): Promise<import("./BaseAgentService").AgentRunResult>;
    /**
     * High-level method: Switch venue by manual selection
     */
    switchVenueBySelection(venueId: string): Promise<import("./BaseAgentService").AgentRunResult>;
    /**
     * High-level method: Refresh venue weather
     */
    refreshVenueWeather(venueId: string): Promise<import("./BaseAgentService").AgentRunResult>;
    /**
     * Check if cached insights exist for a venue (for current user)
     */
    getCachedInsights(venueId: string, userId: string): Promise<{
        insights: VenueInsights;
        generatedAt: string;
        expiresAt: string;
        tokensUsed: number;
        toolsUsed: string[];
    } | null>;
    /**
     * Cache venue insights for a user with performance tracking
     */
    cacheInsights(venueId: string, userId: string, insights: VenueInsights, metadata?: {
        tokensUsed?: number;
        toolsUsed?: string[];
        generationTimeMs?: number;
    }): Promise<void>;
    /**
     * Invalidate cache for a venue (force refresh)
     */
    invalidateCache(venueId: string, userId: string): Promise<void>;
    /**
     * High-level method: Analyze venue and provide AI insights
     * Returns safety recommendations, racing tips, cultural notes, practice areas
     * Checks cache first to avoid redundant AI calls
     */
    analyzeVenue(venueId: string, userId?: string, forceRefresh?: boolean): Promise<{
        success: boolean;
        insights: VenueInsights;
        fromCache: boolean;
        cacheAge: string;
        tokensUsed: number;
        toolsUsed: string[];
        generationTimeMs?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        insights: VenueInsights;
        fromCache: boolean;
        generationTimeMs: number;
        tokensUsed: any;
        toolsUsed: string[];
        cacheAge?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        insights?: undefined;
        fromCache?: undefined;
        cacheAge?: undefined;
        tokensUsed?: undefined;
        toolsUsed?: undefined;
        generationTimeMs?: undefined;
    }>;
    /**
     * Helper: Extract a section from AI response
     */
    private extractSection;
}
export default VenueIntelligenceAgent;
//# sourceMappingURL=VenueIntelligenceAgent.d.ts.map