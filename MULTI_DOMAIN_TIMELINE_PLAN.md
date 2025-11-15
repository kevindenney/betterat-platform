# Multi-Domain Timeline & Tabs Plan

## Backend
- [x] Create `timeline_events` view (races + clinical_sessions)
- [x] Add RLS policy for `timeline_events`
- [ ] (If needed) add `clinical_sessions` table migration

## Core Services
- [ ] `packages/core/src/services/timeline.ts`
- [ ] `packages/core/src/hooks/useTimelineEvents.ts` (export via hooks index)

## Shared UI
- [x] `packages/ui/src/components/shared/TimelineStrip.tsx`
- [x] Optional `SegmentTabs` helper (if needed)

## Nursing Domain
- [x] `domains/nursing/src/components/AddCaseModal.tsx`
- [x] New `domains/nursing/src/screens/Dashboard.tsx` using timeline + tabs
- [x] Update `domains/nursing/src/index.tsx` to export new dashboard

## Yacht Racing Domain
- [x] Integrate `TimelineStrip` in `domains/yachtracing/src/screens/RacesScreen.tsx`
- [x] Reorganize sections into Plan / Act / Analyze tabs
- [x] Wire `Add Race` button to timeline CTA

## Copy & UX
- [x] Map yacht racing copy from existing sections to tabs
- [x] Map nursing copy per `nursingaddition.txt`
- [x] Domain-specific empty states & CTA labels

## QA
- [x] `npm run build --filter=@betterat/ui`
- [x] `npm run build --filter=@betterat/domains-yachtracing`
- [x] `npm run build --filter=@betterat/domains-nursing`
- [ ] `cd apps/mobile && npx expo start --clear --web`
- [ ] Verify timeline + tabs for both domains
