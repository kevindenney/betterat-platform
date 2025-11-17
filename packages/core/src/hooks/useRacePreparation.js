// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
import { sailorRacePreparationService, } from '../services/SailorRacePreparationService';
import { useAuth } from '../providers/AuthProvider';
import { createLogger } from '../lib/utils/logger';
const logger = createLogger('useRacePreparation');
const DEFAULT_ACKNOWLEDGEMENTS = {
    cleanRegatta: false,
    signOn: false,
    safetyBriefing: false,
};
/**
 * Hook to manage sailor race preparation data with automatic persistence
 */
export function useRacePreparation({ raceEventId, autoSave = true, debounceMs = 1000, }) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    // State
    const [rigNotes, setRigNotesState] = useState('');
    const [selectedRigPresetId, setSelectedRigPresetIdState] = useState(null);
    const [acknowledgements, setAcknowledgements] = useState(DEFAULT_ACKNOWLEDGEMENTS);
    const [raceBriefData, setRaceBriefData] = useState(null);
    // Refs for debouncing
    const saveTimeoutRef = useRef();
    const pendingChangesRef = useRef({});
    /**
     * Load preparation data from Supabase
     */
    const loadPreparation = useCallback(async () => {
        if (!raceEventId || !user?.id) {
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            const data = await sailorRacePreparationService.getPreparation(raceEventId, user.id);
            if (data) {
                setRigNotesState(data.rig_notes || '');
                setSelectedRigPresetIdState(data.selected_rig_preset_id || null);
                setAcknowledgements(data.regulatory_acknowledgements || DEFAULT_ACKNOWLEDGEMENTS);
                setRaceBriefData(data.race_brief_data || null);
                logger.info('Loaded race preparation data');
            }
            else {
                // No existing data, reset to defaults
                setRigNotesState('');
                setSelectedRigPresetIdState(null);
                setAcknowledgements(DEFAULT_ACKNOWLEDGEMENTS);
                setRaceBriefData(null);
                logger.info('No existing race preparation data');
            }
        }
        catch (error) {
            logger.error('Failed to load race preparation:', error);
        }
        finally {
            setIsLoading(false);
        }
    }, [raceEventId, user?.id]);
    /**
     * Save pending changes to Supabase
     */
    const saveChanges = useCallback(async () => {
        if (!raceEventId || !user?.id || Object.keys(pendingChangesRef.current).length === 0) {
            return;
        }
        try {
            setIsSaving(true);
            const updates = {
                race_event_id: raceEventId,
                sailor_id: user.id,
                ...pendingChangesRef.current,
            };
            await sailorRacePreparationService.upsertPreparation(updates);
            pendingChangesRef.current = {};
            logger.info('Saved race preparation changes');
        }
        catch (error) {
            logger.error('Failed to save race preparation:', error);
        }
        finally {
            setIsSaving(false);
        }
    }, [raceEventId, user?.id]);
    /**
     * Schedule a save with debouncing
     */
    const scheduleSave = useCallback(() => {
        if (!autoSave)
            return;
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            saveChanges();
        }, debounceMs);
    }, [autoSave, debounceMs, saveChanges]);
    /**
     * Update rig notes
     */
    const setRigNotes = useCallback((notes) => {
        setRigNotesState(notes);
        pendingChangesRef.current = {
            ...pendingChangesRef.current,
            rig_notes: notes,
        };
        scheduleSave();
    }, [scheduleSave]);
    /**
     * Update selected rig preset
     */
    const setSelectedRigPresetId = useCallback((id) => {
        setSelectedRigPresetIdState(id);
        pendingChangesRef.current = {
            ...pendingChangesRef.current,
            selected_rig_preset_id: id || undefined,
        };
        scheduleSave();
    }, [scheduleSave]);
    /**
     * Set all acknowledgements at once
     */
    const setAcknowledgementsCallback = useCallback((acks) => {
        setAcknowledgements(acks);
        pendingChangesRef.current = {
            ...pendingChangesRef.current,
            regulatory_acknowledgements: acks,
        };
        scheduleSave();
    }, [scheduleSave]);
    /**
     * Toggle an acknowledgement
     */
    const toggleAcknowledgement = useCallback((key) => {
        setAcknowledgements((prev) => {
            const updated = {
                ...prev,
                [key]: !prev[key],
            };
            pendingChangesRef.current = {
                ...pendingChangesRef.current,
                regulatory_acknowledgements: updated,
            };
            scheduleSave();
            return updated;
        });
    }, [scheduleSave]);
    /**
     * Update race brief data for AI context
     */
    const updateRaceBrief = useCallback((data) => {
        // Only update if data has actually changed (deep comparison)
        setRaceBriefData((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(data)) {
                return prev; // No change, prevent re-render
            }
            pendingChangesRef.current = {
                ...pendingChangesRef.current,
                race_brief_data: data,
            };
            scheduleSave();
            return data;
        });
    }, [scheduleSave]);
    /**
     * Manually trigger a save
     */
    const save = useCallback(async () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        await saveChanges();
    }, [saveChanges]);
    /**
     * Refresh data from server
     */
    const refresh = useCallback(async () => {
        await loadPreparation();
    }, [loadPreparation]);
    // Load data on mount or when race changes
    useEffect(() => {
        loadPreparation();
    }, [loadPreparation]);
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            // Save any pending changes before unmounting
            if (Object.keys(pendingChangesRef.current).length > 0) {
                saveChanges();
            }
        };
    }, [saveChanges]);
    return {
        // State
        rigNotes,
        selectedRigPresetId,
        acknowledgements,
        raceBriefData,
        isLoading,
        isSaving,
        // Actions
        setRigNotes,
        setSelectedRigPresetId,
        setAcknowledgements: setAcknowledgementsCallback,
        toggleAcknowledgement,
        updateRaceBrief,
        save,
        refresh,
    };
}
