import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { DomainDashboardProps } from '@betterat/domain-sdk';

const MONOCLE_ACTIVE = '#3D2C1F';
const MONOCLE_MUTED = '#84745F';
const MONOCLE_CANVAS = '#FFFDF8';
const MONOCLE_BORDER = '#E5D6C1';
const MONOCLE_RAISED = '#FBF3E4';
const MONOCLE_BADGE_ACCENT = '#C6B49A';
const MONOCLE_BADGE_NEW = '#B97D4D';
const MONOCLE_DIVIDER = '#EFE1CE';
const ICON_SIZE = 26;

interface MenuItemProps {
  icon: React.ReactNode;
  iconTone?: 'default' | 'accent';
  label: string;
  badge?: string | number;
  badgeType?: 'count' | 'new';
  onPress: () => void;
}

interface SectionHeaderProps {
  title: string;
  isFirst?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, iconTone = 'default', label, badge, badgeType = 'count', onPress }) => {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.menuIconMedallion,
            iconTone === 'accent' && styles.menuIconMedallionAccent,
          ]}
        >
          {icon}
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {badge && (
          <View style={[
            styles.badge,
            badgeType === 'new' ? styles.badgeNew : styles.badgeCount,
          ]}>
            <Text style={badgeType === 'new' ? styles.badgeTextInverted : styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, isFirst = false }) => (
  <Text style={[styles.sectionHeader, isFirst && styles.sectionHeaderFirst]}>
    {title}
  </Text>
);

const IconStroke = {
  stroke: MONOCLE_ACTIVE,
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const FleetsIcon = () => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 32 32">
    <Path d="M6 19 C10 23 22 23 26 19" {...IconStroke} fill="none" />
    <Path d="M12 9 L12 19" {...IconStroke} fill="none" />
    <Path d="M12 10 L22 13 L12 16 Z" {...IconStroke} fill="#E3D2BC" />
  </Svg>
);

const ClubsIcon = () => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 32 32">
    <Path d="M9 24 L9 13 L23 13 L23 24" {...IconStroke} fill="none" />
    <Path d="M11 13 L16 8 L21 13" {...IconStroke} fill="#E7D7C5" />
    <Line x1="16" y1="8" x2="16" y2="5" {...IconStroke} />
  </Svg>
);

const CrewIcon = () => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 32 32">
    <Circle cx="12" cy="12" r="4" {...IconStroke} fill="none" />
    <Circle cx="20" cy="12" r="4" {...IconStroke} fill="none" />
    <Path d="M6 24 C7 19 11 18 12 18 C13 18 17 19 18 24" {...IconStroke} fill="none" />
    <Path d="M14 24 C14.5 20.5 17 19 20 19 C23 19 25 21 26 24" {...IconStroke} fill="none" />
  </Svg>
);

const CoachingIcon = () => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 32 32">
    <Path d="M9 14 L16 10 L23 14 L16 18 Z" {...IconStroke} fill="#E3D2BC" />
    <Path d="M16 18 L16 24" {...IconStroke} />
    <Line x1="11" y1="16" x2="21" y2="16" {...IconStroke} />
  </Svg>
);

const TuningIcon = () => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 32 32">
    <Path d="M11 9 L21 9 L21 23 L11 23 Z" {...IconStroke} fill="none" />
    <Line x1="11" y1="15" x2="21" y2="15" {...IconStroke} />
    <Line x1="11" y1="17" x2="21" y2="17" stroke={MONOCLE_MUTED} strokeWidth={1} />
    <Line x1="14" y1="12" x2="14" y2="21" {...IconStroke} />
  </Svg>
);

const PracticeIcon = () => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 32 32">
    <Circle cx="16" cy="16" r="9" {...IconStroke} fill="none" />
    <Circle cx="16" cy="16" r="4" stroke={MONOCLE_MUTED} strokeWidth={1.4} fill="none" />
    <Line x1="16" y1="7" x2="16" y2="11" {...IconStroke} />
    <Line x1="16" y1="21" x2="16" y2="25" {...IconStroke} />
  </Svg>
);

const ProfileIcon = () => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 32 32">
    <Circle cx="16" cy="12" r="4.5" {...IconStroke} fill="none" />
    <Path d="M8 24 C9 19 23 19 24 24" {...IconStroke} fill="none" />
  </Svg>
);

