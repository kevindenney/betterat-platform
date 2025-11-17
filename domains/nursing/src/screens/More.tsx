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

type Affiliation = {
  id: string;
  name: string;
  type: 'university' | 'hospital';
  location: string;
  focus: string;
  status: 'connected' | 'available';
};

const MENU_SECTIONS = [
  {
    title: 'Care Network',
    items: [
      { label: 'Departments', icon: '🏥', badge: '5', description: 'Telemetry, ICU, ED, PACU' },
      { label: 'Cohorts', icon: '👥', badge: '3', description: 'New grad residency, float pool' },
      { label: 'Coaching desk', icon: '🤖', description: 'AI + human coaching library' },
    ],
  },
  {
    title: 'Clinical Affiliations',
    items: [
      { label: 'Sites & Schools', icon: '🩺', description: 'Hopkins SON · Mercy · MedStar' },
    ],
  },
  {
    title: 'Playbooks & Docs',
    items: [
      { label: 'Shift Dashboard', icon: '📊', description: 'Telemetry readiness + KPIs' },
      { label: 'Discovery', icon: '🗺️', description: 'Network intelligence + routing' },
      { label: 'Simulation vault', icon: '🎯', description: 'Scenario packs + assets' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Profile', icon: '👤', description: 'Credentials · notifications' },
      { label: 'Integrations', icon: '🔌', description: 'Epic, TigerConnect, LMS' },
      { label: 'Support', icon: '💬', description: 'Message HQ · status page' },
    ],
  },
];

const AFFILIATIONS: Affiliation[] = [
  {
    id: 'hopkins-son',
    name: 'Johns Hopkins School of Nursing',
    type: 'university',
    location: 'Baltimore · East Baltimore Campus',
    focus: 'Simulation lab · Graduate residency track',
    status: 'connected',
  },
  {
    id: 'mercy-medical',
    name: 'Mercy Medical Center',
    type: 'hospital',
    location: 'Downtown Baltimore',
    focus: 'Telemetry · Med/Surg · Women’s services',
    status: 'available',
  },
  {
    id: 'medstar-harbor',
    name: 'MedStar Harbor Hospital',
    type: 'hospital',
    location: 'South Baltimore · Cherry Hill',
    focus: 'Emergency · Critical care · OR exposure',
    status: 'available',
  },
];

const MoreScreen: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  const [showSitesModal, setShowSitesModal] = useState(false);
  const [activeAffiliation, setActiveAffiliation] = useState<Affiliation | null>(null);
  const [showAffiliationDashboard, setShowAffiliationDashboard] = useState(false);
  const [affiliations, setAffiliations] = useState<Affiliation[]>(AFFILIATIONS);
  const [connectingSiteId, setConnectingSiteId] = useState<string | null>(null);

  const menuSections = useMemo(() => MENU_SECTIONS, []);

  const openSites = () => setShowSitesModal(true);
  const closeSites = () => setShowSitesModal(false);

  const handleMenuPress = (label: string) => {
    if (label === 'Sites & Schools') {
      openSites();
      return;
    }
    Alert.alert('Coming soon', `${label} opens in the next release.`);
  };

  useEffect(() => {
    let mounted = true;
    const loadAssignments = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('nursing_affiliation_assignments')
        .select('affiliation_id')
        .eq('user_id', userId);

      if (!mounted) return;
      if (error) {
        console.warn('[NursingMore] Failed to load assignments', error);
        return;
      }

      const connectedIds = new Set((data ?? []).map((row) => row.affiliation_id));
      setAffiliations((prev) =>
        prev.map((aff) =>
          connectedIds.has(aff.id)
            ? { ...aff, status: 'connected' }
            : aff
        )
      );
    };
    loadAssignments();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const handleConnect = async (site: Affiliation) => {
    services.analytics.trackEvent('nursing_affiliation_clicked', {
      siteId: site.id,
      status: site.status,
    });

    if (site.status === 'connected') {
      setActiveAffiliation(site);
      setShowSitesModal(false);
      setShowAffiliationDashboard(true);
      return;
    }

    if (!userId || userId === 'guest-user') {
      setAffiliations((prev) =>
        prev.map((aff) => (aff.id === site.id ? { ...aff, status: 'connected' } : aff))
      );
      setActiveAffiliation({ ...site, status: 'connected' });
      setShowSitesModal(false);
      setShowAffiliationDashboard(true);
      return;
    }

    try {
      setConnectingSiteId(site.id);
      const { error } = await supabase
        .from('nursing_affiliation_assignments')
        .insert({
          user_id: userId,
          affiliation_id: site.id,
          status: 'connected',
          role: 'student',
        })
        .select('affiliation_id')
        .single();

      if (error && error.code !== '23505') {
        throw error;
      }

      setAffiliations((prev) =>
        prev.map((aff) => (aff.id === site.id ? { ...aff, status: 'connected' } : aff))
      );
      setActiveAffiliation({ ...site, status: 'connected' });
      setShowSitesModal(false);
      setShowAffiliationDashboard(true);
    } catch (err: any) {
      console.error('[NursingMore] Unable to connect site', err);
      Alert.alert('Unable to connect', err.message ?? 'Please try again later.');
    } finally {
      setConnectingSiteId(null);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>More tools</Text>
      <Text style={styles.title}>All nursing modules in one strip</Text>
      <Text style={styles.subtitle}>
        Mirroring the "More" tab from yacht racing: quick access to departments, cohorts, docs, and
        platform settings.
      </Text>

      {menuSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuRow}
              onPress={() => handleMenuPress(item.label)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuBody}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              {item.badge ? <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View> : null}
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      </ScrollView>

      <Modal visible={showSitesModal} animationType="slide" transparent onRequestClose={closeSites}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Sites & Schools</Text>
                <Text style={styles.modalSubtitle}>
                  Link your prereceptor sites to sync rotations, competencies, and shift slots.
                </Text>
              </View>
              <TouchableOpacity onPress={closeSites}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {affiliations.map((site) => (
                <View key={site.id} style={styles.siteCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.siteName}>{site.name}</Text>
                    <Text style={styles.siteMeta}>{site.location}</Text>
                    <Text style={styles.siteMeta}>{site.focus}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.siteButton,
                      site.status === 'connected' && styles.siteButtonPrimary,
                      connectingSiteId === site.id && styles.siteButtonLoading,
                    ]}
                    disabled={Boolean(connectingSiteId) && connectingSiteId === site.id}
                    onPress={() => handleConnect(site)}
                  >
                    <Text style={styles.siteButtonLabel}>
                      {connectingSiteId === site.id
                        ? 'Connecting…'
                        : site.status === 'connected'
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
        visible={showAffiliationDashboard}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAffiliationDashboard(false)}
      >
        <View style={styles.dashboardOverlay}>
          <View style={styles.dashboardCard}>
            {activeAffiliation ? (
              <AffiliationDashboard
                site={activeAffiliation}
                onClose={() => setShowAffiliationDashboard(false)}
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const AffiliationDashboard = ({ site, onClose }: { site: Affiliation; onClose: () => void }) => {
  const coverage = [
    { id: 'cov-1', unit: 'Telemetry', coverage: '96%', staffing: '8/8 nurses', preceptors: '3' },
    { id: 'cov-2', unit: 'Emergency', coverage: '88%', staffing: '12/14 nurses', preceptors: '2' },
  ];

  const competencies = [
    { id: 'comp-1', label: 'Central line care', completion: '72%', due: 'Nov 22' },
    { id: 'comp-2', label: 'High-acuity simulation', completion: '58%', due: 'Dec 5' },
  ];

  const communications = [
    { id: 'msg-1', title: 'Rapid response case review posted', channel: 'LMS · TigerConnect' },
    { id: 'msg-2', title: 'Safety huddle briefing (ED)', channel: 'Shift broadcast' },
  ];

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.dashboardHeader}>
        <View>
          <Text style={styles.dashboardCapsule}>Clinical affiliation</Text>
          <Text style={styles.dashboardTitle}>{site.name}</Text>
          <Text style={styles.dashboardMeta}>{site.location}</Text>
        </View>
        <TouchableOpacity style={styles.dashboardCloseButton} onPress={onClose}>
          <Text style={styles.dashboardCloseText}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsStrip}>
          <View>
            <Text style={styles.stripLabel}>Students today</Text>
            <Text style={styles.stripValue}>34 on shift</Text>
          </View>
          <View>
            <Text style={styles.stripLabel}>Preceptors</Text>
            <Text style={styles.stripValue}>11 assigned</Text>
          </View>
          <View>
            <Text style={styles.stripLabel}>Competency drift</Text>
            <Text style={styles.stripValue}>-4% from target</Text>
          </View>
        </View>

        <Text style={styles.sectionTitleDashboard}>Coverage & Staffing</Text>
        {coverage.map((row) => (
          <View key={row.id} style={styles.coverageCard}>
            <View>
              <Text style={styles.coverageUnit}>{row.unit}</Text>
              <Text style={styles.coverageMeta}>{row.staffing}</Text>
            </View>
            <View>
              <Text style={styles.coveragePercent}>{row.coverage}</Text>
              <Text style={styles.coverageMeta}>Preceptors: {row.preceptors}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitleDashboard}>Competency Tracks</Text>
        {competencies.map((item) => (
          <View key={item.id} style={styles.compCard}>
            <View>
              <Text style={styles.compLabel}>{item.label}</Text>
              <Text style={styles.compMeta}>Due {item.due}</Text>
            </View>
            <Text style={styles.compValue}>{item.completion}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitleDashboard}>Communications</Text>
        {communications.map((msg) => (
          <View key={msg.id} style={styles.commCard}>
            <View>
              <Text style={styles.commTitle}>{msg.title}</Text>
              <Text style={styles.commMeta}>{msg.channel}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F4F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F4F5',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1,
    color: '#DB2777',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
  },
  section: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 0.5,
    color: '#A1A1AA',
    textTransform: 'uppercase',
    marginLeft: 16,
    marginBottom: 6,
    marginTop: 6,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuBody: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
  },
  menuDescription: {
    fontSize: 13,
    color: '#71717A',
  },
  badge: {
    backgroundColor: '#DB2777',
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
    backgroundColor: 'rgba(15,23,42,0.45)',
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  modalClose: {
    fontSize: 20,
    color: '#A1A1AA',
  },
  siteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  siteName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  siteMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  siteButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#DB2777',
  },
  siteButtonPrimary: {
    backgroundColor: '#7C3AED',
  },
  siteButtonLoading: {
    opacity: 0.7,
  },
  siteButtonLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dashboardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dashboardCard: {
    width: '100%',
    maxWidth: 640,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
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
    color: '#DB2777',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  dashboardMeta: {
    fontSize: 14,
    color: '#6B7280',
  },
  dashboardCloseButton: {
    backgroundColor: '#FCE7F3',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dashboardCloseText: {
    color: '#BE185D',
    fontWeight: '600',
  },
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: 16,
  },
  stripLabel: {
    fontSize: 12,
    color: '#BE123C',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  stripValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#881337',
    marginTop: 4,
  },
  sectionTitleDashboard: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  coverageCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  coverageUnit: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  coverageMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  coveragePercent: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
  },
  compCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    backgroundColor: '#FFF5F7',
    marginBottom: 10,
  },
  compLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#BE185D',
  },
  compMeta: {
    fontSize: 12,
    color: '#9D174D',
  },
  compValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#881337',
  },
  commCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  commTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  commMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default MoreScreen;
