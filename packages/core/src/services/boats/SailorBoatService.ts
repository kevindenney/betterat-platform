// @ts-nocheck
import { supabase } from '../../database/client';
import { createLogger } from '../../lib/utils/logger';

export type BoatOwnershipType = 'owned' | 'co_owned' | 'chartered' | 'club_boat' | 'crew';
export type BoatStatus = 'active' | 'stored' | 'sold' | 'retired';

export interface BoatClass {
  id: string;
  name: string;
  class_association?: string | null;
  type?: string | null;
}

export interface SailorBoat {
  id: string;
  sailor_id: string;
  class_id: string;
  name: string;
  sail_number?: string | null;
  hull_number?: string | null;
  manufacturer?: string | null;
  year_built?: number | null;
  hull_material?: string | null;
  is_primary: boolean;
  status: BoatStatus;
  home_club_id?: string | null;
  storage_location?: string | null;
  ownership_type?: BoatOwnershipType | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
  notes?: string | null;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
  boat_class?: BoatClass | null;
  home_club?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateBoatInput {
  sailor_id: string;
  class_id: string;
  name: string;
  sail_number?: string;
  hull_number?: string;
  manufacturer?: string;
  year_built?: number;
  hull_material?: string;
  is_primary?: boolean;
  home_club_id?: string;
  storage_location?: string;
  ownership_type?: BoatOwnershipType;
  purchase_date?: string;
  purchase_price?: number;
  notes?: string;
}

export interface UpdateBoatInput {
  name?: string;
  sail_number?: string;
  hull_number?: string;
  manufacturer?: string;
  year_built?: number;
  hull_material?: string;
  is_primary?: boolean;
  status?: BoatStatus;
  home_club_id?: string;
  storage_location?: string;
  ownership_type?: BoatOwnershipType;
  purchase_date?: string;
  purchase_price?: number;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface BoatEquipmentItem {
  id: string;
  boat_id: string;
  category: string;
  name: string;
  manufacturer?: string | null;
  model?: string | null;
  status?: string | null;
  purchase_date?: string | null;
  service_interval_months?: number | null;
  usage_hours?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BoatCrewMember {
  id: string;
  boat_id: string;
  crew_name: string;
  crew_email?: string | null;
  position?: string | null;
  role?: string | null;
  availability_status?: 'available' | 'tentative' | 'unavailable' | null;
  experience_notes?: string | null;
  is_regular?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export interface BoatTuningPreset {
  id: string;
  boat_id: string;
  name: string;
  conditions?: string | null;
  settings?: Record<string, any> | null;
  is_favorite?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

const logger = createLogger('SailorBoatService');

export class SailorBoatService {
  async listBoatClasses(search?: string): Promise<BoatClass[]> {
    let query = supabase.from('boat_classes').select('id, name, class_association, type').order('name');

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  }

  async listBoatsForSailor(sailorId: string): Promise<SailorBoat[]> {
    const { data, error } = await supabase
      .from('sailor_boats')
      .select(
        `*,
         boat_class:boat_classes(id, name, class_association)
        `
      )
      .eq('sailor_id', sailorId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async listBoatsForSailorClass(sailorId: string, classId: string): Promise<SailorBoat[]> {
    const { data, error } = await supabase
      .from('sailor_boats')
      .select(
        `*,
         boat_class:boat_classes(id, name, class_association)
        `
      )
      .eq('sailor_id', sailorId)
      .eq('class_id', classId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async getBoat(boatId: string): Promise<SailorBoat | null> {
    const { data, error } = await supabase
      .from('sailor_boats')
      .select(
        `*,
         boat_class:boat_classes(id, name, class_association)
        `
      )
      .eq('id', boatId)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('[SailorBoatService.getBoat] Error fetching boat', error);
      throw error;
    }

    return data ?? null;
  }

  async getPrimaryBoat(sailorId: string, classId: string): Promise<SailorBoat | null> {
    const { data, error } = await supabase
      .from('sailor_boats')
      .select(
        `*,
         boat_class:boat_classes(id, name, class_association)
        `
      )
      .eq('sailor_id', sailorId)
      .eq('class_id', classId)
      .eq('is_primary', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data ?? null;
  }

  async createBoat(input: CreateBoatInput): Promise<SailorBoat> {
    const { data, error } = await supabase
      .from('sailor_boats')
      .insert({
        ...input,
        status: 'active',
      })
      .select(
        `*,
         boat_class:boat_classes(id, name, class_association)
        `
      )
      .single();

    if (error) {
      throw error;
    }

    await this.ensureSailorClassRegistration({
      sailorId: input.sailor_id,
      classId: input.class_id,
      boatName: input.name,
      sailNumber: input.sail_number,
      isPrimary: Boolean(input.is_primary),
    });

    return data;
  }

  async updateBoat(boatId: string, input: UpdateBoatInput): Promise<SailorBoat> {
    const { data, error } = await supabase
      .from('sailor_boats')
      .update(input)
      .eq('id', boatId)
      .select(
        `*,
         boat_class:boat_classes(id, name, class_association)
        `
      )
      .single();

    if (error) {
      throw error;
    }

    if (data && (input.name || input.sail_number !== undefined || input.is_primary !== undefined)) {
      try {
        const updateData: any = {};
        if (input.name) updateData.boat_name = input.name;
        if (input.sail_number !== undefined) updateData.sail_number = input.sail_number;
        if (input.is_primary !== undefined) updateData.is_primary = input.is_primary;

        if (Object.keys(updateData).length > 0) {
          const { error: classError } = await supabase
            .from('sailor_classes')
            .update(updateData)
            .eq('sailor_id', data.sailor_id)
            .eq('class_id', data.class_id);

          if (classError) {
            logger.warn('[SailorBoatService.updateBoat] Failed to update sailor_classes', classError);
          }
        }
      } catch (classUpdateError) {
        logger.warn('[SailorBoatService.updateBoat] Error updating sailor_classes', classUpdateError);
      }
    }

    return data;
  }

  async setPrimaryBoat(boatId: string): Promise<void> {
    const { data: boat, error: fetchError } = await supabase
      .from('sailor_boats')
      .select('sailor_id, class_id')
      .eq('id', boatId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    await supabase
      .from('sailor_boats')
      .update({ is_primary: false })
      .eq('sailor_id', boat.sailor_id)
      .eq('class_id', boat.class_id);

    await supabase
      .from('sailor_boats')
      .update({ is_primary: true })
      .eq('id', boatId);

    await this.ensureSailorClassRegistration({
      sailorId: boat.sailor_id,
      classId: boat.class_id,
      isPrimary: true,
    });
  }

  async deleteBoat(boatId: string): Promise<void> {
    const { data: boat, error: fetchError } = await supabase
      .from('sailor_boats')
      .select('sailor_id, class_id')
      .eq('id', boatId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const { error } = await supabase
      .from('sailor_boats')
      .delete()
      .eq('id', boatId);

    if (error) {
      throw error;
    }

    if (boat) {
      try {
        const { data: remainingBoats, error: countError } = await supabase
          .from('sailor_boats')
          .select('id')
          .eq('sailor_id', boat.sailor_id)
          .eq('class_id', boat.class_id)
          .limit(1);

        if (!countError && (!remainingBoats || remainingBoats.length === 0)) {
          const { error: deleteClassError } = await supabase
            .from('sailor_classes')
            .delete()
            .eq('sailor_id', boat.sailor_id)
            .eq('class_id', boat.class_id);

          if (deleteClassError) {
            logger.warn('[SailorBoatService.deleteBoat] Failed to remove sailor_classes entry', deleteClassError);
          }
        }
      } catch (cleanupError) {
        logger.warn('[SailorBoatService.deleteBoat] Cleanup error', cleanupError);
      }
    }
  }

  async getBoatEquipment(boatId: string): Promise<BoatEquipmentItem[]> {
    const { data, error } = await supabase
      .from('boat_equipment')
      .select('*')
      .eq('boat_id', boatId)
      .order('category');

    if (error) {
      throw error;
    }

    return data || [];
  }

  async getBoatCrew(boatId: string): Promise<BoatCrewMember[]> {
    const { data, error } = await supabase
      .from('boat_crew_members')
      .select('*')
      .eq('boat_id', boatId)
      .order('crew_name');

    if (error) {
      throw error;
    }

    return data || [];
  }

  async getBoatTuningSettings(boatId: string): Promise<BoatTuningPreset[]> {
    const { data, error } = await supabase
      .from('boat_tuning_settings')
      .select('*')
      .eq('boat_id', boatId)
      .order('is_favorite', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  private async ensureSailorClassRegistration(params: {
    sailorId: string;
    classId: string;
    boatName?: string;
    sailNumber?: string;
    isPrimary?: boolean;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('sailor_classes')
        .upsert({
          sailor_id: params.sailorId,
          class_id: params.classId,
          boat_name: params.boatName,
          sail_number: params.sailNumber,
          is_primary: Boolean(params.isPrimary),
        }, {
          onConflict: 'sailor_id,class_id',
          ignoreDuplicates: false,
        });

      if (error) {
        logger.warn('[SailorBoatService.ensureSailorClassRegistration] Failed to upsert', error);
      }
    } catch (err) {
      logger.warn('[SailorBoatService.ensureSailorClassRegistration] Unexpected error', err);
    }
  }
}

export const sailorBoatService = new SailorBoatService();
