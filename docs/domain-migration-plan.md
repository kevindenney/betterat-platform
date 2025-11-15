# BetterAt Domain Migration Plan

Working document to guide rebuilding the Yacht Racing experience inside the BetterAt platform and launching the Nursing domain using the shared architecture described in `~/Desktop/nursingaddition.txt`.

---

## 1. Objectives
- **Yacht Racing parity**: Recreate the RegattaFlow experience with modernized UI components, working Supabase data hooks, and zero blocking lint issues inside `apps/yacht-racing`.
- **Nursing launch-ready**: Produce the nursing pages (same layout as yacht racing) with nursing-specific copy/palette and mock data placeholders that can be swapped for real Supabase queries later.
- **Platform readiness**: Ensure domain switching, shared palettes, and logging work consistently so additional domains can be added without structural changes.

## 2. Architecture Decisions
- **Shared core + domain modules**: Keep business logic, Supabase client, and reusable UI primitives in `packages/*`; domain-specific assets live in `apps/<domain>` and/or `domains/<domain>`.
- **Layout primitives**: Build race/shift cards, progress checklists, and insight panels once, then theme via domain tokens (colors, icons, copy injected from Domain SDK).
- **Supabase access**: Centralize credentials/config in `.env.local`; expose typed hooks in `@betterat/domain-sdk` so each domain consumes the same API.
- **Theming**: Derive nursing palette from the existing yacht racing palette per the nursing brief (swap nautical blues for clinical neutrals while keeping structure identical).
- **Mock-friendly data layer**: Until real nursing tables exist, load mock JSON via domain services but preserve the async Supabase contract so swapping to real data is trivial.

## 3. Workstreams
1. **Yacht Racing UI Rebuild**
   - Recreate race list, detail, onboarding, and strategy screens using the new components.
   - Replace Expo-era dependencies (react-three-fiber, deprecated hooks) with leaner alternatives or stubs.
   - Resolve lint + TypeScript errors as each screen is rebuilt.
2. **Nursing Domain Adaptation**
   - Mirror the yacht racing layout with nursing copy per `nursingaddition.txt`.
   - Introduce nursing-specific assets (badge names, checklist steps, staffing insights) via configuration.
   - Land mock data for schedules, competencies, and education modules.
3. **Platform Glue**
   - Domain switcher UI, environment detection, Supabase logging (`[SupabaseClient]`, `[CoreSupabase]`).
   - Reusable checklists/insight components consumed by both domains.
   - Telemetry + error logging hooks so both domains expose similar diagnostics.

## 4. Milestones
| Date (target) | Milestone | Notes |
| --- | --- | --- |
| Week 1 | Race list + detail rebuilt with clean lint | Confirms component strategy |
| Week 2 | Yacht racing onboarding + registration flows live | Includes Supabase reads/writes |
| Week 3 | Domain switcher + shared theming shipped | Toggle between domains in-app |
| Weeks 4-5 | Nursing UI parity (mock data) | Copy/palette validated with stakeholders |
| Week 6 | Nursing Supabase schema defined + hooked up | Replace mocks gradually |

## 5. Open Questions & Risks
- **Supabase schema gaps**: Need final table design for nursing shifts/competencies (schema doc pending).
- **Expo/web parity**: Decide whether yacht racing remains Expo-based or migrates to pure RN/web stacks.
- **Legacy logic reuse**: Identify which RegattaFlow services should be ported vs. rewritten (e.g., RaceStrategyEngine).
- **Design inputs**: Confirm nursing palette and typography choices once mock screens are reviewed.
- **Team bandwidth**: Determine who owns nursing content vs. engineering tasks if timelines overlap.

## 6. Initial Audit Notes (Nov 13)
- **Primary screen to rebuild first**: `apps/yacht-racing/app/(tabs)/races.tsx` holds the hero, metrics, crew, weather, AI notes, documents, and protest panels. It already consumes `@betterat/ui/components/domain-dashboard` primitives plus live Supabase hooks (crew, documents, prep). This becomes the template for both domains.
- **Supporting components**: `components/race/*` (course designer, weather integration) and `components/races/*` (cards, boat selector) provide most of the UI we need to salvage. Many still carry Expo-specific dependencies (MapLibre, react-three-fiber) that can be stubbed while we rebuild.
- **Data services in use**: `@betterat/core/services/SailorRacePreparationService`, `@/services/crewManagementService`, `@/services/RaceDocumentService` inside the races tab. Their Supabase queries are still valid and should be wrapped in reusable hooks per domain.
- **Lint blockers**: The races tab currently passes lint but imports dozens of unused components. Broader lint backlog (239 errors) is concentrated under venue maps and UI primitives; those can be deferred until after the new layout is in place.
- **Reference assets**: `RACES_PAGE_DEBUG.md` documents the render/memory hot spots we must avoid in the rebuild; reuse the useRef patterns described there when instantiating new agents/services.

## 7. Implementation Log (Nov 13)
- Extracted a reusable `ReadinessDashboard` component (`apps/yacht-racing/components/readiness/ReadinessDashboard.tsx`) that encapsulates the stage rail, hero, KPI grid, crew table, logistics checklist, weather cards, analytics, AI notes, documents, and finishing tables.
- Moved all static fallback content into `apps/yacht-racing/data/raceDashboardConfig.ts` so domains can share the same layout skeleton while swapping copy/palette/data.
- Refactored `apps/yacht-racing/app/(tabs)/races.tsx` to focus on data hydration (Supabase + domain services) and feed the new component, eliminating a few hundred lines of duplicated layout/styling.
- Promoted the dashboard component into `@betterat/ui` so other domains can import it, and wired `domains/nursing` to the same layout with nursing-specific copy/palette via `domains/nursing/src/data/dashboardConfig.ts`.
- Added `EventOverviewDashboard` to `@betterat/ui` and refactored `domains/yachtracing/src/screens/EventsScreen.tsx` to consume it, consolidating the club operations hero, quick actions, next-event checklist, and upcoming list into a reusable surface for future domains/apps.
- Wired the Expo tab at `apps/yacht-racing/app/(tabs)/events.tsx` to the shared `EventOverviewDashboard`, keeping the existing metrics, calendar shell, and operations checklist as child sections so mobile, domains, and future platforms stay visually consistent.
- Integrated the same Event Overview surface into `domains/nursing` (new `/operations` route) and the `domains/test` dashboard, proving that non-sailing domains can inherit the club/shift operations layout with domain-specific copy, quick actions, and checklists.
- Added `EventOverviewSurface` (presentation-only) so complex workspaces like `apps/yacht-racing/app/club-dashboard.tsx` can embed the shared hero/quick actions/highlight block without nested SafeAreas; the club dashboard now uses this surface for its overview tab before rendering existing KPIs, regatta lists, and documents.
- Added `VenueOverview` to the UI package and migrated both the Expo venue tab and the yachtracing domain’s venue screen so that all destination-intel views (and future nursing clinic discovery) share the same hero/stats/checklist layout.

---

_Keep this document updated as decisions evolve. Link PRs and tickets here so the plan stays source-of-truth for the multi-domain rollout._
