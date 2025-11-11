# RegattaFlow UX/UI Analysis & Migration Blueprint

**Date:** November 18, 2025  
**Source:** `/Users/kdenney/Developer/RegattaFlow/regattaflow-app`

This document captures the navigation model, signature screen patterns, reusable components, data models, theming system, and end-user features that must be preserved when porting RegattaFlow into the BetterAt platform.

---

## 1. Navigation Structure

### 1.1 Root router & providers
- `app/_layout.tsx:1-160` composes the global providers used everywhere (AuthProvider, StripeProvider, GluestackUIProvider, TanStack Query, ErrorBoundary) and injects shared services such as mutation queues and the offline network banner. Migrating the app requires mounting the BetterAt domain inside an equivalent provider stack so cached data, offline sync, and Stripe still function.
- The same file adds web-specific CSS (viewport height handling, service worker for bathymetry tiles) and suppresses noisy font warnings. Keep an eye on these when rendering inside BetterAt web shells (`app/_layout.tsx:152-230`).

### 1.2 Entry & auth flows
- Landing page (`app/index.tsx:1-60`) shows the marketing hero and immediately redirects signed-in users to the correct dashboard route computed by `getDashboardRoute`. Any migration must preserve this “no blocking splash” behavior—auth readiness is handled asynchronously while the landing UI renders.
- Auth/onboarding experiences live under the `(auth)` route group (login, sailor/club/coach onboarding chat, Stripe callbacks as seen in `project_structure.txt`). They expect the global Stack navigator from `expo-router` defined in `app/_layout.tsx:139-150`.

### 1.3 Role-based tab bar
- `app/(tabs)/_layout.tsx:25-63` defines persona-specific tab configs. Sailors see `Races`, `Courses`, `Boat`, `Venue`, `More`. Coaches see `Clients`, `Schedule`, `Earnings`, `More`. Club admins see `Events`, `Members`, `Race Management`, `Profile`, `Settings`.
- Menu-trigger tabs (the “More” hamburger) open a modal with shortcuts to Fleets, Clubs, Crew, Coaching Marketplace, Tuning Guides, Profile, and Settings plus a warning CTA if the sailor has no boat (`app/(tabs)/_layout.tsx:132-161`). This modal-based overflow must exist in BetterAt so lower-frequency screens remain reachable on mobile phones.
- The tab bar styling and colors shift for club personas (`app/(tabs)/_layout.tsx:194-201`), giving them a dark background and brighter active color. Preserve these semantics in the BetterAt UI theme to keep context switching obvious.
- Hardware back is intercepted on Android to avoid navigating out of the authenticated shell (`app/(tabs)/_layout.tsx:86-104`).

### 1.4 Secondary flows
- Navigation destinations exposed through the tab bar include nested stacks (e.g., `/(tabs)/boat/[id].tsx`, `/(tabs)/race-session/*`, `/(tabs)/fleet/*`). Modal pages such as `app/modal.tsx` and `app/debug/modal.tsx` follow expo-router conventions and should map to BetterAt modal routes.
- Persona-specific redirects happen in `app/(tabs)/dashboard.tsx:1-45`, sending sailors to `/races`, clubs to `/events`, and coaches to `/courses`. When embedding inside BetterAt, keep this redirect logic so deep links continue to land on the right hub.

---

## 2. Key Screens

### 2.1 Races (critical surface)
- **Route:** `/(tabs)/races`
- **Structure:** The screen is wrapped in `PlanModeLayout`, which auto-switches between single-column and split-map layouts for larger tablets (`components/races/modes/PlanModeLayout.tsx:1-70`). The header shows the current venue, notifications button, and offline status indicator (`app/(tabs)/races.tsx:4256-4296`).
- **Signature pattern:** A horizontal, snapping carousel of `RaceCard` components with inline detail expansion lives near the top (`app/(tabs)/races.tsx:4331-4404`). Selecting a card centers it, dims the rest, and populates the lower detail canvas; empty states render mocked races in the exact same horizontal pattern (`app/(tabs)/races.tsx:4867-4905`). This pattern is the defining UX for RegattaFlow and must be preserved.
- **Detail canvas:** Below the cards, the screen conditionally renders race intel such as `RaceOverviewCard`, wind/tide cards, tactical overlays, live timers, and performance analytics (see the imports at `app/(tabs)/races.tsx:1-60`). The canvas is a vertical stack where sections can be toggled on/off depending on race phase and available data (`app/(tabs)/races.tsx:4464-4859`).
- **User interactions:**
  - Swipe horizontally to browse races; Add Race CTA cards are injected inline ahead of the “next race”.
  - Selecting a card triggers `setSelectedRaceId`, scrolls the carousel to center that card (`app/(tabs)/races.tsx:4208-4223`), and loads richer data (`selectedRaceData`).
  - Pull-to-refresh on the parent `ScrollView` runs `onRefresh` to sync Supabase/AI data (`app/(tabs)/races.tsx:4300-4311`).
  - Quick action drawers (`components/races/QuickActionDrawer.tsx:1-120`) provide mark-rounding checklists, voice notes, and emergency buttons accessible during pre-start/active phases.
