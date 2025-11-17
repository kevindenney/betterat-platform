/**
 * HorizontalCarousel Component
 *
 * A reusable horizontal scrolling carousel for displaying cards.
 * Extracted from sailracing domain's RacesScreen to be shared across domains.
 *
 * Features:
 * - Smooth horizontal scrolling with snap-to-card behavior
 * - Customizable card width and spacing
 * - Optional "Add" card at the end
 * - Responsive to screen size
 * - Supports any card component via render prop
 *
 * @example
 * ```tsx
 * <HorizontalCarousel
 *   items={races}
 *   renderCard={(race) => <RaceCard {...race} />}
 *   cardWidth={320}
 *   onAddPress={() => setShowAddModal(true)}
 *   addCardLabel="Add Race"
 * />
 * ```
 */
import React from 'react';
export interface HorizontalCarouselProps<T> {
    /**
     * Array of items to display in the carousel
     */
    items: T[];
    /**
     * Function to render each card
     * Receives the item and its index
     */
    renderCard: (item: T, index: number) => React.ReactNode;
    /**
     * Width of each card in pixels
     * @default 320
     */
    cardWidth?: number;
    /**
     * Spacing between cards in pixels
     * @default 16
     */
    cardSpacing?: number;
    /**
     * Callback when the "Add" button is pressed
     * If not provided, no "Add" card will be shown
     */
    onAddPress?: () => void;
    /**
     * Label for the "Add" card
     * @default "Add Item"
     */
    addCardLabel?: string;
    /**
     * Subtitle for the "Add" card
     */
    addCardSubtitle?: string;
    /**
     * Icon component for the "Add" card
     * If not provided, a default "+" icon will be shown
     */
    addCardIcon?: React.ReactNode;
    /**
     * Additional styles for the carousel container
     */
    containerStyle?: any;
    /**
     * Show horizontal scroll indicator
     * @default false
     */
    showScrollIndicator?: boolean;
}
export declare function HorizontalCarousel<T extends {
    id: string | number;
}>({ items, renderCard, cardWidth, cardSpacing, onAddPress, addCardLabel, addCardSubtitle, addCardIcon, containerStyle, showScrollIndicator, }: HorizontalCarouselProps<T>): React.JSX.Element;
//# sourceMappingURL=HorizontalCarousel.d.ts.map