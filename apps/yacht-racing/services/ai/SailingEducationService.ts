export class SailingEducationService {
  async getContent(topic: string) {
    console.warn('SailingEducationService: Stub');
    return { title: topic, content: 'Educational content coming soon' };
  }

  async getEducationallyEnhancedStrategy(title: string, venueId: string, context: any) {
    console.warn('SailingEducationService.getEducationallyEnhancedStrategy: Stub');
    return {
      insights: [
        {
          title,
          venueId,
          summary: 'Stub educational insight',
          context,
        },
      ],
    };
  }
}

export const sailingEducationService = new SailingEducationService();
