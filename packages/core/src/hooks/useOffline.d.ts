export interface OfflineState {
    isOffline: boolean;
    isConnected: boolean;
    connectionType: string | null;
    isOnline: boolean;
    cacheNextRace: (raceId: string, userId?: string) => Promise<void>;
}
export declare function useOffline(): OfflineState;
//# sourceMappingURL=useOffline.d.ts.map