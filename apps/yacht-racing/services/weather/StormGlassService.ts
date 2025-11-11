export type StormGlassForecast = {
  timestamp: string;
  windSpeed: number;
  windDirection: number;
  waveHeight: number;
};

class StormGlassService {
  async fetchForecast(lat: number, lng: number): Promise<StormGlassForecast[]> {
    console.warn('StormGlassService.fetchForecast: Stub response');
    return [
      {
        timestamp: new Date().toISOString(),
        windSpeed: 10,
        windDirection: 120,
        waveHeight: 0.5,
      },
    ];
  }
}

export const stormGlassService = new StormGlassService();
