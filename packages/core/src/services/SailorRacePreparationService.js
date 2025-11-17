// @ts-nocheck
import { supabase } from '../database';
import { createLogger } from '../lib/utils/logger';
const logger = createLogger('SailorRacePreparationService');
class SailorRacePreparationService {
    /**
     * Get race preparation data for a specific sailor and race
     */
    async getPreparation(raceEventId, sailorId) {
        try {
            const { data, error } = await supabase
                .from('sailor_race_preparation')
                .select('*')
                .eq('race_event_id', raceEventId)
                .eq('sailor_id', sailorId)
                .maybeSingle();
            if (error) {
                logger.error('Error fetching race preparation:', error);
                throw error;
            }
            return data;
        }
        catch (error) {
            logger.error('Failed to get race preparation:', error);
            return null;
        }
    }
    /**
     * Upsert (create or update) race preparation data
     */
    async upsertPreparation(preparation) {
        try {
            // Validate that the race_event exists before attempting upsert
            const { data: raceEventExists, error: raceEventError } = await supabase
                .from('race_events')
                .select('id')
                .eq('id', preparation.race_event_id)
                .maybeSingle();
            if (raceEventError) {
                logger.error('Error checking race event existence:', raceEventError);
                throw raceEventError;
            }
            if (!raceEventExists) {
                logger.info(`Race event ${preparation.race_event_id} does not exist, skipping upsert`);
                return null;
            }
            const { data, error } = await supabase
                .from('sailor_race_preparation')
                .upsert({
                race_event_id: preparation.race_event_id,
                sailor_id: preparation.sailor_id,
                rig_notes: preparation.rig_notes,
                selected_rig_preset_id: preparation.selected_rig_preset_id,
                regulatory_acknowledgements: preparation.regulatory_acknowledgements,
                race_brief_data: preparation.race_brief_data,
            }, {
                onConflict: 'race_event_id,sailor_id',
            })
                .select()
                .single();
            if (error) {
                logger.error('Error upserting race preparation:', error);
                throw error;
            }
            logger.info('Race preparation upserted successfully');
            return data;
        }
        catch (error) {
            logger.error('Failed to upsert race preparation:', error);
            return null;
        }
    }
    /**
     * Update rig notes for a race
     */
    async updateRigNotes(raceEventId, sailorId, rigNotes) {
        try {
            // Validate that the race_event exists before attempting upsert
            const { data: raceEventExists, error: raceEventError } = await supabase
                .from('race_events')
                .select('id')
                .eq('id', raceEventId)
                .maybeSingle();
            if (raceEventError) {
                logger.error('Error checking race event existence:', raceEventError);
                throw raceEventError;
            }
            if (!raceEventExists) {
                logger.info(`Race event ${raceEventId} does not exist, skipping rig notes update`);
                return false;
            }
            const { error } = await supabase
                .from('sailor_race_preparation')
                .upsert({
                race_event_id: raceEventId,
                sailor_id: sailorId,
                rig_notes: rigNotes,
            }, {
                onConflict: 'race_event_id,sailor_id',
            });
            if (error) {
                logger.error('Error updating rig notes:', error);
                throw error;
            }
            logger.info('Rig notes updated successfully');
            return true;
        }
        catch (error) {
            logger.error('Failed to update rig notes:', error);
            return false;
        }
    }
    /**
     * Update selected rig preset for a race
     */
    async updateRigPreset(raceEventId, sailorId, rigPresetId) {
        try {
            // Validate that the race_event exists before attempting upsert
            const { data: raceEventExists, error: raceEventError } = await supabase
                .from('race_events')
                .select('id')
                .eq('id', raceEventId)
                .maybeSingle();
            if (raceEventError) {
                logger.error('Error checking race event existence:', raceEventError);
                throw raceEventError;
            }
            if (!raceEventExists) {
                logger.info(`Race event ${raceEventId} does not exist, skipping rig preset update`);
                return false;
            }
            const { error } = await supabase
                .from('sailor_race_preparation')
                .upsert({
                race_event_id: raceEventId,
                sailor_id: sailorId,
                selected_rig_preset_id: rigPresetId,
            }, {
                onConflict: 'race_event_id,sailor_id',
            });
            if (error) {
                logger.error('Error updating rig preset:', error);
                throw error;
            }
            logger.info('Rig preset updated successfully');
            return true;
        }
        catch (error) {
            logger.error('Failed to update rig preset:', error);
            return false;
        }
    }
    /**
     * Update regulatory acknowledgements for a race
     */
    async updateAcknowledgements(raceEventId, sailorId, acknowledgements) {
        try {
            // Validate that the race_event exists before attempting upsert
            const { data: raceEventExists, error: raceEventError } = await supabase
                .from('race_events')
                .select('id')
                .eq('id', raceEventId)
                .maybeSingle();
            if (raceEventError) {
                logger.error('Error checking race event existence:', raceEventError);
                throw raceEventError;
            }
            if (!raceEventExists) {
                logger.info(`Race event ${raceEventId} does not exist, skipping acknowledgements update`);
                return false;
            }
            const { error } = await supabase
                .from('sailor_race_preparation')
                .upsert({
                race_event_id: raceEventId,
                sailor_id: sailorId,
                regulatory_acknowledgements: acknowledgements,
            }, {
                onConflict: 'race_event_id,sailor_id',
            });
            if (error) {
                logger.error('Error updating acknowledgements:', error);
                throw error;
            }
            logger.info('Acknowledgements updated successfully');
            return true;
        }
        catch (error) {
            logger.error('Failed to update acknowledgements:', error);
            return false;
        }
    }
    /**
     * Update race brief data for AI context
     */
    async updateRaceBrief(raceEventId, sailorId, raceBriefData) {
        try {
            // Validate that the race_event exists before attempting upsert
            const { data: raceEventExists, error: raceEventError } = await supabase
                .from('race_events')
                .select('id')
                .eq('id', raceEventId)
                .maybeSingle();
            if (raceEventError) {
                logger.error('Error checking race event existence:', raceEventError);
                throw raceEventError;
            }
            if (!raceEventExists) {
                logger.info(`Race event ${raceEventId} does not exist, skipping race brief update`);
                return false;
            }
            const { error } = await supabase
                .from('sailor_race_preparation')
                .upsert({
                race_event_id: raceEventId,
                sailor_id: sailorId,
                race_brief_data: raceBriefData,
            }, {
                onConflict: 'race_event_id,sailor_id',
            });
            if (error) {
                logger.error('Error updating race brief:', error);
                throw error;
            }
            logger.info('Race brief updated successfully');
            return true;
        }
        catch (error) {
            logger.error('Failed to update race brief:', error);
            return false;
        }
    }
    /**
     * Delete race preparation data
     */
    async deletePreparation(raceEventId, sailorId) {
        try {
            const { error } = await supabase
                .from('sailor_race_preparation')
                .delete()
                .eq('race_event_id', raceEventId)
                .eq('sailor_id', sailorId);
            if (error) {
                logger.error('Error deleting race preparation:', error);
                throw error;
            }
            logger.info('Race preparation deleted successfully');
            return true;
        }
        catch (error) {
            logger.error('Failed to delete race preparation:', error);
            return false;
        }
    }
    /**
     * Get all race preparations for a sailor
     */
    async getSailorPreparations(sailorId) {
        try {
            const { data, error } = await supabase
                .from('sailor_race_preparation')
                .select('*')
                .eq('sailor_id', sailorId)
                .order('updated_at', { ascending: false });
            if (error) {
                logger.error('Error fetching sailor preparations:', error);
                throw error;
            }
            return data || [];
        }
        catch (error) {
            logger.error('Failed to get sailor preparations:', error);
            return [];
        }
    }
    /**
     * Toggle a specific acknowledgement
     */
    async toggleAcknowledgement(raceEventId, sailorId, key) {
        try {
            // First, get the current acknowledgements
            const current = await this.getPreparation(raceEventId, sailorId);
            const currentAcknowledgements = current?.regulatory_acknowledgements || {
                cleanRegatta: false,
                signOn: false,
                safetyBriefing: false,
            };
            // Toggle the specific key
            const updatedAcknowledgements = {
                ...currentAcknowledgements,
                [key]: !currentAcknowledgements[key],
            };
            // Update in database
            return await this.updateAcknowledgements(raceEventId, sailorId, updatedAcknowledgements);
        }
        catch (error) {
            logger.error('Failed to toggle acknowledgement:', error);
            return false;
        }
    }
}
export const sailorRacePreparationService = new SailorRacePreparationService();
