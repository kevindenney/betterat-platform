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
export declare const useRaceConditions: import("zustand").UseBoundStore<import("zustand").StoreApi<RaceConditionsState>>;
declare class RaceConditionsStore {
    private conditions;
    getConditions(): any;
    setConditions(conditions: any): void;
}
export declare const raceConditionsStore: RaceConditionsStore;
export default raceConditionsStore;
//# sourceMappingURL=raceConditionsStore.d.ts.map