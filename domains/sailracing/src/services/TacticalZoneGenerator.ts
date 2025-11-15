export type TacticalZone = {
  id: string;
  label: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
};

export class TacticalZoneGeneratorService {
  async generateZones(_: Record<string, unknown>): Promise<TacticalZone[]> {
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
