// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
export function useRealtimeConnection() {
    const network = useNetworkStatus();
    const [status, setStatus] = useState('connected');
    useEffect(() => {
        if (!network.isOnline) {
            setStatus('disconnected');
        }
        else if (network.isConnecting) {
            setStatus('reconnecting');
        }
        else {
            setStatus('connected');
        }
    }, [network]);
    const forceReconnect = useCallback(async () => {
        setStatus('reconnecting');
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        finally {
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