const SettingsIcon = () => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 32 32">
    <Circle cx="16" cy="16" r="3" {...IconStroke} fill="none" />
    <Path d="M16 8 L16 5" {...IconStroke} />
    <Path d="M16 27 L16 24" {...IconStroke} />
    <Path d="M24 16 L27 16" {...IconStroke} />
    <Path d="M8 16 L5 16" {...IconStroke} />
    <Path d="M22 10 L24 8" {...IconStroke} />
    <Path d="M10 10 L8 8" {...IconStroke} />
    <Path d="M22 22 L24 24" {...IconStroke} />
    <Path d="M10 22 L8 24" {...IconStroke} />
  </Svg>
);

const AnalyticsIcon = () => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 32 32">
    <Line x1="9" y1="23" x2="23" y2="23" {...IconStroke} />
    <Path d="M12 23 L12 15" {...IconStroke} />
    <Path d="M16 23 L16 11" {...IconStroke} />
    <Path d="M20 23 L20 17" {...IconStroke} />
  </Svg>
);

const AboutIcon = () => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 32 32">
    <Circle cx="16" cy="16" r="10" {...IconStroke} fill="none" />
    <Line x1="16" y1="12" x2="16" y2="20" {...IconStroke} />
    <Circle cx="16" cy="9" r="1" fill={MONOCLE_ACTIVE} />
  </Svg>
);

type ClubOption = {
  id: string;
  name: string;
  location: string;
  fleets: string;
  memberStatus?: 'connected' | 'available';
};

const SAMPLE_CLUBS: ClubOption[] = [
  {
    id: 'rhkyc',
    name: 'Royal Hong Kong Yacht Club',
    location: 'Hong Kong · Causeway Bay',
    fleets: 'Dragons · Etchells · Big Boat',
    memberStatus: 'connected',
  },
  {
    id: 'stfyc',
    name: 'St. Francis Yacht Club',
    location: 'San Francisco · Marina District',
    fleets: 'J/70 · Classics · Offshore',
  },
  {
    id: 'newport',
    name: 'Newport Harbor Yacht Club',
    location: 'Newport Beach, CA',
    fleets: 'Lehman 12 · Harbor 20 · Offshore',
  },
];

