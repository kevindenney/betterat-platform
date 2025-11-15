import { useQuery } from '@tanstack/react-query';
import { fetchTimelineEvents, TimelineEvent } from '../services/timeline';

export const useTimelineEvents = (domainId: string) => {
  return useQuery<TimelineEvent[]>({
    queryKey: ['timeline-events', domainId],
    queryFn: () => fetchTimelineEvents(domainId),
    staleTime: 1000 * 60,
  });
};
