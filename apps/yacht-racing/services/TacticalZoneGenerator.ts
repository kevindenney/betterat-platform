export type TacticalZone = {
  id: string;
  label: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
};

class TacticalZoneGeneratorService {
  async generateZones(params: any): Promise<TacticalZone[]> {
    console.warn('TacticalZoneGeneratorService.generateZones: Stub response');
    return [
      {
        id: 'zone-1',
        label: 'Right Shift Lane',
        priority: 'high',
        description: 'Stub tactical zone generated pending AI service.',
      },
    ];
  }
}

export const TacticalZoneGenerator = new TacticalZoneGeneratorService();
