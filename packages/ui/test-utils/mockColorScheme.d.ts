type Scheme = 'light' | 'dark';
/**
 * Ensure useColorScheme returns a predictable value for tests.
 */
export declare const mockColorScheme: (scheme?: Scheme) => jest.SpyInstance<Scheme | null, [], any> | null;
export declare const resetColorSchemeMock: () => void;
export {};
//# sourceMappingURL=mockColorScheme.d.ts.map