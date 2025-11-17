export interface RegulatoryAcknowledgements {
    cleanRegatta: boolean;
    signOn: boolean;
    safetyBriefing: boolean;
}
export interface RaceBriefData {
    id?: string;
    name?: string;
    series?: string;
    venue?: string;
    startTime?: string;
    warningSignal?: string;
    cleanRegatta?: boolean;
    countdown?: {
        days: number;
        hours: number;
        minutes: number;
    };
    weatherSummary?: string;
    tideSummary?: string;
    lastUpdated?: string | null;
}
export interface SailorRacePreparation {
    id?: string;
    race_event_id: string;
    sailor_id: string;
    rig_notes?: string;
    selected_rig_preset_id?: string;
    regulatory_acknowledgements?: RegulatoryAcknowledgements;
    race_brief_data?: RaceBriefData;
    created_at?: string;
    updated_at?: string;
}
declare class SailorRacePreparationService {
    /**
     * Get race preparation data for a specific sailor and race
     */
    getPreparation(raceEventId: string, sailorId: string): Promise<SailorRacePreparation | null>;
    /**
     * Upsert (create or update) race preparation data
     */
    upsertPreparation(preparation: SailorRacePreparation): Promise<SailorRacePreparation | null>;
    /**
     * Update rig notes for a race
     */
    updateRigNotes(raceEventId: string, sailorId: string, rigNotes: string): Promise<boolean>;
    /**
     * Update selected rig preset for a race
     */
    updateRigPreset(raceEventId: string, sailorId: string, rigPresetId: string): Promise<boolean>;
    /**
     * Update regulatory acknowledgements for a race
     */
    updateAcknowledgements(raceEventId: string, sailorId: string, acknowledgements: RegulatoryAcknowledgements): Promise<boolean>;
    /**
     * Update race brief data for AI context
     */
    updateRaceBrief(raceEventId: string, sailorId: string, raceBriefData: RaceBriefData): Promise<boolean>;
    /**
     * Delete race preparation data
     */
    deletePreparation(raceEventId: string, sailorId: string): Promise<boolean>;
    /**
     * Get all race preparations for a sailor
     */
    getSailorPreparations(sailorId: string): Promise<SailorRacePreparation[]>;
    /**
     * Toggle a specific acknowledgement
     */
    toggleAcknowledgement(raceEventId: string, sailorId: string, key: keyof RegulatoryAcknowledgements): Promise<boolean>;
}
export declare const sailorRacePreparationService: SailorRacePreparationService;
export {};
//# sourceMappingURL=SailorRacePreparationService.d.ts.map