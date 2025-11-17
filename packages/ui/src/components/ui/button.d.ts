import React from 'react';
import { type GestureResponderEvent, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
type ButtonVariant = 'primary' | 'secondary' | 'outline';
export interface ButtonProps {
    children?: React.ReactNode;
    variant?: ButtonVariant;
    isDisabled?: boolean;
    isLoading?: boolean;
    onPress?: (event: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<TouchableOpacity>>;
export interface ButtonTextProps {
    children?: React.ReactNode;
    style?: StyleProp<TextStyle>;
}
export declare const ButtonText: React.FC<ButtonTextProps>;
export interface ButtonIconProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare const ButtonIcon: React.FC<ButtonIconProps>;
export type buttonProps = ButtonProps;
export declare const button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<TouchableOpacity>>;
export {};
//# sourceMappingURL=button.d.ts.map