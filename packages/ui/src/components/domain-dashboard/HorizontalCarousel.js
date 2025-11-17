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
import React, { useRef } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet, Dimensions, } from 'react-native';
const SCREEN_WIDTH = Dimensions.get('window').width;
const DEFAULT_CARD_WIDTH = 320;
const DEFAULT_CARD_SPACING = 16;
export function HorizontalCarousel({ items, renderCard, cardWidth = DEFAULT_CARD_WIDTH, cardSpacing = DEFAULT_CARD_SPACING, onAddPress, addCardLabel = 'Add Item', addCardSubtitle, addCardIcon, containerStyle, showScrollIndicator = false, }) {
    const scrollViewRef = useRef(null);
    const CARD_TOTAL_WIDTH = cardWidth + cardSpacing;
    return (<View style={[styles.container, containerStyle]}>
      <ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={showScrollIndicator} snapToInterval={CARD_TOTAL_WIDTH} decelerationRate="fast" contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: cardSpacing / 2 },
        ]}>
        {items.map((item, index) => (<View key={item.id} style={[
                styles.cardWrapper,
                {
                    width: cardWidth,
                    marginHorizontal: cardSpacing / 2,
                },
            ]}>
            {renderCard(item, index)}
          </View>))}

        {/* Optional "Add" Card */}
        {onAddPress && (<Pressable style={[
                styles.addCard,
                {
                    width: cardWidth,
                    marginHorizontal: cardSpacing / 2,
                },
            ]} onPress={onAddPress}>
            {addCardIcon || (<View style={styles.defaultAddIcon}>
                <Text style={styles.defaultAddIconText}>+</Text>
              </View>)}
            <Text style={styles.addCardLabel}>{addCardLabel}</Text>
            {addCardSubtitle && (<Text style={styles.addCardSubtitle}>{addCardSubtitle}</Text>)}
          </Pressable>)}
      </ScrollView>
    </View>);
}
const styles = StyleSheet.create({
    container: {
    // Container takes full width
    },
    scrollContent: {
        paddingVertical: 8,
    },
    cardWrapper: {
    // Wrapper for each card to control spacing
    },
    addCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
    },
    defaultAddIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    defaultAddIconText: {
        fontSize: 32,
        fontWeight: '600',
        color: '#3B82F6',
    },
    addCardLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 4,
    },
    addCardSubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
    },
});
