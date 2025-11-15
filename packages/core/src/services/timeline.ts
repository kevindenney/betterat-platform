import { supabase, type Tables } from '../database/client';

const isDev = process.env.NODE_ENV !== 'production';
const timelineDebug = (...args: unknown[]) => {
  if (isDev) {
    console.debug('[TimelineService]', ...args);
  }
};

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

type RegattaRow = Pick<
  Tables<'regattas'>,
  'id' | 'name' | 'start_date' | 'end_date' | 'venue' | 'organizing_authority'
> & {
  // Add optional fields that might exist in metadata or be null
  location?: string | null;
  metadata?: unknown | null;
};

const FALLBACK_LIMIT = 30;
const LOOKBACK_DAYS = 30; // Increased from 7 to 30 days
const LOOKAHEAD_DAYS = 90; // Increased from 60 to 90 days

const timelineWindow = () => {
  const now = Date.now();
  const start = new Date(now - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const end = new Date(now + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000).toISOString();
  return { start, end };
};

export const fetchTimelineEvents = async (domainId: string): Promise<TimelineEvent[]> => {
  timelineDebug('fetchTimelineEvents:start', { domainId });
  const window = timelineWindow();
  timelineDebug('timelineWindow', window);
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('domain_id', domainId)
    .gte('start_time', window.start)
    .lte('start_time', window.end)
    .order('start_time', { ascending: true })
    .limit(30);

  if (data && data.length > 0) {
    timelineDebug('timeline_events hit', { domainId, count: data.length });
    return data as TimelineEvent[];
  }

  if (error) {
    timelineDebug('timeline_events query error', error);
  } else {
    timelineDebug('timeline_events empty result', { domainId });
  }

  const shouldUseYachtracingFallback = await needsYachtracingFallback(domainId, error);
  if (shouldUseYachtracingFallback) {
    timelineDebug('falling back to regattas timeline', { domainId });
    return fetchYachtracingTimelineFallback();
  }

  if (error) {
    throw error;
  }

  timelineDebug('returning empty timeline data', { domainId });
  return (data ?? []) as TimelineEvent[];
};

const needsYachtracingFallback = async (
  domainId: string,
  error: unknown
): Promise<boolean> => {
  if (domainId !== 'yachtracing') {
    return false;
  }

  if (error) {
    return true;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  return !sessionData.session;
};

const fetchYachtracingTimelineFallback = async (): Promise<TimelineEvent[]> => {
  timelineDebug('fetchYachtracingTimelineFallback:start');
  const window = timelineWindow();
  const { data, error } = await supabase
    .from('regattas')
    .select('id, name, start_date, end_date, venue, organizing_authority')
    .gte('start_date', window.start)
    .lte('start_date', window.end)
    .order('start_date', { ascending: true })
    .limit(FALLBACK_LIMIT);

  if (error) {
    timelineDebug('regattas fallback error', error);
    throw error;
  }

  const mapped = (data ?? []).map((regatta) => mapRegattaToTimelineEvent(regatta));
  timelineDebug('regattas fallback success', { count: mapped.length });
  return mapped;
};

const mapRegattaToTimelineEvent = (regatta: RegattaRow): TimelineEvent => {
  const startDate = parseDate(regatta.start_date);
  const isoStart = startDate?.toISOString() ?? new Date().toISOString();

  return {
    id: regatta.id,
    title: regatta.name ?? 'Scheduled regatta',
    start_time: isoStart,
    status: deriveRegattaStatus(regatta.start_date, regatta.end_date),
    location: extractRegattaLocation(regatta),
    summary: formatRegattaSummary(regatta),
    domain_id: 'yachtracing',
  };
};

const deriveRegattaStatus = (start?: string | null, end?: string | null): TimelineEventStatus => {
  const now = Date.now();
  const startAt = parseDate(start);
  const endAt = parseDate(end);

  if (startAt && now < startAt.getTime()) {
    return 'upcoming';
  }

  if (startAt && endAt && now >= startAt.getTime() && now <= endAt.getTime()) {
    return 'active';
  }

  if (endAt && now > endAt.getTime()) {
    return 'completed';
  }

  if (startAt && now >= startAt.getTime()) {
    return 'completed';
  }

  return 'upcoming';
};

const formatRegattaSummary = (regatta: RegattaRow): string | null => {
  const startAt = parseDate(regatta.start_date);
  const endAt = parseDate(regatta.end_date);

  const parts: string[] = [];

  if (startAt && endAt) {
    const sameDay = startAt.toDateString() === endAt.toDateString();
    const startLabel = formatDate(startAt);
    const endLabel = formatDate(endAt);
    parts.push(sameDay ? startLabel : `${startLabel} → ${endLabel}`);
  } else if (startAt) {
    parts.push(formatDate(startAt));
  } else if (endAt) {
    parts.push(formatDate(endAt));
  }

  if (startAt) {
    parts.push(
      startAt.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }

  const location = extractRegattaLocation(regatta);
  if (location) {
    parts.push(location);
  }

  return parts.length ? parts.join(' • ') : null;
};

const formatDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

const parseDate = (value?: string | null): Date | null => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const extractRegattaLocation = (regatta: RegattaRow): string | null => {
  // Primary field: venue column
  if (typeof regatta.venue === 'string' && regatta.venue.trim()) {
    return regatta.venue.trim();
  }

  // Fallback: organizing_authority
  if (typeof regatta.organizing_authority === 'string' && regatta.organizing_authority.trim()) {
    return regatta.organizing_authority.trim();
  }

  // Optional: location field if it exists
  if (regatta.location && typeof regatta.location === 'string' && regatta.location.trim()) {
    return regatta.location.trim();
  }

  // Metadata often contains venue/location hints
  const metadata =
    regatta.metadata && typeof regatta.metadata === 'object' ? (regatta.metadata as Record<string, unknown>) : null;
  if (metadata) {
    const candidates = ['venue', 'location', 'club'] as const;
    for (const key of candidates) {
      const value = metadata[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
  }

  return null;
};
