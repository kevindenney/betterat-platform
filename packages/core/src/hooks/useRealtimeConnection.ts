// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

export type RealtimeConnectionState = 'connected' | 'reconnecting' | 'disconnected';

export interface RealtimeConnection {
  status: RealtimeConnectionState;
  isConnected: boolean;
  isReconnecting: boolean;
  forceReconnect: () => Promise<void>;
}

export function useRealtimeConnection(): RealtimeConnection {
  const network = useNetworkStatus();
  const [status, setStatus] = useState<RealtimeConnectionState>('connected');

  useEffect(() => {
    if (!network.isOnline) {
      setStatus('disconnected');
    } else if (network.isConnecting) {
      setStatus('reconnecting');
    } else {
      setStatus('connected');
    }
  }, [network]);

  const forceReconnect = useCallback(async () => {
    setStatus('reconnecting');
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 500));
    } finally {
      setStatus(network.isOnline ? 'connected' : 'disconnected');
    }
  }, [network.isOnline]);

  return {
    status,
    isConnected: network.isOnline,
    isReconnecting: status === 'reconnecting',
    forceReconnect
  };
}
