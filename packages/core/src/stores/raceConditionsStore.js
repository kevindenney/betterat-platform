// @ts-nocheck
import { create } from 'zustand';
export const useRaceConditions = create((set) => ({
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
    constructor() {
        this.conditions = null;
    }
    getConditions() {
        console.warn('RaceConditionsStore.getConditions: Stub - needs implementation');
        return this.conditions;
    }
    setConditions(conditions) {
        console.warn('RaceConditionsStore.setConditions: Stub - needs implementation');
        this.conditions = conditions;
    }
}
export const raceConditionsStore = new RaceConditionsStore();
export default raceConditionsStore;
