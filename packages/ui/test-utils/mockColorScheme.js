import * as ReactNative from 'react-native';
let colorSchemeSpy = null;
/**
 * Ensure useColorScheme returns a predictable value for tests.
 */
export const mockColorScheme = (scheme = 'light') => {
    if (!colorSchemeSpy) {
        colorSchemeSpy = jest.spyOn(ReactNative, 'useColorScheme');
    }
    colorSchemeSpy.mockReturnValue(scheme);
    return colorSchemeSpy;
};
export const resetColorSchemeMock = () => {
    colorSchemeSpy?.mockReset();
};
