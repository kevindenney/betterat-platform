import type { CoachProfile } from './CoachingService';
import { createLogger } from '../utils/logger';

/**
 * Shared pre-race strategy that a sailor can send to a coach for review.
 */
export interface SharedStrategy {
  id: string;
  coach_id: string;
  sailor_id: string;
  sailor_name: string;
  sail_number?: string;
  race_id: string;
  race_name: string;
  race_date: string;
  venue_name?: string;
  weather_summary?: string;
  shared_at: string;
  start_strategy?: string;
  upwind_strategy?: string;
  windward_mark_strategy?: string;
  downwind_strategy?: string;
  leeward_mark_strategy?: string;
  risk_notes?: string;
  confidence_score?: number;
  coach_feedback?: string;
  coach_reviewed_at?: string;
}

type CoachProfileSummary = Pick<
  CoachProfile,
  | 'id'
  | 'user_id'
  | 'display_name'
  | 'profile_photo_url'
  | 'bio'
  | 'specialties'
  | 'experience_years'
  | 'certifications'
  | 'available_for_sessions'
  | 'hourly_rate'
  | 'currency'
  | 'based_at'
  | 'available_locations'
  | 'total_sessions'
  | 'total_clients'
  | 'average_rating'
  | 'verified'
  | 'created_at'
  | 'updated_at'
>;

const logger = createLogger('CoachStrategyService');

const mockCoachProfiles: CoachProfileSummary[] = [
  {
    id: 'coach_emily',
    user_id: 'user_emily',
    display_name: 'Emily Carter',
    profile_photo_url:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=60',
    bio: 'Olympic campaign strategist specialising in match racing & one-design keelboats.',
    specialties: ['pre-starts', 'match_racing', 'race_strategy', 'mental_game'],
    experience_years: 12,
    certifications: ['World Sailing L3 Coach', 'RegattaFlow Playbook Performance'],
    available_for_sessions: true,
    hourly_rate: 24000,
    currency: 'USD',
    based_at: 'Royal Hong Kong Yacht Club',
    available_locations: ['Asia Pacific', 'Remote'],
    total_sessions: 318,
    total_clients: 64,
    average_rating: 4.9,
    verified: true,
    created_at: '2023-02-15T08:00:00.000Z',
    updated_at: '2024-11-12T10:00:00.000Z',
  },
  {
    id: 'coach_luke',
    user_id: 'user_luke',
    display_name: 'Luke Anders',
    profile_photo_url:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=320&q=60',
    bio: 'AC40 flight controller turned performance coach. Downwind VMG obsessive.',
    specialties: ['downwind_modes', 'foiling', 'video_analysis'],
    experience_years: 8,
    certifications: ['US Sailing L2 Coach'],
    available_for_sessions: true,
    hourly_rate: 20000,
    currency: 'USD',
    based_at: 'SailGP Inspire Programme',
    available_locations: ['Remote', 'San Francisco', 'Sydney'],
    total_sessions: 204,
    total_clients: 51,
    average_rating: 4.8,
    verified: true,
    created_at: '2023-05-21T08:00:00.000Z',
    updated_at: '2024-11-05T10:00:00.000Z',
  },
];

