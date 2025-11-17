import { useQuery } from '@tanstack/react-query';
import { fetchTimelineEvents } from '../services/timeline';
export const useTimelineEvents = (domainId) => {
    return useQuery({
        queryKey: ['timeline-events', domainId],
        queryFn: () => fetchTimelineEvents(domainId),
        staleTime: 1000 * 60,
    });
};
