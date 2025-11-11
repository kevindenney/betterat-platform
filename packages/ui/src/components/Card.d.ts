import React from 'react';
import { ViewStyle, GestureResponderEvent } from 'react-native';
export interface CardProps {
    children: React.ReactNode;
    onPress?: (event: GestureResponderEvent) => void;
    style?: ViewStyle;
}
export declare const Card: React.FC<CardProps>;
//# sourceMappingURL=Card.d.ts.map