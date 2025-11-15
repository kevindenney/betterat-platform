import { supabase } from '../database/client';
const FALLBACK_LIMIT = 12;
export const fetchTimelineEvents = async (domainId) => {
    const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('domain_id', domainId)
        .order('start_time', { ascending: true });
    if (data && data.length > 0) {
        return data;
    }
    const shouldUseYachtracingFallback = await needsYachtracingFallback(domainId, error);
    if (shouldUseYachtracingFallback) {
        return fetchYachtracingTimelineFallback();
    }
    if (error) {
        throw error;
    }
    return (data ?? []);
};
const needsYachtracingFallback = async (domainId, error) => {
    if (domainId !== 'yachtracing') {
        return false;
    }
    if (error) {
        return true;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    return !sessionData.session;
};
const fetchYachtracingTimelineFallback = async () => {
    const { data, error } = await supabase
        .from('regattas')
        .select('id, name, start_date, end_date, venue, organizing_authority')
        .order('start_date', { ascending: true })
        .limit(FALLBACK_LIMIT);
    if (error) {
        throw error;
    }
    return (data ?? []).map((regatta) => mapRegattaToTimelineEvent(regatta));
};
const mapRegattaToTimelineEvent = (regatta) => {
    const startDate = parseDate(regatta.start_date);
    const isoStart = (startDate === null || startDate === void 0 ? void 0 : startDate.toISOString()) ?? new Date().toISOString();
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
const deriveRegattaStatus = (start, end) => {
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
const formatRegattaSummary = (regatta) => {
    const startAt = parseDate(regatta.start_date);
    const endAt = parseDate(regatta.end_date);
    const parts = [];
    if (startAt && endAt) {
        const sameDay = startAt.toDateString() === endAt.toDateString();
        const startLabel = formatDate(startAt);
        const endLabel = formatDate(endAt);
        parts.push(sameDay ? startLabel : `${startLabel} → ${endLabel}`);
    }
    else if (startAt) {
        parts.push(formatDate(startAt));
    }
    else if (endAt) {
        parts.push(formatDate(endAt));
    }
    if (startAt) {
        parts.push(startAt.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
        }));
    }
    const location = extractRegattaLocation(regatta);
    if (location) {
        parts.push(location);
    }
    return parts.length ? parts.join(' • ') : null;
};
const formatDate = (date) => date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
});
const parseDate = (value) => {
    if (!value) {
        return null;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }
    return parsed;
};
const extractRegattaLocation = (regatta) => {
    const venue = regatta.venue;
    if (typeof venue === 'string' && venue.trim().length > 0) {
        return venue.trim();
    }
    if (venue && typeof venue === 'object') {
        const name = typeof venue.name === 'string' ? venue.name : null;
        const location = typeof venue.location === 'string' ? venue.location : null;
        const club = typeof venue.club === 'string' ? venue.club : null;
        if (name && name.trim())
            return name.trim();
        if (location && location.trim())
            return location.trim();
        if (club && club.trim())
            return club.trim();
    }
    if (typeof regatta.organizing_authority === 'string' && regatta.organizing_authority.trim()) {
        return regatta.organizing_authority.trim();
    }
    return null;
};
