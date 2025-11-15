
interface MockScenario {
  windSpeed: number;
  windDirection: number;
  tide: 'ebb' | 'flood' | 'slack';
  notes: string;
}

type UpdateCallback = (data: MockScenario) => void;

export function generateMockRacingScenario(): MockScenario {
  console.warn('generateMockRacingScenario: Stub response');
  return {
    windSpeed: 12,
    windDirection: 70,
    tide: 'ebb',
    notes: 'Scenario generator not yet implemented.'
  };
}

export function createLiveDataSimulator() {
  console.warn('createLiveDataSimulator: Stub response');

  return {
    start: () => console.warn('liveDataSimulator.start: Stub'),
    stop: () => console.warn('liveDataSimulator.stop: Stub'),
    onUpdate: (_cb: UpdateCallback) => console.warn('liveDataSimulator.onUpdate: Stub'),
  };
}
