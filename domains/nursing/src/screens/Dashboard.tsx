import React, { useState } from 'react';
import { ReadinessDashboard } from '@betterat/ui/components/domain-dashboard/ReadinessDashboard';
import {
  NURSING_ACTION_BUTTONS,
  NURSING_AI_NOTES,
  NURSING_ANALYTICS,
  NURSING_CARE_TEAM,
  NURSING_CHECKLIST,
  NURSING_COPY,
  NURSING_DOCUMENTS,
  NURSING_INCIDENTS,
  NURSING_KPI_METRICS,
  NURSING_MAP_META,
  NURSING_PRIORITIES,
  NURSING_SIGNALS,
  NURSING_STAGE_ITEMS,
  NURSING_TIMELINE,
} from '../data/dashboardConfig';

const NursingDashboard = () => {
  const [selectedTimeline, setSelectedTimeline] = useState(NURSING_TIMELINE[0]?.label ?? 'Pre-shift briefing');

  return (
    <ReadinessDashboard
      hero={{
        title: 'Telemetry command · 07:00-19:00',
        description: 'BetterAt Nursing links staffing, acuity, and AI coaching into one deliberate practice view.',
        infoRows: [
          { label: 'Charge RN', value: 'Jordan Reyes' },
          { label: 'Census', value: '10 / 12 beds filled' },
          { label: 'Admissions', value: '2 telemetry upgrades' },
          { label: 'Escalation channel', value: 'Rapid response · #7780' },
        ],
        countdownLabel: '02h 18m in',
      }}
      stages={NURSING_STAGE_ITEMS}
      actionLabels={NURSING_ACTION_BUTTONS}
      kpis={NURSING_KPI_METRICS}
      crewRows={NURSING_CARE_TEAM}
      logisticsChecklist={NURSING_CHECKLIST}
      timelineItems={NURSING_TIMELINE}
      selectedTimeline={selectedTimeline}
      onSelectTimeline={setSelectedTimeline}
      weatherRows={NURSING_SIGNALS}
      analyticsCards={NURSING_ANALYTICS}
      aiNotes={NURSING_AI_NOTES}
      documents={NURSING_DOCUMENTS}
      finishing={NURSING_PRIORITIES}
      protests={NURSING_INCIDENTS}
      mapMeta={NURSING_MAP_META}
      copy={NURSING_COPY}
    />
  );
};

export default NursingDashboard;
