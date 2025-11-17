import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import type { DomainDashboardProps } from '@betterat/domain-sdk';
import { supabase } from '@betterat/core';

const MENU_SECTIONS = [
  {
    title: 'Studios & Community',
    items: [
      { label: 'Studios', icon: '🏛️', description: 'Join critique clubs + co-ops', badge: '4' },
      { label: 'Cohorts', icon: '🫱🏼‍🫲🏽', description: 'Challenges + mentorship pods', badge: '2' },
      { label: 'Marketplace', icon: '🛒', description: 'Brush packs · texture scans · courses' },
    ],
  },
  {
    title: 'Workflow',
    items: [
      { label: 'Sessions', icon: '🎨', description: 'Jump to active practice board' },
      { label: 'Toolkits', icon: '🧰', description: 'Manage brushes, palettes, surfaces' },
      { label: 'Prompts', icon: '🧠', description: 'Prompt boards + AI mashups' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', icon: '👤', description: 'Portfolio · avatar · statement' },
      { label: 'Settings', icon: '⚙️', description: 'Notifications · integrations' },
      { label: 'Support', icon: '💬', description: 'Message HQ · see changelog' },
    ],
  },
];

type StudioAffiliation = {
  id: string;
  name: string;
  type: 'studio' | 'school' | 'guild';
  location: string;
  focus: string;
  status: 'connected' | 'available';
};

const DEFAULT_AFFILIATIONS: StudioAffiliation[] = [
  {
    id: 'a3b5fd74-1f0a-4b3b-b644-1f2876d84999',
    name: 'ArtCenter Los Angeles',
    type: 'school',
    location: 'Los Angeles · Downtown Studio District',
    focus: 'Figure drawing · concept art · portfolio labs',
    status: 'connected',
  },
  {
    id: '6d7a7a5d-1ac2-4018-8ce9-4bfb7439855c',
    name: 'Society of Illustrators NYC',
    type: 'guild',
    location: 'New York · Upper East Side',
    focus: 'Editorial illustration · critiques · juried shows',
    status: 'available',
  },
  {
    id: '43a09178-2515-4c8a-9f33-642f28db8103',
    name: 'Urban Sketchers Baltimore',
    type: 'studio',
    location: 'Baltimore · Rotating field sites',
    focus: 'Plein air · ink · watercolor meetups',
    status: 'available',
  },
];

const DrawingMoreScreen: React.FC<DomainDashboardProps> = ({ userId = 'guest-user', services }) => {
  const [showAffiliations, setShowAffiliations] = useState(false);
  const [studios, setStudios] = useState<StudioAffiliation[]>(DEFAULT_AFFILIATIONS);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [activeStudio, setActiveStudio] = useState<StudioAffiliation | null>(null);
  const [showStudioDashboard, setShowStudioDashboard] = useState(false);

  const sections = useMemo(() => MENU_SECTIONS, []);

  useEffect(() => {
    let mounted = true;
    const loadAssignments = async () => {
      if (!userId || userId === 'guest-user') return;
      const { data, error } = await supabase
        .from('drawing_affiliation_assignments')
        .select('affiliation_id')
        .eq('user_id', userId);

      if (!mounted) return;
      if (error) {
        console.warn('[DrawingMore] Failed to load assignments', error);
        return;
      }

      const connectedIds = new Set((data ?? []).map((row) => row.affiliation_id));
      setStudios((prev) =>
        prev.map((studio) =>
          connectedIds.has(studio.id) ? { ...studio, status: 'connected' } : studio
        )
      );
    };

    loadAssignments();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const handleMenuPress = (label: string) => {
    if (label === 'Studios') {
      setShowAffiliations(true);
      return;
    }
    Alert.alert('Coming soon', `${label} opens in the next build.`);
  };

  const connectStudio = async (studio: StudioAffiliation) => {
    services.analytics.trackEvent('drawing_affiliation_clicked', {
      studioId: studio.id,
      status: studio.status,
    });

    if (studio.status === 'connected') {
      setActiveStudio(studio);
      setShowAffiliations(false);
      setShowStudioDashboard(true);
      return;
    }

    if (!userId || userId === 'guest-user') {
      setStudios((prev) =>
        prev.map((item) => (item.id === studio.id ? { ...item, status: 'connected' } : item))
      );
      setActiveStudio({ ...studio, status: 'connected' });
      setShowAffiliations(false);
      setShowStudioDashboard(true);
      return;
    }

    try {
      setConnectingId(studio.id);
      const { error } = await supabase
        .from('drawing_affiliation_assignments')
        .insert({
          user_id: userId,
          affiliation_id: studio.id,
          status: 'connected',
          role: 'artist',
        })
        .select('affiliation_id')
        .single();

      if (error && error.code !== '23505') throw error;

      setStudios((prev) =>
        prev.map((item) => (item.id === studio.id ? { ...item, status: 'connected' } : item))
      );
      setActiveStudio({ ...studio, status: 'connected' });
      setShowAffiliations(false);
      setShowStudioDashboard(true);
    } catch (err: any) {
      console.error('[DrawingMore] Unable to connect studio', err);
      Alert.alert('Unable to connect', err.message ?? 'Please try again later.');
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>More tools</Text>
      <Text style={styles.title}>Studios, cohorts, and account</Text>
      <Text style={styles.subtitle}>
        Mirrors the sailracing "More" drawer so artists can hop into studios, cohorts, and settings.
      </Text>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.row}
              onPress={() => handleMenuPress(item.label)}
            >
              <Text style={styles.rowIcon}>{item.icon}</Text>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowDescription}>{item.description}</Text>
              </View>
              {item.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      </ScrollView>

      <Modal
        visible={showAffiliations}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAffiliations(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Studios & Schools</Text>
                <Text style={styles.modalSubtitle}>
                  Connect to ateliers, guilds, or plein-air crews to sync sessions and critiques.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAffiliations(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {studios.map((studio) => (
                <View key={studio.id} style={styles.studioCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studioName}>{studio.name}</Text>
                    <Text style={styles.studioMeta}>{studio.location}</Text>
                    <Text style={styles.studioMeta}>{studio.focus}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.studioButton,
                      studio.status === 'connected' && styles.studioButtonPrimary,
                      connectingId === studio.id && styles.studioButtonLoading,
                    ]}
                    disabled={Boolean(connectingId) && connectingId === studio.id}
                    onPress={() => connectStudio(studio)}
                  >
                    <Text style={styles.studioButtonLabel}>
                      {connectingId === studio.id
                        ? 'Connecting…'
                        : studio.status === 'connected'
                        ? 'Open'
                        : 'Connect'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showStudioDashboard}
        animationType="slide"
        transparent
        onRequestClose={() => setShowStudioDashboard(false)}
      >
        <View style={styles.dashboardOverlay}>
          <View style={styles.dashboardCard}>
            {activeStudio ? (
              <StudioDashboard studio={activeStudio} onClose={() => setShowStudioDashboard(false)} />
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const StudioDashboard = ({ studio, onClose }: { studio: StudioAffiliation; onClose: () => void }) => {
  const sessions = [
    { id: 'sess-1', title: 'Gesture Marathon', timing: 'Nov 19 · 18:00-21:00', medium: 'Charcoal', slots: '24 / 30' },
    { id: 'sess-2', title: 'Editorial Bootcamp Critique', timing: 'Nov 22 · 10:00-13:00', medium: 'Ink + Digital', slots: '18 / 20' },
  ];

  const critiques = [
    { id: 'crit-1', title: 'Portfolio drop-off', due: 'Due Nov 20', reviewers: 'Rivera · Chen' },
    { id: 'crit-2', title: 'Urban Sketch crawl upload', due: 'Due Nov 24', reviewers: 'USK leads' },
  ];

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.dashboardHeader}>
        <View>
          <Text style={styles.dashboardCapsule}>Studio workspace</Text>
          <Text style={styles.dashboardTitle}>{studio.name}</Text>
          <Text style={styles.dashboardMeta}>{studio.location}</Text>
        </View>
        <TouchableOpacity style={styles.dashboardClose} onPress={onClose}>
          <Text style={styles.dashboardCloseText}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.dashboardHero}>
          <View>
            <Text style={styles.heroLabel}>Focus</Text>
            <Text style={styles.heroValue}>{studio.focus}</Text>
          </View>
          <View>
            <Text style={styles.heroLabel}>Active cohorts</Text>
            <Text style={styles.heroValue}>3 live pods</Text>
          </View>
          <View>
            <Text style={styles.heroLabel}>Slots</Text>
            <Text style={styles.heroValue}>12 seats open</Text>
          </View>
        </View>

        <Text style={styles.sectionTitleDashboard}>Upcoming Sessions</Text>
        {sessions.map((session) => (
          <View key={session.id} style={styles.sessionCard}>
            <View>
              <Text style={styles.sessionTitle}>{session.title}</Text>
              <Text style={styles.sessionMeta}>{session.timing}</Text>
              <Text style={styles.sessionMeta}>{session.medium}</Text>
            </View>
            <Text style={styles.sessionSlots}>{session.slots}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitleDashboard}>Critiques & Deadlines</Text>
        {critiques.map((crit) => (
          <View key={crit.id} style={styles.critCard}>
            <View>
              <Text style={styles.critTitle}>{crit.title}</Text>
              <Text style={styles.critMeta}>{crit.due}</Text>
            </View>
            <Text style={styles.critReviewers}>{crit.reviewers}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1,
    color: '#A855F7',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  subtitle: {
    fontSize: 15,
    color: '#4C1D95',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 0.5,
    color: '#A1A1AA',
    textTransform: 'uppercase',
    marginLeft: 16,
    marginTop: 10,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
  },
  rowIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  rowBody: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  rowDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  badge: {
    backgroundColor: '#C026D3',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 22,
    color: '#D4D4D8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(24,24,27,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B21A8',
  },
  modalClose: {
    fontSize: 20,
    color: '#A1A1AA',
  },
  studioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FDF4FF',
    marginBottom: 12,
    gap: 12,
  },
  studioName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  studioMeta: {
    fontSize: 13,
    color: '#6B21A8',
  },
  studioButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#A855F7',
  },
  studioButtonPrimary: {
    backgroundColor: '#6D28D9',
  },
  studioButtonLoading: {
    opacity: 0.7,
  },
  studioButtonLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dashboardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(24,24,27,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dashboardCard: {
    width: '100%',
    maxWidth: 640,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  dashboardContainer: {
    flex: 1,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dashboardCapsule: {
    fontSize: 12,
    color: '#9333EA',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  dashboardMeta: {
    fontSize: 14,
    color: '#6B21A8',
  },
  dashboardClose: {
    backgroundColor: '#F5F3FF',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dashboardCloseText: {
    color: '#6D28D9',
    fontWeight: '600',
  },
  dashboardHero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F3E8FF',
    backgroundColor: '#FAF5FF',
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 12,
    color: '#7E22CE',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  heroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
    marginTop: 4,
  },
  sectionTitleDashboard: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 8,
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  sessionMeta: {
    fontSize: 13,
    color: '#6B21A8',
  },
  sessionSlots: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B21A8',
  },
  critCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3E8FF',
    backgroundColor: '#FDF4FF',
    marginBottom: 10,
  },
  critTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7E22CE',
  },
  critMeta: {
    fontSize: 12,
    color: '#6B21A8',
  },
  critReviewers: {
    fontSize: 13,
    color: '#4C1D95',
  },
});

export default DrawingMoreScreen;
