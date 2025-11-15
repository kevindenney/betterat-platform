export type SimulationResults = {
  winProbability: number;
  podiumProbability: number;
  notes: string[];
};

class MonteCarloService {
  async runSimulation(params: any): Promise<SimulationResults> {
    console.warn('monteCarloService.runSimulation: Stub response');
    return {
      winProbability: 0.25,
      podiumProbability: 0.55,
      notes: ['Simulation service not implemented. Returning placeholder data.'],
    };
  }
}

export const monteCarloService = new MonteCarloService();