- **Data displayed:** Race metadata (venue, warning signal, weather/tide), AI strategy summaries, Rig tuning presets, calendar import state, tactical insights, crew readiness, documents (NOR/SI), and post-race analytics such as `PerformanceMetrics` and `SplitTimesAnalysis` (see `app/(tabs)/races.tsx:4842-4855`).
- **CTAs:** Add race, import from calendar, edit/delete race, open venue intelligence, launch live race timer, trigger AI brief sync, upload docs, log contingencies, and open the Smart Race Coach chat.

### 2.2 Boats
- **Route:** `/(tabs)/boat/index`
- **Structure:** Starts with a metrics row summarizing total boats, active vs inactive, primary boat status, last updated timestamp, and storage locations (`app/(tabs)/boat/index.tsx:180-250` and styles at `app/(tabs)/boat/index.tsx:712-755`).
- **Filters & search:** Search bar with clear affordance, All vs Primary toggle, status chips (All/Active/Offline), and a horizontally scrollable class filter list (`app/(tabs)/boat/index.tsx:303-387`). These filters are essential for crews with multi-class programs.
- **List pattern:** Card list showing each boat’s avatar, status badge, sail number, metadata chips (club, storage, ownership), quick action buttons (maintenance, rig tuning, set default) and status ribbons for “Primary” and “Demo” boats (`app/(tabs)/boat/index.tsx:530-640`, `620-651`).
- **User interactions:**
  - Tap a card to navigate to detail (`router.push('/(tabs)/boat/[id]')`).
  - Floating action button adds a new boat (`app/(tabs)/boat/index.tsx:646-651`).
  - Status chips and class chips update stateful filters without leaving the screen.
  - Set-as-default action updates Supabase then refreshes the list (`app/(tabs)/boat/index.tsx:119-134`).
- **Empty/Loading states:** Dedicated skeleton and guidance when no boats exist, encouraging the user to add a vessel before continuing (`app/(tabs)/boat/index.tsx:1012-1040`).

### 2.3 Events / Regattas
- **Route:** `/(tabs)/events`
- **Structure:** Club Operations hero banner summarizing the next event, quick “Create Event” CTA, metrics row (upcoming count, confirmed entries, live status) (`app/(tabs)/events.tsx:218-258`).
- **UI patterns:**
  - Quick action grid (New Regatta, Training Session, Social, Upload NOR/SI) with disabled tiles showing “Coming soon” states (`app/(tabs)/events.tsx:260-288`).
  - Event list with colored status rails, badge chips, date range, entry stats, and inline menu for publishing/closing registration (`app/(tabs)/events.tsx:291-337`).
  - Calendar heatmap showing days with scheduled events and an operations checklist with numbered badges (`app/(tabs)/events.tsx:338-434`).
- **Data displayed:** Status string, date range, site/location, registration stats (`EventRegistrationStats` fetched from `services/eventService.ts:13-94`), financial readiness cues (Stripe connection), and operations reminders.
- **Interactions:** Refresh button, quick actions routing to `/club/event/create`, tapping an event to open `/club/event/[id]`, operations checklist linking to onboarding guides.

