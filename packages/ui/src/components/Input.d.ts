import React from 'react';
import { ViewStyle } from 'react-native';
export type InputType = 'text' | 'email' | 'password' | 'number';
export interface InputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    error?: string;
    type?: InputType;
    style?: ViewStyle;
    disabled?: boolean;
}
export declare const Input: React.FC<InputProps>;
//# sourceMappingURL=Input.d.ts.map