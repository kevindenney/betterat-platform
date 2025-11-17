type StorageAdapter = {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
};
export declare const secureStorage: StorageAdapter;
export declare const createStorageAdapter: () => StorageAdapter;
export type { StorageAdapter };
//# sourceMappingURL=index.d.ts.map