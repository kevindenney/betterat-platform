import React, { useMemo, useState, type ComponentType } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
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
import testDomain from '@betterat/domains-test';
import yachtRacingDomain from '@betterat/domains-yachtracing';
import { RacesScreen } from '../../domains/yachtracing/src/screens/RacesScreen';
import { CoursesScreen } from '../../domains/yachtracing/src/screens/CoursesScreen';
import { BoatScreen } from '../../domains/yachtracing/src/screens/BoatScreen';
import { VenueScreen } from '../../domains/yachtracing/src/screens/VenueScreen';
import { MoreScreen } from '../../domains/yachtracing/src/screens/MoreScreen';
import { createPlatformServices } from './src/platformServices';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
    },
  },
});

const INITIAL_DOMAINS = [testDomain, yachtRacingDomain];
const INITIAL_ACTIVE_DOMAIN_IDS = [yachtRacingDomain.meta.id, testDomain.meta.id];
const DEFAULT_DOMAIN_ID = yachtRacingDomain.meta.id;

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
  const navigationRef = useNavigationContainerRef();
  const { loading, user } = useAuth();
  const [switcherVisible, setSwitcherVisible] = useState(false);

  const services = useMemo(
    () => createPlatformServices(navigationRef),
    [navigationRef]
  );

  if (loading) {
    return <LoadingState message="Checking your session…" />;
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
          <NavigationContainer ref={navigationRef}>
            <DomainContent />
          </NavigationContainer>
        </View>
        <DomainSwitcherModal
          visible={switcherVisible}
          onClose={() => setSwitcherVisible(false)}
        />
      </SafeAreaView>
    </DomainProvider>
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

  const Dashboard = currentDomain.components?.Dashboard;
  if (Dashboard) {
    return <DomainComponentRenderer component={Dashboard} />;
  }

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>{currentDomain.meta.name}</Text>
      <Text style={styles.emptyStateSubtitle}>
        This domain does not have a dashboard yet.
      </Text>
    </View>
  );
}

function YachtRacingTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Races"
        component={RacesScreenWrapper}
        options={{ tabBarIcon: renderTabIcon('🏁') }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesScreenWrapper}
        options={{ tabBarIcon: renderTabIcon('🧭') }}
      />
      <Tab.Screen
        name="Boat"
        component={BoatScreenWrapper}
        options={{ tabBarIcon: renderTabIcon('⛵️') }}
      />
      <Tab.Screen
        name="Venue"
        component={VenueScreenWrapper}
        options={{ tabBarIcon: renderTabIcon('🌍') }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreenWrapper}
        options={{ tabBarIcon: renderTabIcon('☰') }}
      />
    </Tab.Navigator>
  );
}

function DomainHeader({ onOpenSwitcher }: { onOpenSwitcher: () => void }) {
  const { currentDomain } = useDomain();

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.platformTitle}>🚀 BetterAt Platform</Text>
        <Text style={styles.platformSubtitle}>
          {currentDomain
            ? `Loaded: ${currentDomain.meta.name}`
            : 'No domain selected'}
        </Text>
      </View>
      <TouchableOpacity style={styles.switcherButton} onPress={onOpenSwitcher}>
        <Text style={styles.switcherText}>Switch</Text>
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

function renderTabIcon(icon: string) {
  return () => <Text style={styles.tabIcon}>{icon}</Text>;
}

function makeDomainScreen(
  Component: ComponentType<DomainDashboardProps>
): ComponentType<any> {
  return function DomainScreenWrapper(_props: unknown) {
    const { userId, services } = useDomain();
    return <Component userId={userId} services={services} />;
  };
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
  },
  platformTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  platformSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#475569',
  },
  switcherButton: {
    backgroundColor: '#E0ECFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  switcherText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  tabBar: {
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 20,
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
});
