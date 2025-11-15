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
const fallbackSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://stub.supabase.co';
const fallbackSupabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'stub-anon-key';
if (process.env.NODE_ENV !== 'production') {
    console.log('[CoreSupabase] URL:', fallbackSupabaseUrl);
}
export const supabase = createClient(fallbackSupabaseUrl, fallbackSupabaseKey, {
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
        const abortController = typeof AbortController !== 'undefined' ? new AbortController() : null;
        if (abortController) {
            setTimeout(() => abortController.abort(), 5000);
        }
        const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/`, {
            method: 'GET',
            headers: {
                'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`
            },
            signal: abortController?.signal
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
