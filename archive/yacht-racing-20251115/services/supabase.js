import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
let SecureStore = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    SecureStore = require('expo-secure-store');
}
catch {
    SecureStore = null;
}
const createStorageAdapter = () => {
    const hasWindow = typeof window !== 'undefined';
    const isWeb = hasWindow && typeof document !== 'undefined';
    if (isWeb) {
        return {
            getItem: async (key) => window.localStorage.getItem(key),
            setItem: async (key, value) => {
                window.localStorage.setItem(key, value);
            },
            removeItem: async (key) => {
                window.localStorage.removeItem(key);
            },
        };
    }
    if (SecureStore) {
        return {
            getItem: async (key) => {
                try {
                    return await SecureStore.getItemAsync(key);
                }
                catch {
                    return null;
                }
            },
            setItem: async (key, value) => {
                await SecureStore.setItemAsync(key, value);
            },
            removeItem: async (key) => {
                await SecureStore.deleteItemAsync(key);
            },
        };
    }
    const memoryStore = new Map();
    return {
        getItem: async (key) => memoryStore.get(key) ?? null,
        setItem: async (key, value) => {
            memoryStore.set(key, value);
        },
        removeItem: async (key) => {
            memoryStore.delete(key);
        },
    };
};
const ExpoSecureStorage = createStorageAdapter();
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://stub.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'stub-anon-key';
const isBrowser = typeof window !== 'undefined';
if (process.env.NODE_ENV !== 'production' && isBrowser) {
    const anonPreview = supabaseAnonKey && supabaseAnonKey !== 'stub-anon-key'
        ? `${supabaseAnonKey.slice(0, 6)}…${supabaseAnonKey.slice(-4)}`
        : 'stub-anon-key';
    const storageStrategy = isBrowser
        ? 'web-localStorage'
        : SecureStore
            ? 'expo-secure-store'
            : 'memory';
    console.groupCollapsed('[SupabaseClient]');
    console.log('Project URL:', supabaseUrl);
    console.log('Anon key preview:', anonPreview);
    console.log('Storage adapter:', storageStrategy);
    console.groupEnd();
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    },
    global: {
        headers: {
            'x-client-info': 'regattaflow-app'
        }
    }
});
// Query retry wrapper with timeout logic
export const queryWithRetry = async (queryFn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const start = Date.now();
            const result = await queryFn();
            const duration = Date.now() - start;
            return result;
        }
        catch (err) {
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay));
                delay *= 1.5; // Exponential backoff
            }
            else {
                throw err;
            }
        }
    }
    throw new Error('Query failed after all retries');
};
// Test connectivity to Supabase
export const testSupabaseConnectivity = async () => {
    const start = Date.now();
    try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/`, {
            method: 'GET',
            headers: {
                'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`
            },
            signal: AbortSignal.timeout(5000)
        });
        const duration = Date.now() - start;
        return {
            success: response.ok,
            duration,
            error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
        };
    }
    catch (error) {
        const duration = Date.now() - start;
        return {
            success: false,
            duration,
            error: error.message
        };
    }
};
