import React from 'react';
import { type TextProps } from 'react-native';
export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: 'default' | 'title' | 'subtitle' | 'caption' | 'mono';
};
export declare function ThemedText({ style, lightColor, darkColor, type, ...otherProps }: ThemedTextProps): React.JSX.Element;
//# sourceMappingURL=themed-text.d.ts.map