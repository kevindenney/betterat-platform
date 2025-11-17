import { type NetInfoState } from '@react-native-community/netinfo';
export interface NetworkStatus {
    isOnline: boolean;
    isConnecting: boolean;
    connectionType: NetInfoState['type'];
}
export declare function useNetworkStatus(): NetworkStatus;
//# sourceMappingURL=useNetworkStatus.d.ts.map