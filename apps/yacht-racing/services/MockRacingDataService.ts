export function generateMockRacingScenario() {
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
    onUpdate: (_cb: (data: any) => void) => console.warn('liveDataSimulator.onUpdate: Stub'),
  };
}
