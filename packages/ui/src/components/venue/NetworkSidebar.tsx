import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@betterat/ui/components/themed-text';

export type NetworkSidebarServiceType =
  | 'venue'
  | 'yacht_club'
  | 'sailmaker'
  | 'chandler'
  | 'rigger'
  | 'coach'
  | 'marina'
  | 'repair'
  | 'engine'
  | 'clothing'
  | 'other';

export interface NetworkSidebarLocation {
  name: string;
  region?: string;
}

export interface NetworkSidebarCoordinates {
  lat: number;
  lng: number;
}

export interface NetworkSidebarPlace {
  id: string;
  name: string;
  country?: string;
  location: NetworkSidebarLocation;
  coordinates?: NetworkSidebarCoordinates;
  type: NetworkSidebarServiceType;
  isSaved?: boolean;
  isHomeVenue?: boolean;
  notes?: string;
}

export interface NetworkSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchResults: NetworkSidebarPlace[];
  savedPlaces: NetworkSidebarPlace[];
  onPlacePress: (place: NetworkSidebarPlace) => void;
  onSaveToggle?: (place: NetworkSidebarPlace, nextSaved: boolean) => void;
  isSearching?: boolean;
  isLoadingSaved?: boolean;
  searchPlaceholder?: string;
  emptySearchCopy?: {
    title: string;
    subtitle?: string;
  };
  emptySavedCopy?: {
    title: string;
    subtitle?: string;
  };
}

const DEFAULT_EMPTY_SEARCH = {
  title: 'No results found',
  subtitle: 'Try searching for a location or venue',
};

const DEFAULT_EMPTY_SAVED = {
  title: 'No saved places',
  subtitle: 'Search and save your network to pin resources here',
};

const SERVICE_ICONS: Record<NetworkSidebarServiceType, string> = {
  venue: '🏁',
  yacht_club: '⚓',
  sailmaker: '⛵',
  chandler: '🛒',
  rigger: '🔗',
  coach: '👨‍🏫',
  marina: '🚢',
  repair: '🔧',
  engine: '⚙️',
  clothing: '🧥',
  other: '📍',
};

const shadowStyle = (level: 'lg' | 'sm') => {
  const base = {
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: level === 'lg' ? 14 : 8,
    shadowOffset: { width: 0, height: level === 'lg' ? 6 : 3 },
    elevation: level === 'lg' ? 10 : 4,
  };

  if (Platform.OS === 'web') {
    return {
      boxShadow:
        level === 'lg'
          ? '0px 32px 65px rgba(15, 23, 42, 0.18)'
          : '0px 16px 30px rgba(15, 23, 42, 0.12)',
    };
  }

  return base;
};

export function NetworkSidebar({
  isCollapsed,
  onToggleCollapse,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  savedPlaces,
  onPlacePress,
  onSaveToggle,
  isSearching = false,
  isLoadingSaved = false,
  searchPlaceholder = 'Search Hong Kong, RHKYC, North Sails...',
  emptySearchCopy = DEFAULT_EMPTY_SEARCH,
  emptySavedCopy = DEFAULT_EMPTY_SAVED,
}: NetworkSidebarProps) {
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isCollapsed ? -380 : 0,
      useNativeDriver: Platform.OS !== 'web',
      friction: 8,
    }).start();
  }, [isCollapsed, slideAnim]);

  const isSearchingMode = searchQuery.trim().length > 0;

  const renderPlace = (place: NetworkSidebarPlace) => (
    <View key={place.id} style={styles.placeCard}>
      <View style={styles.placeIcon}>
        <ThemedText style={styles.placeIconText}>{SERVICE_ICONS[place.type] ?? SERVICE_ICONS.other}</ThemedText>
      </View>
      <View style={styles.placeInfo}>
        <ThemedText style={styles.placeName} numberOfLines={1}>
          {place.name}
        </ThemedText>
        {place.country ? (
          <ThemedText style={styles.placeCountry} numberOfLines={1}>
            {place.country}
          </ThemedText>
        ) : null}
        {place.notes ? (
          <ThemedText style={styles.placeNotes} numberOfLines={1}>
            {place.notes}
          </ThemedText>
        ) : null}
      </View>
      <View style={styles.placeActions}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => onPlacePress(place)}
        >
          <Ionicons name="information-circle-outline" size={20} color="#666" />
        </TouchableOpacity>
        {onSaveToggle ? (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => onSaveToggle(place, !(place.isSaved ?? false))}
          >
            <Ionicons
              name={place.isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color="#007AFF"
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  const renderEmptyState = (
    copy: { title: string; subtitle?: string } = DEFAULT_EMPTY_SEARCH,
    iconName: string,
  ) => (
    <View style={styles.emptyState}>
      <Ionicons name={iconName as any} size={48} color="#ccc" />
      <ThemedText style={styles.emptyText}>{copy.title}</ThemedText>
      {copy.subtitle ? (
        <ThemedText style={styles.emptySubtext}>{copy.subtitle}</ThemedText>
      ) : null}
    </View>
  );

  return (
    <>
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIconLeft} />
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchQueryChange('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator>
          {isSearchingMode ? (
            <>
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                </View>
              ) : searchResults.length === 0 ? (
                renderEmptyState(emptySearchCopy, 'search-outline')
              ) : (
                <>
                  <ThemedText style={styles.sectionTitle}>
                    SEARCH RESULTS ({searchResults.length})
                  </ThemedText>
                  {searchResults.map(renderPlace)}
                </>
              )}
            </>
          ) : (
            <>
              {isLoadingSaved ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                </View>
              ) : savedPlaces.length === 0 ? (
                renderEmptyState(emptySavedCopy, 'bookmark-outline')
              ) : (
                <>
                  <ThemedText style={styles.sectionTitle}>
                    SAVED ({savedPlaces.length})
                  </ThemedText>
                  {savedPlaces.map(renderPlace)}
                </>
              )}
            </>
          )}
        </ScrollView>
      </Animated.View>

      <TouchableOpacity
        style={[styles.toggleButton, isCollapsed && styles.toggleButtonCollapsed]}
        onPress={onToggleCollapse}
      >
        <Ionicons
          name={isCollapsed ? 'chevron-forward' : 'chevron-back'}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 380,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    zIndex: 100,
    ...shadowStyle('lg'),
    ...(Platform.OS !== 'android' ? { shadowOffset: { width: 2, height: 0 } } : {}),
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    marginTop: Platform.OS === 'web' ? 20 : 60,
    paddingHorizontal: 12,
    height: 48,
    ...shadowStyle('sm'),
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  searchIconLeft: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  clearButton: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    backgroundColor: '#fff',
  },
  placeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  placeIconText: {
    fontSize: 20,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  placeCountry: {
    fontSize: 13,
    color: '#666',
  },
  placeNotes: {
    fontSize: 12,
    color: '#8c8c8c',
    marginTop: 4,
  },
  placeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  toggleButton: {
    position: 'absolute',
    left: 380,
    top: '50%',
    marginTop: -24,
    width: 32,
    height: 48,
    backgroundColor: '#007AFF',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 101,
    ...shadowStyle('sm'),
    ...(Platform.OS !== 'android' ? { shadowOffset: { width: 2, height: 2 } } : {}),
  },
  toggleButtonCollapsed: {
    left: 0,
  },
});
