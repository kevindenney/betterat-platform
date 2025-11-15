### SupabaseVenueService – Test Plan

1. **Initialization circuit breaker**
   - Mock `supabase.from('sailing_venues').select` to throw `PGRST205` on the first call and return `{ count: 5 }` on the second.
   - Verify `initializeVenueSchema` calls `seedGlobalVenues` once and resolves; simulate three consecutive failures and confirm the circuit breaker throws `Max retry attempts exceeded`.

2. **Location detection error handling**
   - Mock `supabase.rpc('find_venues_by_location')` to reject; expect `findVenueByLocation` to throw `Location-based venue search failed`.
   - Mock RPC success plus a rejected insert inside `trackVenueDetection`; ensure warning is logged but the venue still returns.

3. **Venue fetch + transformation**
   - Mock `supabase.from('sailing_venues').select(...yacht_clubs...)` to resolve with one venue row.
   - Assert `getAllVenues` returns the transformed structure (coordinates, culturalContext defaults, etc.).
   - Mock the same select with `error` and confirm `handleSupabaseError` raises.

4. **Intelligence resolution fallback**
   - Mock the joined select to return `PGRST116` while the fallback select succeeds; expect `getVenueWithIntelligence` to return the fallback payload.
   - Mock fallback select failure and assert the helper logs + returns `null`.

5. **Search / nearby RPC coverage**
   - Mock `textSearch` chain to resolve normally and to return `{ error }`; confirm `searchVenues` logs and falls back to `[]` on error.
   - Mock `supabase.rpc('get_nearby_venues')` success/failure and ensure error path returns `[]`.

6. **Venue transition bookkeeping**
   - Mock `supabase.from('venue_transitions').insert` success, and spy on `upsertUserVenueProfile` to verify it receives the derived payload.
   - Mock the insert to return an error and expect `recordVenueTransition` to throw with a logged error.
