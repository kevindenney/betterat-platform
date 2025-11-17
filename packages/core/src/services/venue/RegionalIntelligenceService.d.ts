/**
 * Regional Intelligence Service
 * Provides venue-specific intelligence, weather integration, and cultural adaptation
 * Core of the "OnX Maps for Sailing" global intelligence system
 */
import type { SailingVenue, CulturalBriefing } from '../../lib/types/global-venues';
export interface RegionalIntelligenceData {
    venue: SailingVenue;
    weatherIntelligence: WeatherIntelligence;
    tacticalIntelligence: TacticalIntelligence;
    culturalIntelligence: CulturalIntelligence;
    logisticalIntelligence: LogisticalIntelligence;
    lastUpdated: Date;
}
export interface WeatherIntelligence {
    currentConditions: {
        windSpeed: number;
        windDirection: number;
        gusts: number;
        temperature: number;
        barometricPressure: number;
        visibility: number;
    };
    forecast: WeatherForecast[];
    localPatterns: LocalWeatherPattern[];
    racingRecommendations: string[];
}
export interface WeatherForecast {
    time: Date;
    windSpeed: number;
    windDirection: number;
    gusts: number;
    confidence: number;
    racingConditions: 'excellent' | 'good' | 'challenging' | 'difficult';
}
export interface LocalWeatherPattern {
    name: string;
    description: string;
    indicators: string[];
    racingImplications: string;
    seasonality: string[];
}
export interface TacticalIntelligence {
    courseKnowledge: CourseKnowledge[];
    localTactics: LocalTactic[];
    equipmentRecommendations: RegionalEquipmentRecommendation[];
    performanceFactors: PerformanceFactor[];
}
export interface CourseKnowledge {
    courseName: string;
    layout: string;
    keyFeatures: string[];
    tacticalConsiderations: string[];
    historicalTrends: string[];
}
export interface LocalTactic {
    situation: string;
    recommendation: string;
    confidence: 'high' | 'moderate' | 'low';
    source: 'expert' | 'data_analysis' | 'community';
}
export interface RegionalEquipmentRecommendation {
    category: 'sails' | 'rigging' | 'electronics' | 'safety' | 'crew_gear';
    item: string;
    reasoning: string;
    priority: 'essential' | 'recommended' | 'optional';
    localAvailability: 'readily_available' | 'limited' | 'ship_in' | 'bring_own';
}
export interface PerformanceFactor {
    factor: string;
    impact: 'high' | 'moderate' | 'low';
    description: string;
    optimization: string;
}
export interface CulturalIntelligence {
    briefing: CulturalBriefing;
    protocolReminders: ProtocolReminder[];
    languageSupport: LanguageSupport;
    networkingOpportunities: NetworkingOpportunity[];
}
export interface ProtocolReminder {
    situation: string;
    protocol: string;
    importance: 'critical' | 'important' | 'helpful';
    timing: 'before_arrival' | 'on_arrival' | 'during_event' | 'after_event';
}
export interface LanguageSupport {
    primaryLanguage: string;
    translationAvailable: boolean;
    keyPhrases: {
        english: string;
        local: string;
        pronunciation?: string;
        context: string;
    }[];
    sailingTerminology: {
        term: string;
        localEquivalent: string;
        usage: string;
    }[];
}
export interface NetworkingOpportunity {
    type: 'social_event' | 'technical_seminar' | 'cultural_activity' | 'business_meeting';
    name: string;
    description: string;
    value: 'high' | 'moderate' | 'low';
    attendance: 'expected' | 'recommended' | 'optional';
}
export interface LogisticalIntelligence {
    transportation: TransportationIntel;
    accommodation: AccommodationIntel;
    services: ServiceIntel[];
    sailingServices?: SailingServices;
    costEstimates: RegionalCostEstimate[];
    timeline: LogisticalTimeline[];
}
export interface TransportationIntel {
    airport: string;
    transferOptions: TransferOption[];
    localTransport: LocalTransportOption[];
    equipmentShipping: EquipmentShippingOption[];
}
export interface TransferOption {
    method: string;
    duration: string;
    cost: number;
    convenience: 'high' | 'moderate' | 'low';
    notes?: string;
}
export interface LocalTransportOption {
    type: 'rental_car' | 'taxi' | 'rideshare' | 'public_transport' | 'shuttle';
    availability: 'excellent' | 'good' | 'limited' | 'poor';
    cost: 'low' | 'moderate' | 'high' | 'very_high';
    recommendation: string;
}
export interface EquipmentShippingOption {
    carrier: string;
    estimatedCost: number;
    transitTime: string;
    reliability: 'high' | 'moderate' | 'low';
    notes: string;
}
export interface AccommodationIntel {
    recommendedAreas: string[];
    options: AccommodationOption[];
    bookingAdvice: string[];
}
export interface AccommodationOption {
    type: 'hotel' | 'yacht_club' | 'private' | 'budget';
    name?: string;
    priceRange: {
        min: number;
        max: number;
    };
    pros: string[];
    cons: string[];
    sailorFriendly: boolean;
}
export interface ServiceIntel {
    category: 'rigging' | 'sail_repair' | 'boat_repair' | 'chandlery' | 'coaching' | 'yacht_clubs' | 'sailmakers' | 'foul_weather_gear';
    providers: RegionalServiceProvider[];
    recommendations: string[];
}
export interface RegionalServiceProvider {
    name: string;
    specialties: string[];
    reputation: 'excellent' | 'good' | 'average' | 'unknown';
    priceLevel: 'budget' | 'moderate' | 'premium';
    languages: string[];
    contact: string;
    location?: string;
    website?: string;
}
export interface RegionalCostEstimate {
    category: string;
    item: string;
    estimatedCost: number;
    currency: string;
    confidence: 'high' | 'moderate' | 'low';
    notes?: string;
}
export interface LogisticalTimeline {
    task: string;
    recommendedTiming: string;
    importance: 'critical' | 'important' | 'helpful';
    dependencies?: string[];
}
export interface SailingServices {
    yachtClubs?: RegionalYachtClub[];
    sailmakers?: Sailmaker[];
    chandleries?: Chandlery[];
    foulWeatherGear?: FoulWeatherGearStore[];
    riggingServices?: RiggingService[];
}
export interface RegionalYachtClub {
    name: string;
    specialty: string;
    contact: string;
    location: string;
    reputation: 'excellent' | 'high' | 'good';
}
export interface Sailmaker {
    name: string;
    specialty: string;
    contact: string;
    languages: string[];
    pricing: 'premium' | 'moderate' | 'competitive' | 'affordable';
}
export interface Chandlery {
    name: string;
    specialty: string;
    contact: string;
    location: string;
    pricing: 'premium' | 'moderate' | 'competitive' | 'affordable';
}
export interface FoulWeatherGearStore {
    name: string;
    specialty: string;
    contact: string;
    languages: string[];
    pricing: 'premium' | 'moderate' | 'competitive' | 'affordable';
}
export interface RiggingService {
    name: string;
    specialty: string;
    contact: string;
    languages: string[];
    pricing: 'premium' | 'moderate' | 'competitive' | 'affordable';
}
export declare class RegionalIntelligenceService {
    private venueIntelligence;
    private intelligenceCallbacks;
    constructor();
    /**
     * Load complete regional intelligence for a venue
     */
    loadVenueIntelligence(venue: SailingVenue): Promise<RegionalIntelligenceData>;
    /**
     * Generate comprehensive regional intelligence
     */
    private generateRegionalIntelligence;
    /**
     * Generate weather forecast
     */
    private generateWeatherForecast;
    /**
     * Generate cultural briefing for venue
     */
    private generateCulturalBriefing;
    /**
     * Check if cached intelligence is still fresh
     */
    private isIntelligenceFresh;
    /**
     * Get weather intelligence for venue
     */
    getWeatherIntelligence(venueId: string): Promise<WeatherIntelligence | null>;
    /**
     * Get tactical intelligence for venue
     */
    getTacticalIntelligence(venueId: string): Promise<TacticalIntelligence | null>;
    /**
     * Get cultural intelligence for venue
     */
    getCulturalIntelligence(venueId: string): Promise<CulturalIntelligence | null>;
    /**
     * Register callback for intelligence updates
     */
    onIntelligenceUpdate(callback: (data: RegionalIntelligenceData) => void): void;
    /**
     * Notify listeners of intelligence updates
     */
    private notifyIntelligenceUpdate;
    /**
     * Clear cached intelligence
     */
    clearCache(): void;
}
export declare const regionalIntelligenceService: RegionalIntelligenceService;
//# sourceMappingURL=RegionalIntelligenceService.d.ts.map