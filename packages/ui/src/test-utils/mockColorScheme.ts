import * as ReactNative from 'react-native';

type Scheme = 'light' | 'dark';

let colorSchemeSpy: jest.SpyInstance<Scheme | null, []> | null = null;

/**
 * Ensure useColorScheme returns a predictable value for tests.
 */
export const mockColorScheme = (scheme: Scheme = 'light') => {
  if (!colorSchemeSpy) {
    colorSchemeSpy = jest.spyOn(ReactNative, 'useColorScheme') as jest.SpyInstance<Scheme | null, []>;
  }

  colorSchemeSpy.mockReturnValue(scheme);
  return colorSchemeSpy;
};

export const resetColorSchemeMock = () => {
  colorSchemeSpy?.mockReset();
};
