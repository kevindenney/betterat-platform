/**
 * Seed Demo Races Script
 * Creates sample races for testing the horizontal carousel
 */

import { supabase } from '../services/supabase';

const DEMO_RACES = [
  {
    name: 'Champ of Champs',
    venue_name: 'Royal Hong Kong Yacht Club',
    race_date: '2025-11-16',
    start_time: '15:00:00',
    metadata: {
      wind: {
        direction: 'NE',
        speedMin: 12,
        speedMax: 18,
      },
      tide: {
        state: 'flooding',
        height: 1.2,
        direction: 'N',
      },
      vhf_channel: '72',
      warning_signal: '14:55',
      first_start: '15:00',
      strategy: 'Start on port tack to catch the favorable current on the eastern shore. Wind expected to veer 10° right during the race.',
      weather_fetched_at: new Date().toISOString(),
    },
  },
  {
    name: 'Croucher Series Race 5',
    venue_name: 'Repulse Bay',
    race_date: '2025-11-17',
    start_time: '13:30:00',
    metadata: {
      wind: {
        direction: 'E',
        speedMin: 8,
        speedMax: 14,
      },
      tide: {
        state: 'ebbing',
        height: 0.8,
        direction: 'S',
      },
      vhf_channel: '71',
      warning_signal: '13:25',
      first_start: '13:30',
      strategy: 'Light air race. Focus on boat speed and staying in the pressure. Avoid the western shore where wind tends to die.',
      weather_fetched_at: new Date().toISOString(),
    },
  },
  {
    name: 'Bay Challenge',
    venue_name: 'Causeway Bay',
    race_date: '2025-11-10',
    start_time: '10:00:00',
    metadata: {
      wind: {
        direction: 'SE',
        speedMin: 15,
        speedMax: 22,
      },
      tide: {
        state: 'slack',
        height: 1.0,
      },
      vhf_channel: '72',
      warning_signal: '09:55',
      first_start: '10:00',
      strategy: 'Strong breeze expected. Consider reef early if gusts exceed 25 knots. Favor the right side of the course.',
      weather_fetched_at: new Date().toISOString(),
    },
  },
  {
    name: 'Island Series Race 3',
    venue_name: 'Middle Island',
    race_date: '2025-11-23',
    start_time: '11:00:00',
    metadata: {
      wind: {
        direction: 'NW',
        speedMin: 10,
        speedMax: 16,
      },
      tide: {
        state: 'flooding',
        height: 1.5,
        direction: 'NE',
      },
      vhf_channel: '73',
      warning_signal: '10:55',
      first_start: '11:00',
      weather_fetched_at: new Date().toISOString(),
    },
  },
];

export async function seedDemoRaces(userId: string) {
  console.log('🌱 Seeding demo races for user:', userId);

  const racesToInsert = DEMO_RACES.map(race => ({
    ...race,
    user_id: userId,
    status: 'scheduled',
    series_id: null,
  }));

  const { data, error } = await supabase
    .from('regattas')
    .insert(racesToInsert)
    .select();

  if (error) {
    console.error('❌ Error seeding races:', error);
    throw error;
  }

  console.log('✅ Successfully seeded', data?.length || 0, 'demo races');
  return data;
}

// If running directly
if (require.main === module) {
  (async () => {
    // Get user ID from environment or use a default
    const userId = process.env.USER_ID;
    if (!userId) {
      console.error('❌ Please provide USER_ID environment variable');
      process.exit(1);
    }

    await seedDemoRaces(userId);
    process.exit(0);
  })();
}
