import { useEffect, useState } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isOnline: boolean;
  isConnecting: boolean;
  connectionType: NetInfoState['type'];
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true,
    isConnecting: false,
    connectionType: 'unknown' as NetInfoState['type']
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setStatus({
        isOnline: Boolean(state.isConnected),
        isConnecting: state.isConnected ? state.isInternetReachable === false : false,
        connectionType: state.type
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
}
