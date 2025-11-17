type TabKey = 'gather' | 'create' | 'share' | 'reflect';

type TabCopy = {
  label: string;
  description: string;
};

export const NURSING_TAB_LABELS: Record<TabKey, TabCopy> = {
  gather: {
    label: 'Brief',
    description: 'Orient the shift and align assignments',
  },
  create: {
    label: 'Care',
    description: 'Run the live shift and execute checklists',
  },
  share: {
    label: 'Broadcast',
    description: 'Surface updates, escalations, and intel',
  },
  reflect: {
    label: 'Debrief',
    description: 'Capture learning signals and close loops',
  },
};
