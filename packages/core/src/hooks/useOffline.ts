// @ts-nocheck
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export interface OfflineState {
  isOffline: boolean;
  isConnected: boolean;
  connectionType: string | null;
  isOnline: boolean;
  cacheNextRace: (raceId: string, userId?: string) => Promise<void>;
}

export function useOffline(): OfflineState {
  const [isOffline, setIsOffline] = useState(false);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
      setConnectionType(state.type);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const cacheNextRace = async (_raceId: string, _userId?: string) => {
    // Stubbed cache implementation for compatibility with RegattaFlow screens
    return Promise.resolve();
  };

  return {
    isOffline,
    isConnected: !isOffline,
    connectionType,
    isOnline: !isOffline,
    cacheNextRace,
  };
}