export const MoreScreen: React.FC<DomainDashboardProps> = ({ services }) => {
  const [showClubsModal, setShowClubsModal] = useState(false);
  const [activeClub, setActiveClub] = useState<ClubOption | null>(null);
  const [showClubDashboard, setShowClubDashboard] = useState(false);

  const handleComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature is under development!');
  };

  const clubOptions = useMemo(() => SAMPLE_CLUBS, []);

  const handleClubsPress = () => setShowClubsModal(true);
  const closeClubsModal = () => setShowClubsModal(false);

  const handleConnect = (club: ClubOption) => {
    services.analytics.trackEvent('more_clubs_connect', {
      clubId: club.id,
      status: club.memberStatus ?? 'available',
    });

    Alert.alert(
      club.memberStatus === 'connected' ? 'Already Connected' : 'Connection Incoming',
      club.memberStatus === 'connected'
        ? `Opening ${club.name} dashboard.`
        : `Connecting to ${club.name} will be available soon.`
    );

    if (club.memberStatus === 'connected') {
      setActiveClub(club);
      setShowClubsModal(false);
      setShowClubDashboard(true);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Optional Warning Banner */}
        {/* Uncomment when boat checking is implemented */}
        {/* <View style={styles.warningBanner}>
          <Text style={styles.warningText}>⚠️ Add a boat to unlock all features</Text>
        </View> */}

        {/* YOUR NETWORK Section */}
        <SectionHeader title="YOUR NETWORK" isFirst={true} />
        <View style={styles.section}>
          <MenuItem icon={<FleetsIcon />} label="Fleets" badge={3} onPress={handleComingSoon} />
          <MenuItem icon={<ClubsIcon />} label="Clubs" badge={2} onPress={handleClubsPress} />
          <MenuItem icon={<CrewIcon />} label="Crew" badge={8} onPress={handleComingSoon} />
        </View>

        {/* TOOLS & LEARNING Section */}
        <SectionHeader title="TOOLS & LEARNING" />
        <View style={styles.section}>
          <MenuItem
            icon={<CoachingIcon />}
            iconTone="accent"
            label="Coaching Marketplace"
            badge="NEW"
            badgeType="new"
            onPress={handleComingSoon}
          />
          <MenuItem icon={<TuningIcon />} label="Tuning Guides" onPress={handleComingSoon} />
          <MenuItem
            icon={<PracticeIcon />}
            iconTone="accent"
            label="Practice Plans"
            badge="NEW"
            badgeType="new"
            onPress={handleComingSoon}
          />
        </View>

        {/* SETTINGS Section */}
        <SectionHeader title="SETTINGS" />
        <View style={styles.section}>
          <MenuItem icon={<ProfileIcon />} label="Profile" onPress={handleComingSoon} />
          <MenuItem icon={<SettingsIcon />} label="Settings" onPress={handleComingSoon} />
          <MenuItem icon={<AnalyticsIcon />} label="Analytics" onPress={handleComingSoon} />
          <MenuItem icon={<AboutIcon />} label="About" onPress={handleComingSoon} />
        </View>
      </ScrollView>
      <Modal
        visible={showClubsModal}
        animationType="slide"
        transparent
        onRequestClose={closeClubsModal}
      >
        <View style={styles.clubModalOverlay}>
          <View style={styles.clubModalCard}>
            <View style={styles.clubModalHeader}>
              <View>
                <Text style={styles.clubModalTitle}>Clubs & Fleets</Text>
                <Text style={styles.clubModalSubtitle}>
                  Connect to your yacht clubs to sync calendars and unlock invitations.
                </Text>
              </View>
              <TouchableOpacity onPress={closeClubsModal}>
                <Text style={styles.clubModalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {clubOptions.map((club) => (
                <View key={club.id} style={styles.clubCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <Text style={styles.clubMeta}>{club.location}</Text>
                    <Text style={styles.clubMeta}>{club.fleets}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.connectButton, club.memberStatus === 'connected' && styles.connectButtonPrimary]}
                    onPress={() => handleConnect(club)}
                  >
                    <Text style={styles.connectButtonLabel}>
                      {club.memberStatus === 'connected' ? 'Open' : 'Connect'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showClubDashboard}
        animationType="slide"
        transparent
        onRequestClose={() => setShowClubDashboard(false)}
      >
        <View style={styles.dashboardOverlay}>
          <View style={styles.dashboardCard}>
            {activeClub ? (
              <ClubDashboard club={activeClub} onClose={() => setShowClubDashboard(false)} />
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const ClubDashboard = ({ club, onClose }: { club: ClubOption; onClose: () => void }) => {
  const upcomingEvents = [
    {
      id: 'evt-1',
      title: 'Friday Night Series · Race 5',
      start: 'Nov 22 · Warning 18:00',
      status: 'Registration open',
      entries: 42,
      capacity: 60,
    },
    {
      id: 'evt-2',
      title: 'Winter Champagne Regatta',
      start: 'Dec 7 · First gun 11:00',
      status: 'Draft',
      entries: 18,
      capacity: 80,
    },
  ];

  const registrationStats = {
    pending: 9,
    approved: 35,
    waitlist: 4,
    revenue: '$14.2k',
  };

  const communications = [
    {
      id: 'msg-1',
      title: 'Weather watch: NE 18-22kts',
      channel: 'SMS + Push',
      sentAt: 'Today · 09:10',
    },
    {
      id: 'msg-2',
      title: 'Volunteer briefing reminders',
      channel: 'Email',
      sentAt: 'Yesterday · 18:45',
    },
  ];

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.dashboardHeader}>
        <View>
          <Text style={styles.dashboardCapsule}>Club Workspace</Text>
          <Text style={styles.dashboardTitle}>{club.name}</Text>
          <Text style={styles.dashboardMeta}>{club.location}</Text>
        </View>
        <TouchableOpacity style={styles.dashboardClose} onPress={onClose}>
          <Text style={styles.dashboardCloseText}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.dashboardHero}>
          <View>
            <Text style={styles.heroStatLabel}>Active Fleets</Text>
            <Text style={styles.heroStatValue}>{club.fleets}</Text>
          </View>
          <View>
            <Text style={styles.heroStatLabel}>Events this month</Text>
            <Text style={styles.heroStatValue}>6</Text>
          </View>
          <View>
            <Text style={styles.heroStatLabel}>Volunteers</Text>
            <Text style={styles.heroStatValue}>28 confirmed</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {upcomingEvents.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventMeta}>{event.start}</Text>
              <Text style={styles.eventStatus}>{event.status}</Text>
            </View>
            <View style={styles.eventMetric}>
              <Text style={styles.eventMetricValue}>{event.entries}</Text>
              <Text style={styles.eventMetricLabel}>entries</Text>
              <Text style={styles.eventCapacity}>of {event.capacity}</Text>
            </View>
          </View>
        ))}

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending Approvals</Text>
            <Text style={styles.statValue}>{registrationStats.pending}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Approved</Text>
            <Text style={styles.statValue}>{registrationStats.approved}</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Waitlist</Text>
            <Text style={styles.statValue}>{registrationStats.waitlist}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Revenue</Text>
            <Text style={styles.statValue}>{registrationStats.revenue}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Communications</Text>
        {communications.map((message) => (
          <View key={message.id} style={styles.commCard}>
            <View>
              <Text style={styles.commTitle}>{message.title}</Text>
              <Text style={styles.commMeta}>{message.channel}</Text>
            </View>
            <Text style={styles.commTime}>{message.sentAt}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MONOCLE_CANVAS,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 4,
  },
  warningBanner: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  warningText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: MONOCLE_MUTED,
    paddingLeft: 20,
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: 1,
  },
  sectionHeaderFirst: {
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 12,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MONOCLE_RAISED,
    borderWidth: 1,
    borderColor: MONOCLE_BORDER,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginVertical: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconMedallion: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: MONOCLE_BORDER,
    backgroundColor: '#FFF7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIconMedallionAccent: {
    backgroundColor: '#F3E3CF',
    borderColor: MONOCLE_ACTIVE,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: MONOCLE_ACTIVE,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCount: {
    backgroundColor: MONOCLE_BADGE_ACCENT,
  },
  badgeNew: {
    backgroundColor: MONOCLE_BADGE_NEW,
  },
  badgeText: {
    color: MONOCLE_ACTIVE,
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextInverted: {
    color: '#FFF5EC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 24,
    color: MONOCLE_MUTED,
    fontWeight: '300',
  },
  clubModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(22,16,9,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  clubModalCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: MONOCLE_CANVAS,
    borderRadius: 28,
    padding: 22,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: MONOCLE_BORDER,
  },
  clubModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  clubModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MONOCLE_ACTIVE,
    letterSpacing: 0.5,
  },
  clubModalSubtitle: {
    fontSize: 13,
    color: MONOCLE_MUTED,
  },
  clubModalClose: {
    fontSize: 20,
    color: MONOCLE_MUTED,
  },
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: MONOCLE_BORDER,
    marginBottom: 12,
    backgroundColor: MONOCLE_RAISED,
    gap: 12,
  },
  clubName: {
    fontSize: 17,
    fontWeight: '700',
    color: MONOCLE_ACTIVE,
  },
  clubMeta: {
    fontSize: 13,
    color: MONOCLE_MUTED,
  },
  connectButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: MONOCLE_MUTED,
  },
  connectButtonPrimary: {
    backgroundColor: MONOCLE_ACTIVE,
  },
  connectButtonLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dashboardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(22,16,9,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dashboardCard: {
    width: '100%',
    maxWidth: 650,
    backgroundColor: MONOCLE_CANVAS,
    borderRadius: 28,
    maxHeight: '90%',
    padding: 24,
    borderWidth: 1,
    borderColor: MONOCLE_BORDER,
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
    color: '#6366F1',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  dashboardMeta: {
    fontSize: 14,
    color: '#475569',
  },
  dashboardClose: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  dashboardCloseText: {
    color: '#312E81',
    fontWeight: '600',
  },
  dashboardHero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  eventCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  eventMeta: {
    fontSize: 13,
    color: '#475569',
  },
  eventStatus: {
    fontSize: 12,
    color: '#16A34A',
    marginTop: 6,
  },
  eventMetric: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  eventMetricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  eventMetricLabel: {
    fontSize: 12,
    color: '#475569',
  },
  eventCapacity: {
    fontSize: 11,
    color: '#94A3B8',
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
  },
  commCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
  },
  commTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  commMeta: {
    fontSize: 12,
    color: '#475569',
  },
  commTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
