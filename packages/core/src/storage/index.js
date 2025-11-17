const createMemoryAdapter = () => {
    const store = new Map();
    return {
        async getItem(key) {
            return store.get(key) ?? null;
        },
        async setItem(key, value) {
            store.set(key, value);
        },
        async removeItem(key) {
            store.delete(key);
        }
    };
};
const createSecureStoreAdapter = () => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const SecureStore = require('expo-secure-store');
        return {
            async getItem(key) {
                try {
                    return (await SecureStore.getItemAsync(key)) ?? null;
                }
                catch {
                    return null;
                }
            },
            async setItem(key, value) {
                await SecureStore.setItemAsync(key, value);
            },
            async removeItem(key) {
                await SecureStore.deleteItemAsync(key);
            }
        };
    }
    catch {
        return createMemoryAdapter();
    }
};
export const secureStorage = createSecureStoreAdapter();
export const createStorageAdapter = () => {
    const hasWindow = typeof window !== 'undefined';
    if (hasWindow) {
        return {
            async getItem(key) {
                return window.localStorage.getItem(key);
            },
            async setItem(key, value) {
                window.localStorage.setItem(key, value);
            },
            async removeItem(key) {
                window.localStorage.removeItem(key);
            }
        };
    }
    return secureStorage;
};
