import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MapPin, CheckCircle2, Clock, AlertTriangle, Search, Plus } from 'lucide-react-native';
import { VenueIntelligenceDisplay } from '@/components/venue/VenueIntelligenceDisplay';
import { MapControls, type MapLayers } from '@/components/venue/MapControls';
import type { TravelResourceChips } from '@/components/venue/TravelResourceChips';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';

type VenueStatus = 'verified' | 'pending' | 'needs-review';

type ClubVenue = {
  id: string;
  name: string;
  address: string;
  country: string;
  region: string;
  venue_type: string;
  coordinates_lat: number;
  coordinates_lng: number;
  status: VenueStatus;
  notes?: string;
};

const DEFAULT_LAYERS: MapLayers = {
  yachtClubs: true,
  sailmakers: false,
  riggers: false,
  coaches: false,
  chandlery: false,
  clothing: false,
  marinas: true,
  repair: true,
  engines: false,
};

const CHIP_OVERRIDES: TravelResourceChips['metaOverrides'] = {
  yachtClubs: { label: 'Verified venues', icon: 'shield-checkmark-outline', color: '#2563EB' },
  marinas: { label: 'Storage yards', icon: 'boat-outline', color: '#0EA5E9' },
  repair: { label: 'Service partners', icon: 'construct-outline', color: '#F97316' },
};

const FALLBACK_VENUES: ClubVenue[] = [
  {
    id: 'fallback-1',
    name: 'Main Harbor Marina',
    address: '123 Marina Drive, Coastal City',
    country: 'USA',
    region: 'Coastal City, CA',
    venue_type: 'clubhouse',
    coordinates_lat: 34.008,
    coordinates_lng: -118.474,
    status: 'verified',
    notes: 'Primary sailing venue',
  },
  {
    id: 'fallback-2',
    name: 'North Lake Sailing Center',
    address: '456 Lakeview Blvd, Northern District',
    country: 'USA',
    region: 'North Lake, CA',
    venue_type: 'training',
    coordinates_lat: 34.092,
    coordinates_lng: -118.35,
    status: 'pending',
    notes: 'Summer training venue',
  },
  {
    id: 'fallback-3',
    name: 'Riverside Yacht Club',
    address: '789 River Road, Downtown',
    country: 'USA',
    region: 'Riverside, CA',
    venue_type: 'expansion',
    coordinates_lat: 33.98,
    coordinates_lng: -117.375,
    status: 'needs-review',
    notes: 'Needs updated insurance docs',
  },
];

const STATUS_FILTERS: Array<{ id: VenueStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'verified', label: 'Verified' },
  { id: 'pending', label: 'Pending' },
  { id: 'needs-review', label: 'Needs review' },
];

