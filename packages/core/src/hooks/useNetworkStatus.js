// @ts-nocheck
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
export function useNetworkStatus() {
    const [status, setStatus] = useState({
        isOnline: true,
        isConnecting: false,
        connectionType: 'unknown'
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
