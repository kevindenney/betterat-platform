// @ts-nocheck
export type StormGlassForecast = {
  timestamp: string;
  windSpeed: number;
  windDirection: number;
  waveHeight: number;
};

export class StormGlassService {
  private apiKey?: string;
  private baseUrl?: string;
  private timeout?: number;
  private retryAttempts?: number;

  constructor(config?: { apiKey?: string; baseUrl?: string; timeout?: number; retryAttempts?: number }) {
    this.apiKey = config?.apiKey;
    this.baseUrl = config?.baseUrl;
    this.timeout = config?.timeout;
    this.retryAttempts = config?.retryAttempts;
  }

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

// Export both named and default for compatibility
export const stormGlassService = new StormGlassService();
export default StormGlassService;