### 2.4 Dashboard redirect & persona hubs
- **Route:** `/(tabs)/dashboard`
- **Behavior:** Determines `user_type` from AuthProvider and immediately routes sailors to `/races`, coaches to `/courses`, clubs to `/events` (`app/(tabs)/dashboard.tsx:15-38`). It shows a loading spinner only while persona detection runs. BetterAt’s domain router must replicate this persona-aware redirect so old deep links continue working.
- **Supplemental hubs:** Additional dashboards exist under `/club-dashboard.tsx`, `/race-committee-dashboard.tsx`, and `/coach/*` directories; they reuse the same navigation shell.

### 2.5 Analytics / Stats
- **Routes:** `app/analytics.tsx` plus in-race analytics modules (`components/races/PerformanceMetrics.tsx`, `SplitTimesAnalysis.tsx`).
- **Layout:** Header with back button, card stack showing key performance metrics (Win Rate, Average Position, Improvement) using colored stat boxes, text-based Strengths/Weaknesses list, and AI Recommendation gradient card (`app/analytics.tsx:1-80`).
- **Data displayed:** Aggregated metrics (win rate %), positions, improvement deltas, AI insights. During debrief mode the `PerformanceMetrics` grid surfaces VMG, distance, tack distribution, and total time (`components/races/PerformanceMetrics.tsx:1-120`).
- **User interactions:** Currently read-only but designed for scrollable exploration; migrating to BetterAt should keep the card layout so sailors immediately grok the insights.

---

## 3. Reusable Components

| Component | Location & Props | Visual/Behavior Notes | Used by |
| --- | --- | --- | --- |
| **RaceCard** | `components/races/RaceCard.tsx:1-210` defines props for wind/tide, strategy text, countdown timers, selection state, menus | 375×667px panel with hero data, countdown, wind/tide chips, and overflow menu. Dims when unselected and includes inline actions like refresh weather. | Races tab carousel, demo states. |
| **PlanModeLayout** | `components/races/modes/PlanModeLayout.tsx:1-70` (`raceId`, `raceData`, `children`) | Responsive container that switches between scroll view (phones) and split map/content (tablets). Sets the expectations for all race planning screens. | Races tab, plan/debrief routes. |
| **QuickActionDrawer** | `components/races/QuickActionDrawer.tsx:1-155` (props for mark info, fleet positions, callbacks) | Swipe-up drawer with drag handle, summary pills, checklist with progress bar, voice note/emergency buttons. Provides tactile on-water interaction pattern to preserve. | On-water modes within the Races screen and racing console. |
| **PerformanceMetrics** | `components/races/PerformanceMetrics.tsx:1-120` (`gpsTrack`, `weather`) | 2×2 grid of stat cards showing speed, VMG, distance, time breakdown with icons and color-coded values. | Post-race analytics, Analytics screen, Debrief mode. |
| **BoatCard** | `components/boats/BoatCard.tsx:1-130` (boat info & callbacks) | Tall card with icon avatar, primary badge, equipment stats row, and optional “set default” star action. Works both in lists and detail views. | `/(tabs)/boat/index`, boat pickers. |
| **RaceDetailMapHero & supporting cards** | `components/race-detail/*`, e.g., `RaceDetailMapHero.tsx`, `RaceOverviewCard.tsx` (imported at `app/(tabs)/races.tsx:1-30`) | Provide consistent modular cards for tide/current summaries, rig tuning, crew equipment, contingency plans. Each card follows the same rounded rectangle aesthetic with badges and CTA buttons. | Race detail canvas, plan/debrief flows. |
| **NavigationHeader** | `components/navigation/NavigationHeader.tsx` (imported by tab layout) | Houses the emoji page title, persona avatar, and top-of-app breadcrumbs; ensures the BetterAt shell inherits the same offsets. | Rendered once in `app/(tabs)/_layout.tsx:217-238`. |
| **Gluestack UI primitives** | `components/ui/*` (e.g., `button`, `card`, `error`, `loading`) | Custom wrapper components that unify typography, spacing, button hierarchy. Example: `DashboardSkeleton` used for race loading states (`app/(tabs)/races.tsx:4230-4233`). | All screens. |

---

## 4. UX Patterns to Preserve

