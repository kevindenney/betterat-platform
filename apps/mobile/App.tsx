import React, { useMemo, useState, type ComponentType } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import {
  NavigationContainer,
  useNavigationContainerRef,
  type NavigationContainerRefWithCurrent,
  type ParamListBase,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  AuthProvider,
  DomainProvider,
  StripeProvider,
  useAuth,
  useDomain,
} from '@betterat/core';
import { GluestackUIProvider } from '@betterat/ui/components/ui/gluestack-ui-provider';
import type { DomainDashboardProps } from '@betterat/domain-sdk';
import sailRacingDomain from '../../domains/sailracing/src';
import nursingDomain from '../../domains/nursing/src';
import drawingDomain from '../../domains/drawing/src';
import testDomain from '../../domains/test/src';
import { RacesScreen } from '../../domains/sailracing/src/screens/RacesScreen';
import { CoursesScreen } from '../../domains/sailracing/src/screens/CoursesScreen';
import { BoatScreen } from '../../domains/sailracing/src/screens/BoatScreen';
import { VenueScreen } from '../../domains/sailracing/src/screens/VenueScreen';
import { MoreScreen } from '../../domains/sailracing/src/screens/MoreScreen';
import { createPlatformServices } from './src/platformServices';

const Tab = createBottomTabNavigator();
const DomainTab = createBottomTabNavigator();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
    },
  },
});

const INITIAL_DOMAINS = [sailRacingDomain, nursingDomain, drawingDomain, testDomain];
const INITIAL_ACTIVE_DOMAIN_IDS = [
  sailRacingDomain.meta.id,
  nursingDomain.meta.id,
  drawingDomain.meta.id,
  testDomain.meta.id,
];
const DEFAULT_DOMAIN_ID = sailRacingDomain.meta.id;
const MONOCLE_ACTIVE_COLOR = '#3D2C1F';
const MONOCLE_INACTIVE_COLOR = '#AC9E8C';
const MONOCLE_ICON_BORDER = '#D8CCBA';
const MONOCLE_ICON_BG = '#FFFBF5';
const MONOCLE_ICON_BG_ACTIVE = '#F1E8D9';
const MONOCLE_ICON_FILL = '#D9CCB6';
const MONOCLE_ICON_FILL_ACTIVE = '#B79D7A';
const MONOCLE_ICON_SIZE = 30;
const MONOCLE_ICON_STROKE_WIDTH = 1.6;

const RacesScreenWrapper = makeDomainScreen(RacesScreen);
const CoursesScreenWrapper = makeDomainScreen(CoursesScreen);
const BoatScreenWrapper = makeDomainScreen(BoatScreen);
const VenueScreenWrapper = makeDomainScreen(VenueScreen);
const MoreScreenWrapper = makeDomainScreen(MoreScreen);

export default function App() {
  return (
    <AuthProvider>
      <StripeProvider>
        <QueryClientProvider client={queryClient}>
          <GluestackUIProvider>
            <PlatformBoundary />
          </GluestackUIProvider>
        </QueryClientProvider>
      </StripeProvider>
    </AuthProvider>
  );
}

function PlatformBoundary() {
  const navigationRef = useNavigationContainerRef<ParamListBase>();
  const { loading, user } = useAuth();
  const [switcherVisible, setSwitcherVisible] = useState(false);

  const services = useMemo(
    () => createPlatformServices(navigationRef),
    [navigationRef]
  );

  if (loading) {
    return <LoadingState message="Checking your session…" />;
  }

  if (!user) {
    return <AuthWall />;
  }

  return (
    <DomainProvider
      userId={user?.id ?? 'guest-user'}
      services={services}
      initialDomains={INITIAL_DOMAINS}
      initialActiveDomains={INITIAL_ACTIVE_DOMAIN_IDS}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <DomainHeader onOpenSwitcher={() => setSwitcherVisible(true)} />
        <View style={styles.content}>
          <DomainNavigation navigationRef={navigationRef} />
        </View>
        <DomainSwitcherModal
          visible={switcherVisible}
          onClose={() => setSwitcherVisible(false)}
        />
      </SafeAreaView>
    </DomainProvider>
  );
}

