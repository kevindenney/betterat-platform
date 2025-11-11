export function generateMockForecast(lat: number, lng: number, hours: number) {
  const results = [] as Array<{ timestamp: string; windSpeed: number; windDirection: number; waveHeight: number }>;
  for (let i = 0; i < hours; i++) {
    results.push({
      timestamp: new Date(Date.now() + i * 3600 * 1000).toISOString(),
      windSpeed: 8 + Math.sin(i) * 2,
      windDirection: (90 + i * 5) % 360,
      waveHeight: 0.4 + (i % 3) * 0.1,
    });
  }
  return results;
}
