export type RealtimeConnectionState = 'connected' | 'reconnecting' | 'disconnected';
export interface RealtimeConnection {
    status: RealtimeConnectionState;
    isConnected: boolean;
    isReconnecting: boolean;
    forceReconnect: () => Promise<void>;
}
export declare function useRealtimeConnection(): RealtimeConnection;
//# sourceMappingURL=useRealtimeConnection.d.ts.map