import React from 'react';
type DomainKind = 'sailracing' | 'nursing';
export interface TimelineStripEvent {
    id: string;
    title: string;
    start_time: string;
    status: string;
    location?: string | null;
    summary?: string | null;
}
interface TimelineStripProps {
    events: TimelineStripEvent[];
    domain: DomainKind;
    selectedId: string | null;
    loading?: boolean;
    onAdd: () => void;
    onSelect: (id: string) => void;
}
declare const TimelineStrip: React.FC<TimelineStripProps>;
export default TimelineStrip;
//# sourceMappingURL=TimelineStrip.d.ts.map