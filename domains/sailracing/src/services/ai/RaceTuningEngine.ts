// @ts-nocheck
/**
 * Placeholder RaceTuningEngine
 *
 * The production engine lives in the mobile runtime where Anthropics Skills
 * are injected. For Expo/web builds we provide a stub that keeps the shared
 * RaceTuningService API surface but always reports itself as unavailable so
 * the service falls back to deterministic tuning guide logic.
 */

export type RaceTuningCandidate = {
  guide: {
    id?: string | null;
    title?: string | null;
    source?: string | null;
    year?: number | null;
    tags?: string[] | null;
    rig?: string | null;
    mast?: string | null;
    sailmaker?: string | null;
    hull?: string | null;
  };
  section: {
    title?: string | null;
    content?: string | null;
    conditions?: Record<string, any> | null;
    settings?: Record<string, string> | null;
  };
  score: number;
};

class RaceTuningEngineStub {
  isAvailable(): boolean {
    return false;
  }

  isSkillReady(): boolean {
    return false;
  }

  async generateRecommendations(): Promise<any[]> {
    return [];
  }

  async generateAIOnlyRecommendations(): Promise<any[]> {
    return [];
  }
}

export const raceTuningEngine = new RaceTuningEngineStub();
