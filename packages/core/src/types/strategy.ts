// Shared strategy planner types for all domains

export type StrategyPhaseDefinition = {
  id: string;
  title: string;
  subtitle: string;
};

export type StrategyPlanFields = {
  what: string;
  why: string;
  how: string;
  who: string;
};

export type StrategyAISuggestion = {
  summary: string;
  bullets: string[];
  confidence?: 'low' | 'medium' | 'high';
  dataPoints?: string[];
};

export type StrategyPhaseConfigMap = Record<string, StrategyPhaseDefinition[]>;

export const StrategyPhaseLibrary: StrategyPhaseConfigMap = {
  sailracing: [
    { id: 'rig', title: 'Rig & Sail Plan', subtitle: 'Tune, ballast, and inventory' },
    { id: 'pre_race', title: 'Pre-Race Strategy', subtitle: 'On-water rehearsal + timing drills' },
    { id: 'start', title: 'Start', subtitle: 'Line bias, timing, and lane selection' },
    { id: 'upwind', title: 'Upwind Leg', subtitle: 'Shift playbook and sail trim' },
    { id: 'top_mark', title: 'Top Mark', subtitle: 'Laylines, traffic, and hoist plan' },
    { id: 'downwind', title: 'Downwind Leg', subtitle: 'Pressure lanes and VMG focus' },
    { id: 'bottom_mark', title: 'Bottom Mark', subtitle: 'Drop/gybe decision tree' },
    { id: 'finish', title: 'Finish & Recovery', subtitle: 'Final approach and comms' },
  ],
  nursing: [
    { id: 'pre_shift', title: 'Pre-Shift Briefing', subtitle: 'Staffing, census, and acuity scan' },
    { id: 'huddles', title: 'Unit Huddles', subtitle: 'Team alignment + escalation plan' },
    { id: 'rounds', title: 'Patient Rounds', subtitle: 'Assessments and priorities' },
    { id: 'critical', title: 'Critical Events', subtitle: 'Rapid response + surge readiness' },
    { id: 'handoff', title: 'Handoff', subtitle: 'Shift summary and delegation' },
  ],
  drawing: [
    { id: 'research', title: 'Research & References', subtitle: 'Mood, story, and visual language' },
    { id: 'thumbnails', title: 'Thumbnails', subtitle: 'Composition and storytelling' },
    { id: 'line', title: 'Line Work', subtitle: 'Structure, gesture, and cleanup' },
    { id: 'color', title: 'Color & Light', subtitle: 'Palette, texture, and rendering' },
    { id: 'final', title: 'Final Polish', subtitle: 'FX, typography, and delivery' },
  ],
};

export const getStrategyPhases = (domainId: string, fallbackId = 'sailracing') => {
  return StrategyPhaseLibrary[domainId] ?? StrategyPhaseLibrary[fallbackId] ?? [];
};
