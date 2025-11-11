import React from 'react';
import { ViewStyle, GestureResponderEvent } from 'react-native';
export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export interface ButtonProps {
    title: string;
    onPress: (event: GestureResponderEvent) => void;
    variant?: ButtonVariant;
    disabled?: boolean;
    style?: ViewStyle;
}
export declare const Button: React.FC<ButtonProps>;
//# sourceMappingURL=Button.d.ts.map