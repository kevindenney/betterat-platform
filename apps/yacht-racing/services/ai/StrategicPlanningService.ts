export class StrategicPlanningService {
  async createPlan(params: any) {
    console.warn('StrategicPlanningService: Stub');
    return { plan: 'Strategic plan stub', steps: [], params };
  }
}

export const strategicPlanningService = new StrategicPlanningService();
