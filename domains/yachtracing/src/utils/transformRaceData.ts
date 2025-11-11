/**
 * Transform race data from Supabase format to UI format
 */

import type { RaceRow, RegattaRow } from '../services/supabase';

export interface UIRaceData {
  id: string;
  name: string;
  date: string;
  venue: string;
  weather: {
    windSpeed: number;
    windDirection: string;
    temperature: number;
    tide?: string;
  };
  status: 'upcoming' | 'active' | 'completed';
  position?: number;
  totalCompetitors?: number;
  boat?: string;
  duration?: number;
  courseType?: string;
  notes?: string;
  confidence?: number;
  aiStrategy?: string;
  rigTuning?: string;
  crewStatus?: string;
  documents?: string[];
}

/**
 * Transform a race from Supabase to UI format
 */
export const transformRaceToUI = (
  race: RaceRow & { regatta?: RegattaRow }
): UIRaceData => {
  // Determine status based on dates
  const now = new Date();
  const scheduledStart = new Date(race.scheduled_start);
  const actualStart = race.actual_start ? new Date(race.actual_start) : null;

  let status: 'upcoming' | 'active' | 'completed' = 'upcoming';
  if (race.status === 'completed') {
    status = 'completed';
  } else if (actualStart && actualStart <= now) {
    status = 'active';
  } else if (scheduledStart <= now) {
    status = 'active';
  }

  // Extract venue info from regatta
  const venue = race.regatta?.venue
    ? typeof race.regatta.venue === 'string'
      ? race.regatta.venue
      : race.regatta.venue.name || 'Unknown Venue'
    : 'Unknown Venue';

  // Extract weather data
  const weatherSnapshot = race.weather_snapshot || {};
  const weather = {
    windSpeed: weatherSnapshot.wind_speed || 0,
    windDirection: weatherSnapshot.wind_direction || 'N',
    temperature: weatherSnapshot.temperature || 20,
    tide: weatherSnapshot.tide,
  };

  // Extract strategy data
  const strategy = race.strategy || {};

  return {
    id: race.id,
    name: race.regatta?.name || `Race ${race.race_number}`,
    date: race.scheduled_start,
    venue,
    weather,
    status,
    courseType: race.course_config?.type,
    aiStrategy: strategy.ai_plan,
    confidence: strategy.confidence_score,
    crewStatus: race.crew_members?.length
      ? `${race.crew_members.length} crew members`
      : undefined,
  };
};

/**
 * Transform an array of races to UI format
 */
export const transformRacesToUI = (
  races: Array<RaceRow & { regatta?: RegattaRow }>
): UIRaceData[] => {
  return races.map(transformRaceToUI);
};
