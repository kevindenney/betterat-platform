/**
 * Core data hooks for BetterAt platform
 *
 * These hooks provide access to common data patterns across all domains.
 * Domain-specific hooks should extend these or create their own.
 */
export interface UseDataResult<T = any> {
    data: T[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    mutate: (data?: T[]) => void;
}
/**
 * Generic useBoats hook
 * Domains should implement their own version with proper types
 */
export declare function useBoats(): UseDataResult;
/**
 * Generic useClubs hook
 * Domains should implement their own version with proper types
 */
export declare function useClubs(): UseDataResult;
/**
 * Generic useJoinClub hook
 */
export declare function useJoinClub(): (clubId: string) => Promise<{
    success: boolean;
}>;
/**
 * Generic useClubDirectory hook
 */
export declare function useClubDirectory(): UseDataResult;
/**
 * Generic useDashboardData hook
 * Returns aggregated dashboard data
 */
export declare function useDashboardData(): {
    profile: null;
    nextRace: null;
    recentRaces: never[];
    recentTimerSessions: never[];
    performanceHistory: never[];
    boats: never[];
    fleets: never[];
    loading: boolean;
    error: Error | null;
    refreshing: boolean;
    onRefresh: () => Promise<void>;
    refetch: () => Promise<void>;
};
/**
 * Generic useRaceTimerSession hook
 */
export declare function useRaceTimerSession(sessionId: string): {
    data: any;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
};
/**
 * Generic useRaceAnalysis hook
 */
export declare function useRaceAnalysis(sessionId: string): {
    data: any;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
};
/**
 * Generic useData hook
 * Provides a flexible data fetching pattern
 */
export declare function useData<T = any>(fetcher?: () => Promise<T[]>, options?: {
    enabled?: boolean;
}): UseDataResult<T>;
//# sourceMappingURL=useData.d.ts.map