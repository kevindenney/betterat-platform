import React from 'react';
export type StrategyCollaborator = {
  id: string;
  name: string;
  subtitle: string;
  status?: string;
  planFocus?: string;
};
export type StrategyCollaborationTopic = {
  id: string;
  title: string;
  detail: string;
  ourPlanLabel?: string;
  ourPlan: string;
  peerPlanLabel: string;
  peerPlan: string;
  peerSource: string;
  callout?: string;
  tags?: string[];
};
export type StrategyCollaborationPanelTheme = {
  background: string;
  border: string;
  heading: string;
  text: string;
  accent: string;
  pill: string;
  peerBackground: string;
};
export type StrategyCollaborationPanelProps = {
  heading: string;
  description: string;
  connectionLabel: string;
  connectionDescription: string;
  onConnect?: () => void;
  collaborators: StrategyCollaborator[];
  topics: StrategyCollaborationTopic[];
  theme?: Partial<StrategyCollaborationPanelTheme>;
};
export declare const StrategyCollaborationPanel: React.FC<StrategyCollaborationPanelProps>;
//# sourceMappingURL=StrategyCollaborationPanel.d.ts.map
