// @ts-nocheck
/**
 * Yacht Racing Skills Registry
 * Maps skill names to their Anthropic Skill IDs
 *
 * These skills represent the RegattaFlow Playbook tactical knowledge
 * extracted and uploaded to Anthropic's Skills API
 */

export const YACHT_RACING_SKILLS = {
  // Core strategy skills
  'race-strategy-analyst': 'skill_01KGEyGE97qaPmquNwc48MqT',
  'tidal-opportunism-analyst': 'skill_01859NpM6B8cz7E1NdpbdZzC',
  'slack-window-planner': 'skill_01FCQFcE8NTV1eouW4pjoutE',
  'current-counterplay-advisor': 'skill_01PefwFB6ANCctXtzn4G1kj8',

  // Tactical execution skills (RegattaFlow Playbook + Coach)
  'starting-line-mastery': 'skill_012pEW2MsTCL43kPzqAR21Km',
  'upwind-strategic-positioning': 'skill_01AuNhbjToKmtQtUes4VJRW9',
  'upwind-tactical-combat': 'skill_011j4LTzxf7c1Fn4nwZbLWA7',
  'downwind-speed-and-position': 'skill_01EEj8tqRPPsopupvpiBmzyD',
  'mark-rounding-execution': 'skill_01HeDxSUo8fm1Re7fdqCGhMi',
  'finishing-line-tactics': 'skill_builtin_finishing_line_tactics',

  // Boat tuning skill
  'boat-tuning-analyst': 'skill_01LwivxRwARQY3ga2LwUJNCj',

  // Post-race learning skill
  'race-learning-analyst': 'skill_01NsZX8FL8JfeNhqQ7qFQLLW',
} as const;

export type YachtRacingSkillKey = keyof typeof YACHT_RACING_SKILLS;

/**
 * Get skill ID by name
 */
export function getSkillId(skillName: YachtRacingSkillKey): string {
  return YACHT_RACING_SKILLS[skillName];
}

/**
 * Check if a skill name is valid
 */
export function isValidSkill(skillName: string): skillName is YachtRacingSkillKey {
  return skillName in YACHT_RACING_SKILLS;
}

/**
 * Get all skill names
 */
export function getAllSkillNames(): YachtRacingSkillKey[] {
  return Object.keys(YACHT_RACING_SKILLS) as YachtRacingSkillKey[];
}

/**
 * Skill categories for organization
 */
export const SKILL_CATEGORIES = {
  strategy: [
    'race-strategy-analyst',
    'tidal-opportunism-analyst',
    'slack-window-planner',
    'current-counterplay-advisor',
  ] as const,
  tactical: [
    'starting-line-mastery',
    'upwind-strategic-positioning',
    'upwind-tactical-combat',
    'downwind-speed-and-position',
    'mark-rounding-execution',
    'finishing-line-tactics',
  ] as const,
  performance: [
    'boat-tuning-analyst',
    'race-learning-analyst',
  ] as const,
} as const;
