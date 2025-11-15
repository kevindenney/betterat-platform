# Tactical Timeline Implementation

## Overview

The tactical timeline is a centralized, domain-agnostic system for displaying upcoming events across multiple product domains (yacht racing, nursing, etc.). It provides a unified view that can be filtered by domain and time window.

## Architecture

### Database Layer

**Supabase View: `public.timeline_events`**

Location: `supabase/migrations/20250114000002_timeline_events_view.sql`

The view unions data from multiple domain tables:
- `regattas` table (yacht racing domain)
- Future: `clinical_sessions` table (nursing domain)
- Extensible to additional domains

Schema:
```sql
CREATE OR REPLACE VIEW public.timeline_events AS
SELECT
  r.id,
  'yachtracing'::text AS domain_id,
  r.name AS title,
  r.start_date AS start_time,
  CASE
    WHEN r.status = 'completed' THEN 'completed'
    WHEN r.status = 'active' THEN 'active'
    ELSE 'upcoming'
  END AS status,
  r.location,
  (r.metadata->>'summary')::text AS summary
FROM regattas r;
```

Permissions:
```sql
GRANT SELECT ON public.timeline_events TO anon, authenticated, service_role;
```

### Service Layer

**Location:** `packages/core/src/services/timeline.ts`

**Key Features:**
1. **Rolling Window Filter** (30-day lookback, 90-day lookahead, limit 30 events)
2. **Domain Filtering** - Filter by `domain_id` (e.g., 'yachtracing')
3. **Fallback Logic** - Falls back to `regattas` table if:
   - View returns no data
   - Query fails and domain is 'yachtracing'
   - User is not authenticated
4. **Mock Mode** - Set `EXPO_PUBLIC_TIMELINE_MOCK=true` for local testing with hardcoded events

**API:**
```typescript
export interface TimelineEvent {
  id: string;
  title: string;
  start_time: string;
  status: 'upcoming' | 'active' | 'completed';
  location?: string | null;
  summary?: string | null;
  domain_id: string;
}

export const fetchTimelineEvents = async (domainId: string): Promise<TimelineEvent[]>
```

**Query Details:**
```typescript
const { data, error } = await supabase
  .from('timeline_events')
  .select('*')
  .eq('domain_id', domainId)
  .gte('start_time', window.start)  // 30 days ago
  .lte('start_time', window.end)    // 90 days ahead
  .order('start_time', { ascending: true })
  .limit(30);
```

### Hook Layer

**Location:** `packages/core/src/hooks/useTimelineEvents.ts`

React Query hook with:
- 1-minute stale time
- Automatic refetching on window focus
- Error handling
- Loading states

```typescript
export const useTimelineEvents = (domainId: string) => {
  return useQuery<TimelineEvent[]>({
    queryKey: ['timeline-events', domainId],
    queryFn: () => fetchTimelineEvents(domainId),
    staleTime: 1000 * 60,
  });
};
```

### UI Layer

**Location:** `apps/yacht-racing/app/(tabs)/races.tsx`

**TimelineStrip Component** (from `@betterat/ui`)

The Races screen:
1. Calls `useTimelineEvents('yachtracing')`
2. Maps results to `TimelineItem[]` format
3. Falls back to `DEFAULT_TACTICS_TIMELINE` if no data
4. Passes to `ReadinessDashboard` component

**Mapping Logic:**
```typescript
const mapTimelineEventToItem = (event: TimelineEventRecord): TimelineItem => ({
  id: event.id,
  label: event.title || 'Upcoming activity',
  summary: buildTimelineSummary(event),  // Auto-formats dates, location
  notes: buildTimelineNotes(event),      // Detailed metadata
  timestamp: event.start_time || null,
  status: event.status || null,
});
```

## Testing

