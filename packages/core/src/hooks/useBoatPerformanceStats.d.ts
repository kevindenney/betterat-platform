export interface BoatPerformanceStats {
    totalRaces: number;
    avgFinish: number | null;
    winRate: number | null;
    topThreeRate: number | null;
    avgDelta: number | null;
    lastRaceDate: string | null;
}
interface UseBoatPerformanceStatsParams {
    sailorId?: string;
    sailNumber?: string;
    className?: string;
}
export declare function useBoatPerformanceStats({ sailorId, sailNumber, className, }: UseBoatPerformanceStatsParams): {
    stats: BoatPerformanceStats | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
};
export {};
//# sourceMappingURL=useBoatPerformanceStats.d.ts.map