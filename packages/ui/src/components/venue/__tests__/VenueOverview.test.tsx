import React from 'react';
import { render } from '@testing-library/react-native';
import { VenueOverview, type VenueOverviewProps } from '../VenueOverview';
import type { MapLayers } from '../MapControls';
import { mockColorScheme, resetColorSchemeMock } from '../../../../test-utils/mockColorScheme';

const mockLayers: MapLayers = {
  yachtClubs: true,
  sailmakers: true,
  riggers: false,
  coaches: false,
  chandlery: false,
  clothing: true,
  marinas: true,
  repair: false,
  engines: true,
};

const baseProps: VenueOverviewProps = {
  hero: {
    venueName: 'Porto Cervo',
    country: 'Italy',
    region: 'Sardinia',
    distanceLabel: '4.6 nm from current position',
    travelTip: 'Customs pre-clearance closes at 17:00 local.',
    windSummary: 'NE 14kts • Gusting 20kts',
    latitude: 41.1389,
    longitude: 9.5315,
  },
  stats: [
    { id: 'dockage', label: 'Dockage', value: '78%', detail: '4 slips available' },
    { id: 'fuel', label: 'Fuel', value: 'Diesel + Gas', trend: 'flat' },
  ],
  checklist: [
    {
      id: 'logistics',
      title: 'Arrival Prep',
      items: [
        { id: 'passport', label: 'Crew passports uploaded', status: 'ready' },
        { id: 'pilotage', label: 'Pilotage briefing scheduled', status: 'todo' },
      ],
    },
    {
      id: 'ops',
      title: 'Ops',
      items: [{ id: 'shore', label: 'Shore power confirmed', status: 'warning' }],
    },
  ],
  chips: {
    layers: mockLayers,
    onToggleLayer: jest.fn(),
  },
  children: (
    <VenueOverview
      hero={{
        venueName: 'Training Dock',
        distanceLabel: '1.2 nm away',
      }}
    />
  ),
};

describe('VenueOverview', () => {
  afterEach(() => {
    resetColorSchemeMock();
  });

  describe.each(['light', 'dark'] as const)('%s mode', (scheme) => {
    it('matches snapshot', () => {
      mockColorScheme(scheme);
      const tree = render(<VenueOverview {...baseProps} />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
