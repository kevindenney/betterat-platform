// @ts-nocheck
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
export function useOffline() {
    const [isOffline, setIsOffline] = useState(false);
    const [connectionType, setConnectionType] = useState(null);
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOffline(!state.isConnected);
            setConnectionType(state.type);
        });
        return () => {
            unsubscribe();
        };
    }, []);
    const cacheNextRace = async (_raceId, _userId) => {
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
