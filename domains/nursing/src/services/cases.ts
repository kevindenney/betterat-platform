import { supabase } from '@betterat/core';
import type { NewCaseData } from '../components/AddCaseModal';

const toISODate = (value?: string) => {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

export interface CreateClinicalSessionInput extends NewCaseData {
  userId: string;
}

export const createClinicalSession = async ({
  userId,
  title,
  scheduledStart,
  unit,
  focus,
  notes,
}: CreateClinicalSessionInput) => {
  if (!title.trim()) {
    throw new Error('Case title is required');
  }

  const scheduled_start = toISODate(scheduledStart);

  const { error } = await supabase.from('clinical_sessions').insert({
    scenario_title: title.trim(),
    scheduled_start,
    status: 'scheduled',
    unit_name: unit || null,
    learning_focus: focus || null,
    duration_minutes: null,
    supervising_rn: userId,
    notes: notes || null,
    domain_id: 'nursing',
  });

  if (error) {
    throw error;
  }
};
