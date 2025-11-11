type StorageAdapter = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

const createMemoryAdapter = (): StorageAdapter => {
  const store = new Map<string, string>();
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

const createSecureStoreAdapter = (): StorageAdapter => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SecureStore: typeof import('expo-secure-store') = require('expo-secure-store');
    return {
      async getItem(key) {
        try {
          return (await SecureStore.getItemAsync(key)) ?? null;
        } catch {
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
  } catch {
    return createMemoryAdapter();
  }
};

export const secureStorage: StorageAdapter = createSecureStoreAdapter();

export const createStorageAdapter = (): StorageAdapter => {
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

export type { StorageAdapter };