const generateLocalId = () => `club-venue-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const VENUES_QUERY_KEY = ['club-venues'];

const mapSupabaseRowToVenue = (row: any): ClubVenue => ({
  id: row.id,
  name: row.name ?? 'Untitled venue',
  address: [row.region, row.country].filter(Boolean).join(', ') || 'Unknown location',
  country: row.country ?? 'Unknown',
  region: row.region ?? 'Unknown region',
  venue_type: row.venue_type ?? 'clubhouse',
  coordinates_lat: row.coordinates_lat ?? 0,
  coordinates_lng: row.coordinates_lng ?? 0,
  status: row.data_quality === 'verified'
    ? 'verified'
    : row.data_quality === 'needs-review'
      ? 'needs-review'
      : 'pending',
  notes: row.updated_at ? `Synced ${new Date(row.updated_at).toLocaleDateString()}` : undefined,
});

const fetchClubVenues = async (): Promise<ClubVenue[]> => {
  try {
    const { data, error } = await supabase
      .from('sailing_venues')
      .select(
        'id, name, country, region, venue_type, coordinates_lat, coordinates_lng, data_quality, updated_at',
      )
      .order('updated_at', { ascending: false })
      .limit(200);

    if (error) {
      throw new Error(error.message ?? 'Unable to load Supabase venues, falling back to samples.');
    }

    if (!data || data.length === 0) {
      return FALLBACK_VENUES;
    }

    return data.map(mapSupabaseRowToVenue);
  } catch (err: any) {
    console.warn('[VenueVerification] Failed to load Supabase venues', err);
    throw err instanceof Error
      ? err
      : new Error('Unable to load Supabase venues, falling back to samples.');
  }
};

export default function VenueVerificationScreen() {
  const queryClient = useQueryClient();
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [mapLayers, setMapLayers] = useState<MapLayers>(DEFAULT_LAYERS);
  const [filterStatus, setFilterStatus] = useState<VenueStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  const [newVenue, setNewVenue] = useState({
    name: '',
    address: '',
    region: '',
    country: '',
  });
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const {
    data: venuesData,
    isFetching,
    isError,
    error: venuesError,
    dataUpdatedAt,
  } = useQuery<ClubVenue[]>({
    queryKey: VENUES_QUERY_KEY,
    queryFn: fetchClubVenues,
    initialData: FALLBACK_VENUES,
    initialDataUpdatedAt: 0,
    networkMode: 'offlineFirst',
    retry: 1,
  });

  const venues = venuesData ?? FALLBACK_VENUES;
  const queryErrorMessage = isError
    ? venuesError instanceof Error
      ? venuesError.message
      : 'Unable to load Supabase venues, falling back to samples.'
    : null;
  const loadError = syncError ?? queryErrorMessage;
  const isInitialLoading = isFetching && dataUpdatedAt === 0;

  useEffect(() => {
    if (!venues.length) {
      setSelectedVenueId(null);
      return;
    }
    setSelectedVenueId((current) => {
      if (current && venues.some((venue) => venue.id === current)) {
        return current;
      }
      return venues[0].id;
    });
  }, [venues]);

  const selectedVenue = useMemo(
    () => venues.find((venue) => venue.id === selectedVenueId) ?? null,
    [selectedVenueId, venues],
  );

  const savedVenueIds = useMemo(
    () =>
      new Set(
        venues
          .filter((venue) => venue.status === 'verified')
          .map((venue) => venue.id),
      ),
    [venues],
  );

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const matchesSearch =
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || venue.status === filterStatus;
      const matchesSaved = !showOnlySaved || savedVenueIds.has(venue.id);
      return matchesSearch && matchesStatus && matchesSaved;
    });
  }, [venues, filterStatus, searchQuery, showOnlySaved, savedVenueIds]);

  const verificationStats = useMemo(() => {
    const total = venues.length;
    const verified = venues.filter((v) => v.status === 'verified').length;
    const pending = venues.filter((v) => v.status === 'pending').length;
    const needsReview = venues.filter((v) => v.status === 'needs-review').length;
    return {
      total,
      verified,
      pending,
      needsReview,
    };
  }, [venues]);

  const heroVenue = selectedVenue ?? venues[0] ?? null;

  const overviewProps = useMemo(() => ({
    hero: {
      venueName: heroVenue?.name ?? 'Add your first venue',
      country: heroVenue?.country ?? '',
      region: heroVenue?.region ?? '',
      travelTip: heroVenue
        ? heroVenue.address
        : 'Verified venues unlock club entries, insurance workflows, and logistics tools.',
      windSummary: heroVenue?.notes ?? 'Use this workspace to keep docks, storage, and partner sites verified.',
      onSave: () => setShowOnlySaved(true),
      isSaved: heroVenue ? savedVenueIds.has(heroVenue.id) : false,
      latitude: heroVenue?.coordinates_lat,
      longitude: heroVenue?.coordinates_lng,
    },
    stats: [
      { id: 'total', label: 'Total venues', value: String(verificationStats.total), detail: 'Club + training + partner docks', icon: '🏁' },
      { id: 'verified', label: 'Verified', value: String(verificationStats.verified), detail: 'Ready for entries', icon: '✅' },
      { id: 'pending', label: 'Pending review', value: String(verificationStats.pending), detail: 'Needs documentation', icon: '📝' },
    ],
    checklist: [
      {
        id: 'verification-gates',
        title: 'Verification gates',
        items: [
          {
            id: 'proof',
            label: 'Proof of control',
            status: verificationStats.verified > 0 ? 'complete' : 'todo',
            description: verificationStats.verified > 0 ? 'Uploaded' : 'Awaiting upload',
            icon: '📄',
          },
          {
            id: 'insurance',
            label: 'Insurance docs',
            status: verificationStats.pending > 0 ? 'warning' : 'complete',
            description: verificationStats.pending > 0 ? 'Venues missing COI' : 'All venues current',
            icon: '🛡️',
          },
        ],
      },
    ],
    chips: {
      layers: mapLayers,
      onToggleLayer: (layer: keyof MapLayers) =>
        setMapLayers((prev) => ({
          ...prev,
          [layer]: !prev[layer],
        })),
      metaOverrides: CHIP_OVERRIDES,
    },
    children: null,
  }), [heroVenue, mapLayers, savedVenueIds, verificationStats]);

  const handleStatusChange = useCallback(async (venueId: string, nextStatus: VenueStatus) => {
    setSyncError(null);
    queryClient.setQueryData<ClubVenue[]>(VENUES_QUERY_KEY, (prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map((venue) =>
        venue.id === venueId ? { ...venue, status: nextStatus } : venue,
      );
    });

    try {
      const { error } = await supabase
        .from('sailing_venues')
        .update({ data_quality: nextStatus })
        .eq('id', venueId);

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.warn('[VenueVerification] Failed to update venue status', err);
      setSyncError('Unable to sync venue update with Supabase.');
      queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });
    }
  }, [queryClient]);

  const handleAddVenue = useCallback(async () => {
    if (!newVenue.name.trim()) {
      return;
    }

    setSyncError(null);
    setIsAdding(true);
    const id = generateLocalId();
    const fallbackLat = heroVenue?.coordinates_lat ?? 34 + Math.random();
    const fallbackLng = heroVenue?.coordinates_lng ?? -118.4 + Math.random();
    const pendingVenue: ClubVenue = {
      id,
      name: newVenue.name.trim(),
      address: newVenue.address.trim() || [newVenue.region, newVenue.country].filter(Boolean).join(', '),
      country: newVenue.country.trim() || 'Unknown',
      region: newVenue.region.trim() || newVenue.country.trim() || 'Unknown',
      venue_type: 'clubhouse',
      coordinates_lat: fallbackLat,
      coordinates_lng: fallbackLng,
      status: 'pending',
      notes: 'Awaiting verification',
    };

    queryClient.setQueryData<ClubVenue[]>(VENUES_QUERY_KEY, (prev) => [
      ...(prev ?? []),
      pendingVenue,
    ]);
    setSelectedVenueId(pendingVenue.id);
    setNewVenue({ name: '', address: '', region: '', country: '' });

    try {
      const { error } = await supabase.from('sailing_venues').insert({
        id,
        name: pendingVenue.name,
        country: pendingVenue.country,
        region: pendingVenue.region,
        venue_type: pendingVenue.venue_type,
        coordinates_lat: pendingVenue.coordinates_lat,
        coordinates_lng: pendingVenue.coordinates_lng,
        data_quality: 'pending',
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.warn('[VenueVerification] Failed to insert venue', err);
      setSyncError('Unable to save venue to Supabase (kept locally).');
      queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });
    } finally {
      setIsAdding(false);
    }
  }, [heroVenue, newVenue, queryClient]);

  const sidebar = (
    <View style={styles.sidebar}>
      {loadError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorTitle}>Live data issue</Text>
          <Text style={styles.errorCopy}>{loadError}</Text>
        </View>
      )}
      <View style={styles.searchRow}>
        <Search size={18} color="#64748B" />
        <TextInput
          placeholder="Search venues..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[styles.filterChip, filterStatus === filter.id && styles.filterChipActive]}
            onPress={() => setFilterStatus(filter.id)}
          >
            <Text style={[styles.filterChipLabel, filterStatus === filter.id && styles.filterChipLabelActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.sidebarList} showsVerticalScrollIndicator={false}>
        {filteredVenues.map((venue) => (
          <TouchableOpacity
            key={venue.id}
            style={[
              styles.venueCard,
              selectedVenue?.id === venue.id && styles.venueCardActive,
            ]}
            onPress={() => setSelectedVenueId(venue.id)}
          >
            <View style={styles.venueHeader}>
              <Text style={styles.venueName}>{venue.name}</Text>
              {renderStatusPill(venue.status)}
            </View>
            <Text style={styles.venueAddress}>{venue.address}</Text>
            <Text style={styles.venueMeta}>{venue.notes || 'No notes yet'}</Text>
          </TouchableOpacity>
        ))}

        {filteredVenues.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No venues match</Text>
            <Text style={styles.emptyCopy}>Adjust filters or add a new location.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const controls = (
    <MapControls
      onToggleSavedVenues={() => setShowOnlySaved((prev) => !prev)}
      showOnlySavedVenues={showOnlySaved}
      savedVenuesCount={savedVenueIds.size}
      layers={mapLayers}
      onLayersChange={setMapLayers}
    />
  );

  const detailsSheet = selectedVenue ? (
    <View style={styles.detailSheet}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>{selectedVenue.name}</Text>
        {renderStatusPill(selectedVenue.status)}
      </View>
      <Text style={styles.detailAddress}>{selectedVenue.address}</Text>
      <Text style={styles.detailMeta}>{selectedVenue.region}</Text>
      <View style={styles.detailActions}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => handleStatusChange(selectedVenue.id, 'verified')}
        >
          <CheckCircle2 size={16} color="#2563EB" />
          <Text style={styles.detailButtonLabel}>Mark verified</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.detailButtonSecondary}
          onPress={() => setShowOnlySaved(false)}
        >
          <MapPin size={16} color="#0F172A" />
          <Text style={styles.detailButtonSecondaryLabel}>View docs</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : null;

  const rightPanel = (
    <View style={styles.panelStack}>
      <View style={styles.statGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Verified venues</Text>
          <Text style={styles.statValue}>{verificationStats.verified}</Text>
          <Text style={styles.statHint}>Ready for entries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pending review</Text>
          <Text style={styles.statValue}>{verificationStats.pending}</Text>
          <Text style={styles.statHint}>Docs needed</Text>
        </View>
      </View>

      <View style={styles.addCard}>
        <Text style={styles.addTitle}>Add new venue</Text>
        <TextInput
          placeholder="Venue name"
          placeholderTextColor="#94A3B8"
          value={newVenue.name}
          onChangeText={(text) => setNewVenue((prev) => ({ ...prev, name: text }))}
          style={styles.input}
        />
        <TextInput
          placeholder="Address"
          placeholderTextColor="#94A3B8"
          value={newVenue.address}
          onChangeText={(text) => setNewVenue((prev) => ({ ...prev, address: text }))}
          style={styles.input}
        />
        <TextInput
          placeholder="Region / City"
          placeholderTextColor="#94A3B8"
          value={newVenue.region}
          onChangeText={(text) => setNewVenue((prev) => ({ ...prev, region: text }))}
          style={styles.input}
        />
        <TextInput
          placeholder="Country"
          placeholderTextColor="#94A3B8"
          value={newVenue.country}
          onChangeText={(text) => setNewVenue((prev) => ({ ...prev, country: text }))}
          style={styles.input}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddVenue} disabled={isAdding}>
          {isAdding ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Plus size={18} color="white" />
              <Text style={styles.addButtonLabel}>Add venue</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isInitialLoading && venues.length === 0) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading club venues…</Text>
      </View>
    );
  }

  return (
    <VenueIntelligenceDisplay
      overview={overviewProps}
      map={{
        currentVenue: heroVenue ?? undefined,
        selectedVenue,
        onMarkerPress: (venue) => setSelectedVenueId((venue as ClubVenue).id),
        showAllVenues: true,
        showOnlySavedVenues: showOnlySaved,
        savedVenueIds,
        mapLayers,
      }}
      sidebar={sidebar}
      controls={controls}
      detailsSheet={detailsSheet}
      rightPanel={rightPanel}
      mapOverlay={(
        <View style={styles.mapOverlay}>
          <Text style={styles.mapOverlayTitle}>Club venue admin</Text>
          <Text style={styles.mapOverlayCopy}>
            {isFetching ? 'Syncing live data…' : 'Select a venue to review documentation & verification gates.'}
          </Text>
        </View>
      )}
    />
  );
}

const renderStatusPill = (status: VenueStatus) => {
  const stylesMap = {
    verified: { backgroundColor: '#DCFCE7', color: '#166534', label: 'Verified' },
    pending: { backgroundColor: '#FEF9C3', color: '#92400E', label: 'Pending' },
    'needs-review': { backgroundColor: '#FEE2E2', color: '#991B1B', label: 'Needs review' },
  } as const;

  const palette = stylesMap[status];
  return (
    <View style={[pillStyles.pill, { backgroundColor: palette.backgroundColor }]}>
      {status === 'verified' ? (
        <CheckCircle2 size={14} color={palette.color} />
      ) : status === 'pending' ? (
        <Clock size={14} color={palette.color} />
      ) : (
        <AlertTriangle size={14} color={palette.color} />
      )}
      <Text style={[pillStyles.pillLabel, { color: palette.color }]}>{palette.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FB',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#475569',
  },
  sidebar: {
    flex: 1,
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  errorBanner: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 4,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  errorCopy: {
    fontSize: 12,
    color: '#B45309',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
  },
  filterRow: {
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  filterChipLabelActive: {
    color: '#FFFFFF',
  },
  sidebarList: {
    flex: 1,
  },
  venueCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  venueCardActive: {
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  venueName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  venueAddress: {
    fontSize: 12,
    color: '#475569',
  },
  venueMeta: {
    fontSize: 12,
    color: '#0F172A',
  },
  emptyCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    gap: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyCopy: {
    fontSize: 12,
    color: '#475569',
  },
  detailSheet: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 320,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    gap: 10,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  detailAddress: {
    fontSize: 13,
    color: '#475569',
  },
  detailMeta: {
    fontSize: 13,
    color: '#0F172A',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
  },
  detailButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  detailButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  detailButtonSecondaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  panelStack: {
    gap: 16,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#475569',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  statHint: {
    fontSize: 12,
    color: '#475569',
  },
  addCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
  },
  addTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0F172A',
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
  },
  addButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mapOverlay: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.9)',
    maxWidth: 260,
  },
  mapOverlayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mapOverlayCopy: {
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 4,
  },
});

const pillStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
