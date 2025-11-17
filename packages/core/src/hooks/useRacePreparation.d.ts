import { type RegulatoryAcknowledgements, type RaceBriefData } from '../services/SailorRacePreparationService';
interface UseRacePreparationOptions {
    raceEventId: string | null;
    autoSave?: boolean;
    debounceMs?: number;
}
interface UseRacePreparationReturn {
    rigNotes: string;
    selectedRigPresetId: string | null;
    acknowledgements: RegulatoryAcknowledgements;
    raceBriefData: RaceBriefData | null;
    isLoading: boolean;
    isSaving: boolean;
    setRigNotes: (notes: string) => void;
    setSelectedRigPresetId: (id: string | null) => void;
    setAcknowledgements: (acks: RegulatoryAcknowledgements) => void;
    toggleAcknowledgement: (key: keyof RegulatoryAcknowledgements) => void;
    updateRaceBrief: (data: RaceBriefData) => void;
    save: () => Promise<void>;
    refresh: () => Promise<void>;
}
/**
 * Hook to manage sailor race preparation data with automatic persistence
 */
export declare function useRacePreparation({ raceEventId, autoSave, debounceMs, }: UseRacePreparationOptions): UseRacePreparationReturn;
export {};
//# sourceMappingURL=useRacePreparation.d.ts.map