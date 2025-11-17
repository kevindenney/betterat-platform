/**
 * Mock Data for RegattaFlow
 * Used to populate empty states for first-time users
 *
 * ⚠️ IMPORTANT: This is MOCK DATA with hardcoded values
 *
 * To get REAL weather and tide data:
 * 1. Use the `useRaceWeather` hook from @/hooks/useRaceWeather
 * 2. Pass a SailingVenue object and race date
 * 3. The hook automatically fetches real-time data from regional weather services:
 *    - Hong Kong → Hong Kong Observatory (HKO) - 93% reliability
 *    - North America → NOAA GFS/NAM
 *    - Europe → ECMWF, UK Met Office
 *    - Asia-Pacific → JMA, Hong Kong Observatory, Australian BOM
 *
 * Example usage:
 * ```typescript
 * import { useRaceWeather } from '@/hooks/useRaceWeather';
 *
 * const { weather, loading, error } = useRaceWeather(venue, raceDate);
 *
 * if (weather) {
 *   // Use real weather data
 *   <RaceCard wind={weather.wind} tide={weather.tide} />
 * } else {
 *   // Fallback to mock data
 *   <RaceCard wind={MOCK_RACES[0].wind} tide={MOCK_RACES[0].tide} />
 * }
 * ```
 */
export interface MockRace {
    id: string;
    name: string;
    venue: string;
    venueId?: string;
    date: string;
    startTime: string;
    countdown: {
        days: number;
        hours: number;
        minutes: number;
    };
    wind: {
        direction: string;
        speedMin: number;
        speedMax: number;
    };
    tide: {
        state: 'flooding' | 'ebbing' | 'slack';
        height: number;
        direction?: string;
    };
    strategy: string;
    current?: {
        summary?: string;
        speed?: number;
        direction?: string;
    };
    critical_details?: {
        vhf_channel?: string;
        warning_signal?: string;
        first_start?: string;
    };
    courseId?: string;
    boatId?: string;
}
export interface MockBoat {
    id: string;
    name: string;
    class: string;
    classId?: string;
    sailNumber: string;
    isPrimary: boolean;
    model3D?: string;
    hullMaker?: string;
    sailMaker?: string;
    tuning: {
        shrouds: number;
        backstay: number;
        forestay: number;
        mastButtPosition: number;
    };
    equipment?: {
        hull_maker?: string;
        rig_maker?: string;
        sail_maker?: string;
    };
}
export interface MockCourse {
    id: string;
    name: string;
    venue: string;
    venueId?: string;
    courseType: 'windward_leeward' | 'olympic' | 'trapezoid' | 'coastal' | 'custom';
    marks: Array<{
        name: string;
        lat: number;
        lng: number;
    }>;
    windRange: {
        min: number;
        max: number;
        preferredDirection?: number;
    };
    length: number;
    lastUsed?: string;
}
export interface LinkedRaceData {
    race: MockRace;
    course?: MockCourse;
    boat?: MockBoat;
}
export declare const MOCK_RACES: MockRace[];
export declare const MOCK_BOATS: MockBoat[];
export declare const MOCK_COURSES: MockCourse[];
export declare function calculateCountdown(raceDate: string, raceTime?: string | null): {
    days: number;
    hours: number;
    minutes: number;
};
/**
 * Get mock data based on user's empty state
 */
export declare function getMockDataForUser(userId: string): {
    races: MockRace[];
    boats: MockBoat[];
    courses: MockCourse[];
};
/**
 * Phase 6: Get race with linked course and boat data
 */
export declare function getRaceWithLinks(raceId: string): LinkedRaceData | null;
/**
 * Phase 6: Get all races for a specific boat
 */
export declare function getRacesForBoat(boatId: string): MockRace[];
/**
 * Phase 6: Get all races using a specific course
 */
export declare function getRacesForCourse(courseId: string): MockRace[];
export declare const mockRaces: MockRace[];
export declare const mockBoats: MockBoat[];
export declare const mockCourses: MockCourse[];
export declare const mockVenues: any;
export declare const mockSailors: any;
declare const _default: {
    races: MockRace[];
    boats: MockBoat[];
    courses: MockCourse[];
    venues: any;
    sailors: any;
};
export default _default;
//# sourceMappingURL=mockData.d.ts.map