const DEFAULT_DEMO_USERS = {
  sailor: {
    label: 'Demo Sailor',
    email: process.env.EXPO_PUBLIC_DEMO_SAILOR_IDENTIFIER ?? 'demo-sailor@regattaflow.app',
    password: process.env.EXPO_PUBLIC_DEMO_SAILOR_PASSWORD ?? 'Demo123!',
  },
  club: {
    label: 'Demo Club',
    email: process.env.EXPO_PUBLIC_DEMO_CLUB_IDENTIFIER ?? 'demo-club@regattaflow.app',
    password: process.env.EXPO_PUBLIC_DEMO_CLUB_PASSWORD ?? 'Demo123!',
  },
  coach: {
    label: 'Demo Coach',
    email: process.env.EXPO_PUBLIC_DEMO_COACH_IDENTIFIER ?? 'demo-coach@regattaflow.app',
    password: process.env.EXPO_PUBLIC_DEMO_COACH_PASSWORD ?? 'Demo123!',
  },
} as const;

type DemoUserKey = keyof typeof DEFAULT_DEMO_USERS;

function AuthWall() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Sign in required', 'Enter your email and password to continue.');
      return;
    }

    try {
      setSubmitting(true);
      await signIn(email.trim(), password);
    } catch (error: any) {
      Alert.alert('Sign in failed', error?.message ?? 'Please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (key: DemoUserKey) => {
    const demo = DEFAULT_DEMO_USERS[key];
    setEmail(demo.email);
    setPassword(demo.password);

    try {
      setSubmitting(true);
      await signIn(demo.email, demo.password);
    } catch (error: any) {
      Alert.alert('Demo sign in failed', error?.message ?? 'Please try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.authCard}>
        <Text style={styles.authTitle}>Sign in to BetterAt</Text>
        <Text style={styles.authSubtitle}>Use your Supabase credentials or a demo account.</Text>

        <View style={styles.authField}>
          <Text style={styles.authLabel}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="crew@club.com"
            style={styles.authInput}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            editable={!submitting}
          />
        </View>

        <View style={styles.authField}>
          <Text style={styles.authLabel}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            style={styles.authInput}
            secureTextEntry
            editable={!submitting}
          />
        </View>

        <TouchableOpacity
          style={[styles.authButton, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.authButtonText}>{submitting ? 'Signing in…' : 'Sign In'}</Text>
        </TouchableOpacity>

        <View style={styles.authDivider}>
          <View style={styles.authDividerLine} />
          <Text style={styles.authDividerText}>or quick demo</Text>
          <View style={styles.authDividerLine} />
        </View>

        <View style={styles.authDemoRow}>
          {(Object.keys(DEFAULT_DEMO_USERS) as DemoUserKey[]).map((key) => {
            const demo = DEFAULT_DEMO_USERS[key];
            return (
              <TouchableOpacity
                key={key}
                style={[styles.authDemoButton, submitting && styles.buttonDisabled]}
                onPress={() => handleDemoLogin(key)}
                disabled={submitting}
              >
                <Text style={styles.authDemoLabel}>{demo.label}</Text>
                <Text style={styles.authDemoEmail}>{demo.email}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

function DomainNavigation({
  navigationRef,
}: {
  navigationRef: NavigationContainerRefWithCurrent<ParamListBase>;
}) {
  const { currentDomain } = useDomain();
  const navigationKey = currentDomain?.meta.id ?? 'betterat-domain';

  return (
    <NavigationContainer key={navigationKey} ref={navigationRef}>
      <DomainContent />
    </NavigationContainer>
  );
}

function DomainContent() {
  const { currentDomain } = useDomain();

  if (!currentDomain) {
    return <LoadingState message="Select a domain to begin" />;
  }

  if (currentDomain.meta.id === DEFAULT_DOMAIN_ID) {
    return <YachtRacingTabs />;
  }

  const domainRoutes = currentDomain.routes ?? [];
  const fallbackComponent =
    currentDomain.meta.id === 'nursing'
      ? domainRoutes.find((route) => route.path === '/operations')?.component ?? currentDomain.components?.Dashboard
      : currentDomain.components?.Dashboard;

  if (!domainRoutes.length || !fallbackComponent) {
    return (
      <View style={styles.domainContent}>
        <DomainComponentRenderer component={fallbackComponent ?? (() => <View />)} />
      </View>
    );
  }

  const preferredRoutePath =
    domainRoutes.find((route: any) => route.initial)?.path ??
    (currentDomain.meta.id === 'nursing'
      ? '/operations'
      : currentDomain.meta.id === 'drawing'
        ? '/sessions'
        : domainRoutes[0]?.path ?? '/');

  const initialRouteName = getDomainRouteScreenName(preferredRoutePath ?? '/');

  return (
    <DomainTab.Navigator
      key={`domain-tabs-${currentDomain.meta.id}`}
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5A422A',
        tabBarInactiveTintColor: '#A59787',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {domainRoutes.map((route) => {
        const RouteComponent = route.component ?? fallbackComponent;
        if (!RouteComponent) return null;
        return (
          <DomainTab.Screen
            key={route.path}
            name={getDomainRouteScreenName(route.path)}
            component={makeDomainScreen(RouteComponent)}
            options={{
              title: route.tabLabel ?? route.name,
              tabBarIcon: renderTabIcon(route.tabIcon ?? '✨'),
            }}
          />
        );
      })}
    </DomainTab.Navigator>
  );
}

function YachtRacingTabs() {
  const [moreVisible, setMoreVisible] = useState(false);

  const openMore = () => setMoreVisible(true);
  const closeMore = () => setMoreVisible(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: MONOCLE_ACTIVE_COLOR,
          tabBarInactiveTintColor: MONOCLE_INACTIVE_COLOR,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen
          name="Races"
          component={RacesScreenWrapper}
          options={{ tabBarIcon: (props) => <MonocleRacesIcon {...props} /> }}
        />
        <Tab.Screen
          name="Courses"
          component={CoursesScreenWrapper}
          options={{ tabBarIcon: (props) => <MonocleCoursesIcon {...props} /> }}
        />
        <Tab.Screen
          name="Boat"
          component={BoatScreenWrapper}
          options={{ tabBarIcon: (props) => <MonocleBoatIcon {...props} /> }}
        />
        <Tab.Screen
          name="Venue"
          component={VenueScreenWrapper}
          options={{ tabBarIcon: (props) => <MonocleVenueIcon {...props} /> }}
        />
        <Tab.Screen
          name="More"
          component={EmptyScreen}
          options={{ tabBarIcon: (props) => <MonocleMoreIcon {...props} /> }}
          listeners={{
            tabPress: (event) => {
              event.preventDefault();
              openMore();
            },
          }}
        />
      </Tab.Navigator>

      <Modal
        transparent
        animationType="slide"
        visible={moreVisible}
        onRequestClose={closeMore}
      >
        <View style={styles.moreModalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeMore} />
          <View style={styles.moreModalSheet}>
            <View style={styles.moreModalHeader}>
              <Text style={styles.moreModalTitle}>More</Text>
              <TouchableOpacity onPress={closeMore}>
                <Text style={styles.moreModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.moreModalContent}>
              <MoreScreenWrapper />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function EmptyScreen() {
  return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
}

function DomainHeader({ onOpenSwitcher }: { onOpenSwitcher: () => void }) {
  const { currentDomain } = useDomain();

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.platformTitle}>BetterAt</Text>
      </View>
      <TouchableOpacity style={styles.switcherButton} onPress={onOpenSwitcher}>
        <Text style={styles.switcherText}>{currentDomain?.meta.name ?? 'Switch'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function DomainSwitcherModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { currentDomain, activeDomains, switchDomain } = useDomain();

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
        />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Switch domain</Text>
          {INITIAL_DOMAINS.map((domain) => {
            const isActive = activeDomains.includes(domain.meta.id);
            const isCurrent = currentDomain?.meta.id === domain.meta.id;
            return (
              <TouchableOpacity
                key={domain.meta.id}
                disabled={!isActive}
                style={[
                  styles.domainRow,
                  isCurrent && styles.domainRowActive,
                  !isActive && styles.domainRowDisabled,
                ]}
                onPress={() => {
                  switchDomain(domain.meta.id);
                  onClose();
                }}
              >
                <Text style={styles.domainIcon}>{domain.meta.icon ?? '✨'}</Text>
                <View style={styles.domainMeta}>
                  <Text style={styles.domainName}>{domain.meta.name}</Text>
                  <Text style={styles.domainDescription}>
                    {domain.meta.description ?? 'Domain module'}
                  </Text>
                </View>
                {isCurrent && <Text style={styles.domainCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

function DomainComponentRenderer({
  component: Component,
}: {
  component: ComponentType<DomainDashboardProps>;
}) {
  const { userId, services } = useDomain();
  return <Component userId={userId} services={services} />;
}

function LoadingState({ message }: { message: string }) {
  return (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

type TabIconRenderProps = {
  focused: boolean;
  color: string;
  size: number;
};

function MonocleIconBase({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  return (
    <View style={[styles.monocleIconBase, focused && styles.monocleIconBaseActive]}>
      {children}
    </View>
  );
}

function MonocleRacesIcon({ focused, color }: TabIconRenderProps) {
  const fill = focused ? MONOCLE_ICON_FILL_ACTIVE : MONOCLE_ICON_FILL;
  return (
    <MonocleIconBase focused={focused}>
      <Svg width={MONOCLE_ICON_SIZE} height={MONOCLE_ICON_SIZE} viewBox="0 0 32 32">
        <Circle cx="16" cy="16" r="11.5" stroke={color} strokeWidth={MONOCLE_ICON_STROKE_WIDTH} fill="none" />
        <Line x1="12" y1="10" x2="12" y2="22" stroke={color} strokeWidth={MONOCLE_ICON_STROKE_WIDTH} strokeLinecap="round" />
        <Path
          d="M12 12 L21 14.7 L12 17.5 Z"
          fill={fill}
          stroke={color}
          strokeWidth={MONOCLE_ICON_STROKE_WIDTH}
          strokeLinejoin="round"
        />
      </Svg>
    </MonocleIconBase>
  );
}

function MonocleCoursesIcon({ focused, color }: TabIconRenderProps) {
  const fill = focused ? MONOCLE_ICON_FILL_ACTIVE : MONOCLE_ICON_FILL;
  return (
    <MonocleIconBase focused={focused}>
      <Svg width={MONOCLE_ICON_SIZE} height={MONOCLE_ICON_SIZE} viewBox="0 0 32 32">
        <Circle cx="16" cy="16" r="11.5" stroke={color} strokeWidth={MONOCLE_ICON_STROKE_WIDTH} fill="none" />
        <Line x1="16" y1="7.5" x2="16" y2="24.5" stroke={color} strokeWidth={MONOCLE_ICON_STROKE_WIDTH} strokeLinecap="round" />
        <Line x1="7.5" y1="16" x2="24.5" y2="16" stroke={color} strokeWidth={MONOCLE_ICON_STROKE_WIDTH} strokeLinecap="round" />
        <Path
          d="M16 9.5 L20 16 L16 22.5 L12 16 Z"
          fill={fill}
          stroke={color}
          strokeWidth={MONOCLE_ICON_STROKE_WIDTH}
          strokeLinejoin="round"
        />
      </Svg>
    </MonocleIconBase>
  );
}

function MonocleBoatIcon({ focused, color }: TabIconRenderProps) {
  const fill = focused ? MONOCLE_ICON_FILL_ACTIVE : MONOCLE_ICON_FILL;
  return (
    <MonocleIconBase focused={focused}>
      <Svg width={MONOCLE_ICON_SIZE} height={MONOCLE_ICON_SIZE} viewBox="0 0 32 32">
        <Path
          d="M9 18.5 C11 23, 21 23, 23 18.5"
          stroke={color}
          strokeWidth={MONOCLE_ICON_STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
        />
        <Line x1="16" y1="7" x2="16" y2="19" stroke={color} strokeWidth={MONOCLE_ICON_STROKE_WIDTH} strokeLinecap="round" />
        <Path
          d="M16 7 L11 13 H21 Z"
          fill={fill}
          stroke={color}
          strokeWidth={MONOCLE_ICON_STROKE_WIDTH}
          strokeLinejoin="round"
        />
        <Line x1="8" y1="20.5" x2="24" y2="20.5" stroke={color} strokeWidth={MONOCLE_ICON_STROKE_WIDTH} strokeLinecap="round" />
      </Svg>
    </MonocleIconBase>
  );
}

function MonocleVenueIcon({ focused, color }: TabIconRenderProps) {
  const fill = focused ? MONOCLE_ICON_FILL_ACTIVE : MONOCLE_ICON_FILL;
  return (
    <MonocleIconBase focused={focused}>
      <Svg width={MONOCLE_ICON_SIZE} height={MONOCLE_ICON_SIZE} viewBox="0 0 32 32">
        <Path
          d="M16 7 C12.7 7 10 9.7 10 13.2 C10 17.4 16 24.5 16 24.5 C16 24.5 22 17.4 22 13.2 C22 9.7 19.3 7 16 7 Z"
          stroke={color}
          strokeWidth={MONOCLE_ICON_STROKE_WIDTH}
          fill="none"
        />
        <Circle cx="16" cy="13" r="2.4" fill={fill} stroke={color} strokeWidth={MONOCLE_ICON_STROKE_WIDTH} />
        <Line x1="9" y1="25" x2="23" y2="25" stroke={color} strokeWidth={MONOCLE_ICON_STROKE_WIDTH} strokeLinecap="round" />
      </Svg>
    </MonocleIconBase>
  );
}

function MonocleMoreIcon({ focused, color }: TabIconRenderProps) {
  return (
    <MonocleIconBase focused={focused}>
      <Svg width={MONOCLE_ICON_SIZE} height={MONOCLE_ICON_SIZE} viewBox="0 0 32 32">
        <Line x1="10" y1="11" x2="22" y2="11" stroke={color} strokeWidth={MONOCLE_ICON_STROKE_WIDTH} strokeLinecap="round" />
        <Line x1="10" y1="16" x2="22" y2="16" stroke={color} strokeWidth={MONOCLE_ICON_STROKE_WIDTH} strokeLinecap="round" />
        <Line x1="10" y1="21" x2="22" y2="21" stroke={color} strokeWidth={MONOCLE_ICON_STROKE_WIDTH} strokeLinecap="round" />
        <Circle cx="13" cy="11" r="1.4" fill={focused ? MONOCLE_ICON_FILL_ACTIVE : MONOCLE_ICON_FILL} stroke={color} strokeWidth={MONOCLE_ICON_STROKE_WIDTH} />
        <Circle cx="19" cy="21" r="1.4" fill={focused ? MONOCLE_ICON_FILL_ACTIVE : MONOCLE_ICON_FILL} stroke={color} strokeWidth={MONOCLE_ICON_STROKE_WIDTH} />
      </Svg>
    </MonocleIconBase>
  );
}

function renderTabIcon(icon: string) {
  return ({ color }: { color: string }) => <Text style={[styles.tabIcon, { color }]}>{icon}</Text>;
}

function makeDomainScreen(
  Component: ComponentType<DomainDashboardProps>
): ComponentType<any> {
  return function DomainScreenWrapper(_props: unknown) {
    const { userId, services } = useDomain();
    return <Component userId={userId} services={services} />;
  };
}

function getDomainRouteScreenName(path: string) {
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `domain-${normalized.replace(/[^a-zA-Z0-9-]/g, '-') || 'root'}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#D8CCBA',
    backgroundColor: '#F7F3EB',
  },
  platformTitle: {
    fontSize: 26,
    color: '#1F1810',
    fontFamily: Platform.select({ ios: 'Iowan Old Style', android: 'serif', default: 'Georgia' }),
  },
  switcherButton: {
    backgroundColor: '#FFFDF8',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D8CCBA',
  },
  switcherText: {
    color: '#5C4D3F',
    fontWeight: '600',
    letterSpacing: 1,
  },
  tabBar: {
    height: 72,
    paddingBottom: 10,
    paddingTop: 10,
    backgroundColor: '#F7F3EB',
    borderTopWidth: 1,
    borderTopColor: '#D8CCBA',
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 20,
  },
  monocleIconBase: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: MONOCLE_ICON_BORDER,
    backgroundColor: MONOCLE_ICON_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monocleIconBaseActive: {
    borderColor: MONOCLE_ACTIVE_COLOR,
    backgroundColor: MONOCLE_ICON_BG_ACTIVE,
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0 : 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#475569',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  domainContent: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  domainRowActive: {
    backgroundColor: '#EEF2FF',
  },
  domainRowDisabled: {
    opacity: 0.5,
  },
  domainIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  domainMeta: {
    flex: 1,
  },
  domainName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  domainDescription: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  domainCheck: {
    fontSize: 18,
    color: '#2563EB',
    fontWeight: '700',
  },
  moreModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(22,16,9,0.55)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  moreModalSheet: {
    backgroundColor: '#FFFDF8',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 32,
    minHeight: '60%',
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: '#E5D6C1',
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0 : 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
  },
  moreModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  moreModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MONOCLE_ACTIVE_COLOR,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  moreModalClose: {
    fontSize: 20,
    color: MONOCLE_INACTIVE_COLOR,
    padding: 8,
  },
  moreModalContent: {
    flex: 1,
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#F8F5EE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E4D9C8',
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0 : 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  authSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 20,
  },
  authField: {
    marginBottom: 14,
  },
  authLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  authInput: {
    borderWidth: 1,
    borderColor: '#D4C6B4',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFBF5',
  },
  authButton: {
    marginTop: 4,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  authDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 8,
  },
  authDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  authDividerText: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  authDemoRow: {
    gap: 12,
  },
  authDemoButton: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#F8FAFF',
  },
  authDemoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  authDemoEmail: {
    marginTop: 4,
    fontSize: 13,
    color: '#475569',
  },
});