1. **Horizontal race timeline** – The swipeable carousel with inline add/import cards and automatic centering of the selected race (`app/(tabs)/races.tsx:4331-4404`) is the brand-defining interaction.
2. **Inline detail expansion** – Selecting a race does not navigate; it expands the lower canvas while keeping the carousel visible for quick hopping (`app/(tabs)/races.tsx:4464-4859`).
3. **Plan vs Track vs Debrief modes** – Mode layouts (`components/races/modes/*.tsx`) swap map + detail arrangements depending on context; BetterAt must support these responsive templates.
4. **Filter chips & quick stats** – Boats and Events screens rely on pill chips with clear active styling (`app/(tabs)/boat/index.tsx:303-387`, `app/(tabs)/events.tsx:245-288`).
5. **Operational checklists** – Numbered checklists with progress badges appear in Events operations and QuickActionDrawer; they convey staged workflows and should migrate intact (`app/(tabs)/events.tsx:412-434`, `components/races/QuickActionDrawer.tsx:120-160`).
6. **Rich empty states** – Demo races, no events, and no boats all show illustrated guidance plus CTA buttons (`app/(tabs)/races.tsx:4867-4905`, `app/(tabs)/events.tsx:300-319`, `app/(tabs)/boat/index.tsx:1012-1034`). Users expect these safety nets.
7. **Menu-trigger tab overflow** – The “More” modal with warning chips for incomplete profiles is the navigation escape hatch (`app/(tabs)/_layout.tsx:132-161`).
8. **Live/offline indicators** – Offline banner and status icons are sprinkled throughout (`NetworkStatusBanner` at `app/_layout.tsx:139-147`, offline indicator in Races header `app/(tabs)/races.tsx:4258-4268`).

---

## 5. Data Models

| Entity | Definition | Key fields to migrate |
| --- | --- | --- |
| **Race / Regatta** | `hooks/useEnrichedRaces.ts:34-83` defines race objects used by the UI (id, name, venue, date, startTime, wind/tide metadata, status). `types/raceEvents.ts:24-120` adds Supabase-level definitions (series, boat class, venue, extraction method, weather forecasts). | IDs, names, warning signal time, venue metadata, strategy text, wind/tide blocks, AI enrichment flags, extraction status, mark geometry, forecast snapshots. |
| **Boat (SailorBoat)** | `services/SailorBoatService.ts:18-88` enumerates identity fields, status enum, ownership metadata, home club links, and joined boat class records. | `status`, `is_primary`, `boat_class`, storage location, ownership type, metadata map, timestamps. |
| **Event / Regatta** | `services/eventService.ts:13-90` outlines `ClubEvent` (type, status, registration window, location geometry, visibility, payment settings) plus registration/document types. | `event_type`, `status`, `visibility`, registration fees, waitlist flags, boat classes, contact info. |
| **Race Documents** | `services/RaceDocumentService.ts:9-80` describes document linking records and document metadata (type, storage ID, sharing flags). | Document IDs, types (NOR, SI, NOTAM), fleet visibility toggles, metadata for storage.
| **Results / Standings** | `services/ResultsService.ts:12-90` defines `RegattaWithResults`, scoring configuration, standings rows with entry details, net points, discard tracking. | Regatta id, scoring config (system, discards), standings arrays, publishing flags.
| **User / Persona** | `services/supabase.ts:36-90` stores `user_type`, subscription fields, stripe IDs; `providers/AuthProvider.tsx:1-120` wraps this with persona detection logic (checks coach_profiles, club_profiles). | `user_type`, onboarding completion, persona-specific profile IDs, demo session flag, biometric settings.
| **Analytics data** | `components/races/PerformanceMetrics.tsx:112-200` calculates derived stats (avg speed, VMG, distance, tack percentages) from `GPSPoint` arrays defined in Debrief layouts. | GPS tracks, wind direction, derived metrics (strings but should map to numeric values for charts).

These models depend on Supabase tables (`supabase` client) and multiple services (RaceWeatherService, TacticalZoneGenerator, etc.). When embedding inside BetterAt, either reuse these services or mirror their responses through the BetterAt data layer.

---

## 6. Theme & Styling

