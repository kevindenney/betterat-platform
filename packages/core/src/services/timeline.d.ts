export type TimelineEventStatus = 'upcoming' | 'active' | 'completed';
export interface TimelineEvent {
    id: string;
    title: string;
    start_time: string;
    status: TimelineEventStatus;
    location?: string | null;
    summary?: string | null;
    domain_id: string;
}
export declare const fetchTimelineEvents: (domainId: string) => Promise<TimelineEvent[]>;
//# sourceMappingURL=timeline.d.ts.map