let mockSharedStrategies: SharedStrategy[] = [
  {
    id: 'strategy_rhk_2024_day2',
    coach_id: 'coach_emily',
    sailor_id: 'sailor_ava',
    sailor_name: 'Ava Hernandez',
    sail_number: 'HKG-1427',
    race_id: 'rhk_day2',
    race_name: 'RHKYC Autumn Series — Day 2',
    race_date: '2024-11-16T08:00:00.000Z',
    venue_name: 'Victoria Harbour • Course C',
    weather_summary: 'Forecast NE 18-22kt with 35º oscillations every 9-11 minutes.',
    shared_at: '2024-11-15T13:22:00.000Z',
    start_strategy:
      'Primary: Committee boat, hold high lane + force late duck. Backup: 30s push from middle if class sags. Time-on-distance 27s from 3-lengths.',
    upwind_strategy:
      'Sail the lifts into Kowloon shore relief. Expect 6º right-handers near Topside marker. Mode 2 with traveller up 3cm.',
    windward_mark_strategy:
      'Anticipate congestion on layline. Hit extra ease through final tack to power out. Call for duck + inside overlap if late.',
    downwind_strategy:
      'Stay on starboard for first 90s to clear traffic then hunt pressure lanes rolling off Kellett Island. Target VMG ≥ 5.9.',
    leeward_mark_strategy:
      'Gate preference: left (looking downwind). Early drop if pumps exceed 2. Maintain high build to protect inside turn.',
    confidence_score: 0.78,
  },
  {
    id: 'strategy_foiling_classic',
    coach_id: 'coach_luke',
    sailor_id: 'sailor_mateo',
    sailor_name: 'Mateo Quinn',
    sail_number: 'USA-77',
    race_id: 'foiling_cup_qualifier',
    race_name: 'Pacific Foiling Cup • Qualifier 3',
    race_date: '2024-11-22T09:30:00.000Z',
    venue_name: 'San Francisco City Front',
    weather_summary: 'Building flood, 22-28kt WNW with 1.2m stacked swell.',
    shared_at: '2024-11-14T22:05:00.000Z',
    start_strategy:
      'Punch at pin, hold max VMG build for 18 seconds, then high mode to force weather boat slow-down.',
    upwind_strategy:
      'Sail the breeze line along Alcatraz cone. Target SWT = 17.2kts, ride height 1.05m.',
    windward_mark_strategy:
      'Arrive on starboard, plan high-fast exit to stay foiling through bear-away.',
    downwind_strategy:
      'Fly deeper angles with 3° rudder bias. Gybe on max pressure only.',
    leeward_mark_strategy:
      'Late drop, cross-trim focus to keep foil engaged through turn.',
    confidence_score: 0.71,
    coach_feedback:
      'Love the start build but add bailout path if flood shifts pin end. Let’s tighten the downwind layline math before Saturday.',
    coach_reviewed_at: '2024-11-15T18:42:00.000Z',
  },
  {
    id: 'strategy_club_champs_final',
    coach_id: 'coach_emily',
    sailor_id: 'sailor_liam',
    sailor_name: 'Liam Patel',
    sail_number: 'HKG-908',
    race_id: 'club_champs_final',
    race_name: 'HK Club Champs — Finals',
    race_date: '2024-11-30T07:45:00.000Z',
    venue_name: 'Repulse Bay',
    weather_summary: 'Light SE 8-11kt with tide ebbing 1.1kts across bottom gate.',
    shared_at: '2024-11-13T09:55:00.000Z',
    start_strategy:
      'Middle third start to play shifts. Focus on acceleration + space, avoid pin congestion.',
    upwind_strategy:
      'Sail pressure. Expect left phase mid-leg but keep leverage under 8 boat lengths.',
    downwind_strategy:
      'Early gybe to stay in relief. Prioritize flow through transitions over outright depth.',
    confidence_score: 0.64,
  },
];

class CoachStrategyService {
  async getCoachProfileByUserId(userId: string): Promise<CoachProfileSummary | null> {
    if (!userId) {
      return null;
    }

    const profile = mockCoachProfiles.find((coach) => coach.user_id === userId);
    return profile ? { ...profile } : null;
  }

  async getSharedStrategies(coachId: string): Promise<SharedStrategy[]> {
    if (!coachId) {
      return [];
    }

    return mockSharedStrategies
      .filter((strategy) => strategy.coach_id === coachId)
      .sort((a, b) => new Date(b.shared_at).getTime() - new Date(a.shared_at).getTime())
      .map((strategy) => ({ ...strategy }));
  }

  async addCoachFeedback(strategyId: string, coachId: string, feedback: string): Promise<boolean> {
    const trimmedFeedback = (feedback ?? '').trim();
    if (!trimmedFeedback) {
      logger.warn('Feedback is empty, skipping save.');
      return false;
    }

    const strategy = mockSharedStrategies.find(
      (item) => item.id === strategyId && item.coach_id === coachId
    );

    if (!strategy) {
      logger.warn('Unable to locate shared strategy for feedback', { strategyId, coachId });
      return false;
    }

    strategy.coach_feedback = trimmedFeedback;
    strategy.coach_reviewed_at = new Date().toISOString();
    return true;
  }

  async markAsReviewed(strategyId: string, coachId: string): Promise<boolean> {
    const strategy = mockSharedStrategies.find(
      (item) => item.id === strategyId && item.coach_id === coachId
    );

    if (!strategy) {
      logger.warn('Unable to locate shared strategy for review', { strategyId, coachId });
      return false;
    }

    strategy.coach_reviewed_at = new Date().toISOString();
    if (!strategy.coach_feedback) {
      strategy.coach_feedback = 'Reviewed and acknowledged.';
    }

    return true;
  }
}

export const coachStrategyService = new CoachStrategyService();
