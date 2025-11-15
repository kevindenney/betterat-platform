// @ts-nocheck
import { create } from 'zustand';

export interface Course {
  id: string;
  name?: string;
  marks?: any[];
  legs?: any[];
  startLine?: any;
  laps?: number;
}

export interface Position {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface Environment {
  windSpeed?: number;
  windDirection?: number;
  temperature?: number;
  currentSpeed?: number;
  currentDirection?: number;
  waveHeight?: number;
}

export interface TacticalZone {
  id: string;
  type: string;
  coordinates: any[];
  metadata?: any;
}

interface RaceConditionsState {
  position: Position | null;
  environment: Environment | null;
  course: Course | null;
  tacticalZones: TacticalZone[];
  draft: any | null;

  updatePosition: (position: Position) => void;
  updateEnvironment: (environment: Environment) => void;
  updateCourse: (course: Course) => void;
  setTacticalZones: (zones: TacticalZone[]) => void;
  setDraft: (draft: any) => void;
  reset: () => void;
}

export const useRaceConditions = create<RaceConditionsState>((set) => ({
  position: null,
  environment: null,
  course: null,
  tacticalZones: [],
  draft: null,

  updatePosition: (position) => set({ position }),
  updateEnvironment: (environment) => set({ environment }),
  updateCourse: (course) => set({ course }),
  setTacticalZones: (tacticalZones) => set({ tacticalZones }),
  setDraft: (draft) => set({ draft }),
  reset: () => set({
    position: null,
    environment: null,
    course: null,
    tacticalZones: [],
    draft: null,
  }),
}));

// Legacy class-based store for backwards compatibility
class RaceConditionsStore {
  private conditions: any | null = null;

  getConditions() {
    console.warn('RaceConditionsStore.getConditions: Stub - needs implementation');
    return this.conditions;
  }

  setConditions(conditions: any) {
    console.warn('RaceConditionsStore.setConditions: Stub - needs implementation');
    this.conditions = conditions;
  }
}

export const raceConditionsStore = new RaceConditionsStore();
export default raceConditionsStore;