### Live Data Test
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('domain_id', 'yachtracing')
    .limit(5);
  console.log(data, error);
})();
"
```

### Mock Mode Test
1. Set `EXPO_PUBLIC_TIMELINE_MOCK=true` in `.env`
2. Restart Metro
3. Navigate to `/races`
4. See 3 hardcoded mock events in races.tsx:211-209

### REST API Test
```bash
curl "https://your-project.supabase.co/rest/v1/timeline_events?domain_id=eq.yachtracing&select=*" \
  -H "apikey: YOUR_ANON_KEY"
```

## Configuration

### Window Settings
Adjust lookback/lookahead in `packages/core/src/services/timeline.ts`:
```typescript
const LOOKBACK_DAYS = 30;   // How far back to look
const LOOKAHEAD_DAYS = 90;  // How far ahead to look
```

### Fallback Limit
```typescript
const FALLBACK_LIMIT = 30;  // Max events to return
```

## Adding a New Domain

1. **Database:** Add a UNION clause to `timeline_events` view:
```sql
UNION ALL
SELECT
  cs.id,
  'nursing'::text AS domain_id,
  cs.session_name AS title,
  cs.start_time,
  cs.status,
  cs.facility_name AS location,
  cs.notes AS summary
FROM clinical_sessions cs;
```

2. **Constants:** Add domain ID constant:
```typescript
// apps/nursing/constants.ts
export const TIMELINE_DOMAIN_ID = 'nursing';
```

3. **Screen:** Use the hook:
```typescript
import { useTimelineEvents } from '@betterat/core';

const { data, isLoading, error } = useTimelineEvents('nursing');
```

4. **Migration:** Deploy view update to Supabase

## Current Status

### Verified Working ✅
- [x] Supabase view `timeline_events` deployed
- [x] REST API endpoint accessible
- [x] 30-day lookback / 90-day lookahead window filter
- [x] Domain filtering by `yachtracing`
- [x] Service layer with fallback logic
- [x] React Query hook with caching
- [x] UI integration in Races screen
- [x] Mock mode for local testing
- [x] Metro server running stable on port 8081

### Live Data
- 30 events returned for `yachtracing` domain
- Date range: Oct 15, 2025 → Feb 12, 2026
- Sample events: "Dragon Class - Croucher Series 3 & 4", "Croucher 3 & 4"

## Known Issues

1. **Watchman Recrawl Warning** - Non-blocking, can be cleared with:
   ```bash
   watchman watch-del '/path/to/betterat-platform'
   watchman watch-project '/path/to/betterat-platform'
   ```

2. **Package Version Warnings** - Non-critical:
   - `react-native-maps@0.25.0` (expected 1.20.1)
   - `react-native-worklets@0.6.1` (expected 0.5.1)

3. **Legacy Stub Logging** - Unrelated console noise (Anthropic key, StormGlass key, Tailwind warnings)

## Next Steps

1. **Remove Mock Toggle** (optional) - The mock mode can stay for testing
2. **Add Clinical Domain** - Extend view to union `clinical_sessions` table
3. **Optimize Query** - Add indexes on `domain_id` and `start_time` columns in source tables
4. **Add Caching** - Consider edge caching for public timeline data
5. **Analytics** - Track timeline event views and clicks

## Resources

- **Supabase Dashboard:** View timeline_events in Table Editor
- **REST Endpoint:** `/rest/v1/timeline_events?domain_id=eq.yachtracing`
- **Metro DevTools:** http://localhost:8081
- **UI Component:** `@betterat/ui/components/domain-dashboard/TimelineStrip`

## Deployment Checklist

- [x] Run migrations in Supabase SQL Editor
- [x] Verify view permissions (anon, authenticated, service_role)
- [x] Test REST endpoint with anon key
- [x] Deploy service layer changes
- [x] Verify React Query caching
- [x] Test UI in web and native builds
- [x] Monitor for performance issues (query time, bundle size)

---

**Last Updated:** 2025-11-14
**Status:** Production Ready ✅
