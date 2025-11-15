# React Query Integration

We use [@tanstack/react-query](https://tanstack.com/query/latest) across the Expo surfaces (Yacht Racing + Nursing) to keep live data in sync while still working offline.

## Provider placement
- `apps/yacht-racing/app/_layout.tsx` wraps the entire Expo Router tree with a shared `QueryClientProvider`.  
- Defaults: `staleTime = 5m`, `gcTime = 30m`, `retry = 1`, `refetchOnWindowFocus = false`.  
- All domain screens (including the shared Venue Intelligence layout) automatically inherit this client.

## Retry / offline behavior
1. **Retry policy** – we retry network failures once (`retry: 1`). If both attempts fail we surface the error banner in the Venue admin sidebar and keep showing the last known data.
2. **Offline-first reads** – queries that must work in the browser (e.g., `club-venues`) set `networkMode: 'offlineFirst'` and hydrate with sample data while Supabase is unreachable. Users can keep browsing and editing cached venues; mutations enqueue and re‑sync when the network returns.
3. **Manual sync warnings** – optimistic mutations update the cache immediately via `queryClient.setQueryData`. If the Supabase write fails we display “Unable to sync…” messages but leave the optimistic value in place so the UI never snaps back.

## Venue verification query
- Query key: `['club-venues']`.
- Source: `apps/yacht-racing/app/venue-verification.tsx`.
- Fetcher: Supabase `sailing_venues` rows → mapped into `ClubVenue`.
- Offline/empty data falls back to local samples so the nursing + yacht racing Venue Intelligence surfaces always have content.
- Selection state is local (`selectedVenueId`) so cached lists can refresh without dropping the user’s context.

## Nursing surface
The Nursing discovery/operations modules can reuse the same client + query patterns. When we point those screens at Supabase, we only need to:
1. Define a `useQuery` with a stable `queryKey` plus `networkMode: 'offlineFirst'`.
2. Share cached data between the yacht racing + nursing Venue Intelligence layouts.
3. Document any domain-specific retries (default is still 1).

## Adding new queries
1. Import `useQuery`/`useMutation` from `@tanstack/react-query`.
2. Keep fetchers pure (no stateful side effects) and throw errors so the banner component can react.
3. Use `queryClient.invalidateQueries({ queryKey })` after any write that should trigger a refetch.
4. If a screen needs offline-ready placeholder data, pass `initialData`/`placeholderData` and mention the fallback source in code comments so ops teams understand what users will see without a network.