- **Design tokens:** `constants/designSystem.ts:13-120` defines typography (h1=22/700, h2=18/600, caption=9pt), spacing scale (2 → 24), shadows, and border radii (4–14px). Migration should recreate these tokens inside BetterAt’s theme engine.
- **Color palette:** Semantic colors live in `constants/designSystem.ts:140-220` with primary blues (`#3B82F6`/`#2563EB`), AI purple gradients, success green, warning amber, danger red, neutral slates, and background layers. `constants/Colors.ts:1-56` adapts them for legacy hooks.
- **Global styling:** The project mixes Tailwind-style `className` strings via NativeWind (see `className` usage throughout `app/(tabs)/races.tsx`) and StyleSheet objects (Boats, Events). Ensure the BetterAt domain supports both atomic styles and JS style objects.
- **Component styling:** Cards consistently use rounded-18/20px corners, soft drop shadows, and pastel background badges (see Events hero card `app/(tabs)/events.tsx:441-520`). Buttons follow Gluestack UI tokens (primary blue, secondary outlined, destructive red).
- **Accessibility:** Large touch targets (accessible `TouchableOpacity` on Race header icons) and voice interaction hooks (QuickActionDrawer voice note). Keep these semantics when migrating.

---

## 7. Features Checklist for Migration

| Category | Features | Source references |
| --- | --- | --- |
| **Race planning & execution** | Horizontal race timeline, AI venue intelligence, rig tuning cards, live race timer, tactical overlays, contingency planning, crew equipment audits, mark rounding checklists, tactical zone generator, race document uploads. | `app/(tabs)/races.tsx`, `components/race-detail/*`, `components/races/*`, `services/RaceDocumentService.ts`. |
| **On-water tracking & debrief** | OnWaterTrackingView, LivePositionTracker, SplitTimesAnalysis, TacticalInsights, AI Pattern Detection, Debrief mode analytics. | `components/races/OnWaterTrackingView.tsx`, `SplitTimesAnalysis.tsx`, `TacticalInsights.tsx`, `components/races/debrief/*`. |
| **Boat management** | CRUD for individual boats, class filters, status tagging, maintenance & rigging quick actions, 3D boat viewer, rig tuning controls, sail inventory. | `/(tabs)/boat/*`, `components/boats/*`, `services/SailorBoatService.ts`. |
| **Events & club ops** | Event creation wizard, quick actions (regatta/training/social), registration stats, payouts (Stripe), operations checklist, calendar heatmap, document uploads (NOR/SI), entry management, results scoring, race committee dashboard. | `/(tabs)/events.tsx`, `app/entry-management.tsx`, `services/eventService.ts`, `services/ResultsService.ts`. |
| **Coaching & learning** | Smart Race Coach chat, QuickSkill buttons, coach marketplace (`/(tabs)/coaching.tsx`), coach onboarding flows, scheduling and earnings screens for coaches. | `components/coaching/*`, `app/coach/*`, `app/(tabs)/coaching.tsx`, `app/(tabs)/earnings.tsx`. |
| **Analytics & insights** | Standalone analytics screen, performance metric cards, AI recommendations, fleet analytics, race committee dashboards, past race analysis (`app/recent-race-analysis.tsx`). | `app/analytics.tsx`, `components/races/PerformanceMetrics.tsx`, `components/races/FleetPostRaceInsights.tsx`. |
| **Clubs, fleets, crew** | Fleet activity feeds, crew confirmations, club dashboards, member management, venue verification workflows, document upload flows for NOR/SI. | `app/fleet-activity.tsx`, `app/confirm-crew.tsx`, `app/club/*`, `app/documents.tsx`. |
| **AI & automation** | Venue Intelligence Agent, StrategicPlanningService, TacticalZoneGenerator, RaceBrief sync, AI quick entries, AI rig tuning, skill uploads. | `services/VenueIntelligenceService.ts`, `services/StrategicPlanningService.ts`, `services/TacticalZoneGenerator.ts`, `components/races/AIQuickEntry.tsx`, `hooks/useRaceBriefSync.ts`. |
| **Settings & profile** | Profile editing, subscription management (`app/subscription.tsx`), payment setup, multi-persona onboarding, biometric login toggles, offline sync controls. | `app/profile.tsx`, `app/settings.tsx`, `providers/AuthProvider.tsx`, `app/subscription.tsx`. |

Ensure every feature above has a migration plan or parity story before retiring the native RegattaFlow shell.

---

This blueprint should guide the BetterAt migration by highlighting which navigation flows, UI patterns, components, and data contracts drive the RegattaFlow experience. Reproduce the horizontal race timeline, data-rich cards, and role-based navigation exactly—those elements define the product’s identity.
