import React from 'react';
import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';
import { EventOverviewSurface, type EventOverviewProps } from '../EventOverview';
import { mockColorScheme, resetColorSchemeMock } from '../../../../test-utils/mockColorScheme';

const hero = {
  title: 'Marina Bay Invitational',
  subtitle: 'Skipper briefing starts in 2 hours',
  primaryCtaLabel: 'Open Event Workspace',
};

const quickActions: EventOverviewProps['quickActions'] = [
  { id: 'notes', label: 'Race Notes', icon: '📝' },
  { id: 'permits', label: 'Permits', icon: '📄' },
];

const highlightEvent: EventOverviewProps['highlightEvent'] = {
  name: 'Practice Regatta',
  dateRange: 'Mar 12 - Mar 13',
  venue: 'Newport Harbor',
  info: 'Winds steady at 15kts • Tide swing 2.1m',
  checklist: [
    { label: 'Sail inventory uploaded', state: 'complete' },
    { label: 'Waivers collected', state: 'pending' },
    { label: 'Dock brief scheduled', state: 'warning' },
  ],
  actions: [
    { label: 'Launch Dock Chat' },
    { label: 'Share Fleet Brief', variant: 'secondary' },
  ],
};

const upcomingEvents: EventOverviewProps['upcomingEvents'] = [
  { id: '1', name: 'District Trials', date: 'Mar 22', venue: 'San Diego YC', badge: 'Qualifier' },
  { id: '2', name: 'Rolex Big Boat', date: 'Apr 4', venue: 'StFYC' },
];

const emptyState = {
  title: 'No events yet',
  subtitle: 'Create an event plan to get started.',
  actionLabel: 'Start Planning',
};

const baseProps: EventOverviewProps = {
  hero,
  quickActions,
  highlightEvent,
  upcomingEvents,
  emptyState,
  children: (
    <View>
      <Text>Custom Child Content</Text>
    </View>
  ),
};

describe('EventOverviewSurface', () => {
  afterEach(() => {
    resetColorSchemeMock();
  });

  describe.each(['light', 'dark'] as const)('%s mode', (scheme) => {
    it('matches snapshot', () => {
      mockColorScheme(scheme);
      const tree = render(<EventOverviewSurface {...baseProps} />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
