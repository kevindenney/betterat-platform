interface StrategicPlan {
  plan: string;
  steps: Array<Record<string, unknown>>;
  params: Record<string, unknown>;
}

export class StrategicPlanningService {
  async createPlan(params: Record<string, unknown>): Promise<StrategicPlan> {
    console.warn('StrategicPlanningService: Stub');
    return { plan: 'Strategic plan stub', steps: [], params };
  }
}

export const strategicPlanningService = new StrategicPlanningService();
