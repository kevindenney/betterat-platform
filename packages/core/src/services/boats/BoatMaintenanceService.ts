// @ts-nocheck
import { supabase } from '../../database/client';

export type MaintenanceStatus = 'overdue' | 'due_soon' | 'scheduled' | 'completed';
export type MaintenanceCategory = 'sail' | 'rigging' | 'hull' | 'electronics' | 'safety' | 'engine' | 'other';

export interface MaintenanceRecord {
  id: string;
  boat_id: string;
  status: MaintenanceStatus;
  category: MaintenanceCategory;
  item?: string | null;
  service?: string | null;
  due_date?: string | null;
  service_date?: string | null;
  completed_date?: string | null;
  cost?: number | null;
  vendor?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMaintenanceRecordInput {
  boat_id: string;
  status: MaintenanceStatus;
  category: MaintenanceCategory;
  item?: string;
  service?: string;
  due_date?: string;
  service_date?: string;
  completed_date?: string;
  cost?: number;
  vendor?: string;
  notes?: string;
}

export interface UpdateMaintenanceRecordInput extends Partial<CreateMaintenanceRecordInput> {}

export class BoatMaintenanceService {
  async listMaintenanceRecords(boatId: string): Promise<MaintenanceRecord[]> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('boat_id', boatId)
      .order('status', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('service_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async createMaintenanceRecord(input: CreateMaintenanceRecordInput): Promise<MaintenanceRecord> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .insert(input)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateMaintenanceRecord(id: string, updates: UpdateMaintenanceRecordInput): Promise<MaintenanceRecord> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async markRecordComplete(id: string, completedDate: string = new Date().toISOString()): Promise<MaintenanceRecord> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .update({
        status: 'completed',
        completed_date: completedDate,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async deleteMaintenanceRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from('maintenance_records')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}

export const boatMaintenanceService = new BoatMaintenanceService();
