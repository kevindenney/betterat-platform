/**
 * CardHeader Component
 *
 * Header section for Card components with icon, title, and optional badge.
 * Works across all domains (yacht racing, nursing, drawing, etc.)
 */
import React from 'react';
import { ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
export interface CardHeaderProps {
    /** Icon name from Ionicons */
    icon?: keyof typeof Ionicons.glyphMap;
    /** Header title */
    title: string;
    /** Optional badge text (e.g., "LIVE DATA", "NEW") */
    badge?: string;
    /** Badge background color */
    badgeColor?: string;
    /** Icon color */
    iconColor?: string;
    /** Optional custom styles */
    style?: ViewStyle;
}
export declare const CardHeader: React.FC<CardHeaderProps>;
export default CardHeader;
//# sourceMappingURL=CardHeader.d.ts.map