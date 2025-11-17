/**
 * UnifiedDomainDashboard - A reusable dashboard component that works across domains
 *
 * This component provides a consistent UX pattern:
 * - Horizontal carousel of domain items (races, shifts, etc.) at the top
 * - Selected item detail view below
 * - Quick actions specific to the domain
 * - Flexible content area for domain-specific metrics and information
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { HorizontalCarousel } from './HorizontalCarousel';
import { EventOverviewSurface } from './EventOverview';
import { TabBar, DEFAULT_TAB_DEFINITIONS } from './TabBar';
const palette = {
    background: '#F7F3EB',
    card: '#FFFFFF',
    border: '#DED3C2',
    text: '#1F1810',
    muted: '#6D6357',
    primary: '#8C5D2A',
};
const serifFont = Platform.select({
    ios: 'Iowan Old Style',
    android: 'serif',
    default: 'Georgia',
});
const sansFont = Platform.select({
    ios: 'Helvetica Neue',
    android: 'sans-serif-light',
    default: 'System',
});
export const UnifiedDomainDashboard = ({ items, selectedItemId, onItemSelect, renderCard, carouselTitle, carouselSubtitle, cardWidth = 300, cardSpacing = 16, onAddPress, addCardLabel = 'Add Item', addCardSubtitle, hero, quickActions = [], highlightEvent, upcomingEvents = [], renderGatherTab, renderCreateTab, renderShareTab, renderReflectTab, tabBarLabels, children, style, carouselStyle, dashboardStyle, }) => {
    const tabDefinitions = DEFAULT_TAB_DEFINITIONS.map((tab) => {
        const override = tabBarLabels?.[tab.key];
        if (!override)
            return tab;
        return {
            ...tab,
            ...override,
        };
    });
    const [activeTab, setActiveTab] = useState(tabDefinitions[0]?.key ?? 'gather');
    const getTabLabel = (key) => tabDefinitions.find((tab) => tab.key === key)?.label ?? 'Tab';
    // Wrap the renderCard to handle selection state
    const renderSelectableCard = (item) => {
        const isSelected = item.id === selectedItemId;
        return (<TouchableOpacity activeOpacity={0.8} onPress={() => onItemSelect?.(item.id)}>
        {renderCard(item)}
      </TouchableOpacity>);
    };
    // Render appropriate tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'gather':
                return renderGatherTab
                    ? renderGatherTab()
                    : (<View style={styles.tabContent}>
              <Text style={styles.placeholderText}>{getTabLabel('gather')} content coming soon...</Text>
            </View>);
            case 'create':
                return renderCreateTab
                    ? renderCreateTab()
                    : (<View style={styles.tabContent}>
              <Text style={styles.placeholderText}>{getTabLabel('create')} content coming soon...</Text>
            </View>);
            case 'share':
                return renderShareTab
                    ? renderShareTab()
                    : (<View style={styles.tabContent}>
              <Text style={styles.placeholderText}>{getTabLabel('share')} content coming soon...</Text>
            </View>);
            case 'reflect':
                return renderReflectTab
                    ? renderReflectTab()
                    : (<View style={styles.tabContent}>
              <Text style={styles.placeholderText}>{getTabLabel('reflect')} content coming soon...</Text>
            </View>);
            default:
                return null;
        }
    };
    return (<View style={[styles.screen, style]}>
      <ScrollView style={styles.scrollContainer}>
        {/* Horizontal Carousel Section */}
        <View style={[styles.carouselSection, carouselStyle]}>
          <View style={styles.carouselHeader}>
            <Text style={styles.carouselTitle}>{carouselTitle}</Text>
            {carouselSubtitle && (<Text style={styles.carouselSubtitle}>{carouselSubtitle}</Text>)}
          </View>
          <HorizontalCarousel items={items} renderCard={renderSelectableCard} cardWidth={cardWidth} cardSpacing={cardSpacing} onAddPress={onAddPress} addCardLabel={addCardLabel} addCardSubtitle={addCardSubtitle}/>
        </View>

        {/* Dashboard Section */}
        <View style={[styles.dashboardSection, dashboardStyle]}>
          <EventOverviewSurface hero={hero} quickActions={quickActions} highlightEvent={highlightEvent} upcomingEvents={upcomingEvents}>
            {children}
          </EventOverviewSurface>
        </View>

        {/* Tab Navigation */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} tabs={tabDefinitions}/>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
    </View>);
};
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: palette.background,
    },
    scrollContainer: {
        flex: 1,
    },
    carouselSection: {
        paddingTop: 24,
        paddingBottom: 12,
        backgroundColor: palette.background,
    },
    carouselHeader: {
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    carouselLabel: {
        fontFamily: sansFont,
        fontSize: 11,
        letterSpacing: 3,
        color: palette.muted,
        marginBottom: 10,
    },
    carouselTitle: {
        fontFamily: serifFont,
        fontSize: 36,
        lineHeight: 42,
        color: palette.text,
        marginBottom: 6,
    },
    carouselSubtitle: {
        fontFamily: sansFont,
        fontSize: 12,
        letterSpacing: 2,
        color: palette.muted,
        textTransform: 'uppercase',
    },
    dashboardSection: {
        flex: 1,
        backgroundColor: palette.background,
        paddingVertical: 16,
    },
    tabContent: {
        padding: 24,
        backgroundColor: palette.background,
        minHeight: 200,
    },
    placeholderText: {
        fontFamily: sansFont,
        fontSize: 16,
        color: palette.muted,
        textAlign: 'center',
        marginTop: 40,
    },
});
export default UnifiedDomainDashboard;
