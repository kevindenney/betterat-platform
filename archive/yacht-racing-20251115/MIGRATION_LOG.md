# App Directory Migration Log

## Migration Date
$(date)

## Source
~/Developer/RegattaFlow/regattaflow-app/app/

## Target
~/Developer/betterat-platform/apps/yacht-racing/app/

## Summary
- **Total TypeScript Files**: 164
- **Directories Copied**: 25

## Directory Structure

### Root Level Directories
1. **(auth)/** - Authentication screens
2. **(legacy)/** - Legacy screens for backward compatibility
3. **(tabs)/** - Main tab navigation screens
4. **calendar/** - Calendar and scheduling screens
5. **club/** - Club management screens
6. **coach/** - Coaching marketplace screens
7. **debug/** - Debug and development tools
8. **members/** - Member management screens
9. **race/** - Race-specific screens
10. **settings/** - App settings screens

### (tabs) Subdirectories
- **boat/** - Boat management tab
- **fleet/** - Fleet management tab
- **race/** - Race tab
- **race-session/** - Active race session tab

### club Subdirectories
- **entries/** - Race entry management
- **event/** - Event management
- **race/** - Club race screens
- **results/** - Results management

### coach Subdirectories
- **client/** - Coach-client interaction screens

### race Subdirectories
- **analysis/** - Race analysis screens
- **edit/** - Race editing screens
- **simulation/** - Race simulation screens
- **timer/** - Race timer screens
- **validate/** - Race validation screens

## Files by Directory

  - _layout.tsx
  - (auth)/_layout.tsx
  - (auth)/callback.tsx
  - (auth)/club-onboarding-chat.tsx
  - (auth)/club-onboarding-complete.tsx
  - (auth)/club-onboarding-enhanced.tsx
  - (auth)/club-onboarding-payment-confirmation.tsx
  - (auth)/club-onboarding-payment.tsx
  - (auth)/club-onboarding-simple.tsx
  - (auth)/club-onboarding-website-verification.tsx
  - (auth)/coach-onboarding-availability.tsx
  - (auth)/coach-onboarding-complete.tsx
  - (auth)/coach-onboarding-expertise.tsx
  - (auth)/coach-onboarding-pricing.tsx
  - (auth)/coach-onboarding-profile-preview.tsx
  - (auth)/coach-onboarding-stripe-callback.tsx
  - (auth)/coach-onboarding-welcome.tsx
  - (auth)/login.tsx
  - (auth)/onboarding-redesign.tsx
  - (auth)/onboarding.tsx
  - (auth)/sailor-onboarding-chat.tsx
  - (auth)/sailor-onboarding-comprehensive.tsx
  - (auth)/signup.tsx
  - (legacy)/more.tsx
  - (tabs)/_layout.tsx
  - (tabs)/add-next-race.tsx
  - (tabs)/add-race-redesign.tsx
  - (tabs)/boat/[id].tsx
  - (tabs)/boat/add.tsx
  - (tabs)/boat/edit/[id].tsx
  - (tabs)/boat/index.tsx
  - (tabs)/boats.tsx
  - (tabs)/calendar.tsx
  - (tabs)/clients.tsx
  - (tabs)/clubs.tsx
  - (tabs)/coaching.tsx
  - (tabs)/courses.tsx
  - (tabs)/crew.tsx
  - (tabs)/dashboard.tsx
  - (tabs)/earnings.tsx
  - (tabs)/events.tsx
  - (tabs)/fleet/_layout.tsx
  - (tabs)/fleet/activity.tsx
  - (tabs)/fleet/index.tsx
  - (tabs)/fleet/members.tsx
  - (tabs)/fleet/resources.tsx
  - (tabs)/fleet/select.tsx
  - (tabs)/fleet/settings.tsx
  - (tabs)/fleets.tsx
  - (tabs)/map.tsx
  - (tabs)/members.tsx
  - (tabs)/more.tsx
  - (tabs)/my-learning.tsx
  - (tabs)/profile.tsx
  - (tabs)/race-detail-demo.tsx
  - (tabs)/race-management.tsx
  - (tabs)/race-session/[sessionId].tsx
  - (tabs)/race/[id].tsx
  - (tabs)/race/add.tsx
  - (tabs)/race/comprehensive-add.tsx
  - (tabs)/race/course.tsx
  - (tabs)/race/register/[id].tsx
  - (tabs)/race/scrollable/[id].tsx
  - (tabs)/race/strategy.tsx
  - (tabs)/race/timer.tsx
  - (tabs)/races.tsx
  - (tabs)/schedule.tsx
  - (tabs)/settings.tsx
  - (tabs)/strategy.tsx
  - (tabs)/tuning-guides.tsx
  - (tabs)/venue.tsx
  - add-manual-entry.tsx
  - admin-users-verification.tsx
  - ai-strategy.tsx
  - analytics.tsx
  - boat-setup.tsx
  - boats.tsx
  - calendar.tsx
  - calendar/circuit-planner.tsx
  - club-dashboard.tsx
  - club-solutions.tsx
  - club/earnings.tsx
  - club/entries/[entryId].tsx
  - club/event/[id]/documents.tsx
  - club/event/[id]/entries.tsx
  - club/event/[id]/index.tsx
  - club/event/create.tsx
  - club/race/control/[id].tsx
  - club/results/[raceId].tsx
  - club/results/index.tsx
  - coach/_layout.tsx
  - coach/[id].tsx
  - coach/book.tsx
  - coach/client/[id].tsx
  - coach/client/new.tsx
  - coach/confirmation.tsx
  - coach/discover-enhanced.tsx
  - coach/discover.tsx
  - coach/my-bookings.tsx
  - coaches.tsx
  - confirm-crew.tsx
  - course-view.tsx
  - crew.tsx
  - debug/modal.tsx
  - debug/weather-test.tsx
  - documents.tsx
  - entry-management.tsx
  - fleet-activity.tsx
  - fleet-verification.tsx
  - fleets.tsx
  - for-organizations.tsx
  - index.tsx
  - legacy.tsx
  - location.tsx
  - map-debug.tsx
  - map-fullscreen.tsx
  - members/requests.tsx
  - messages.tsx
  - modal.tsx
  - more.tsx
  - post-update.tsx
  - pricing.tsx
  - profile.tsx
  - race-analysis.tsx
  - race-committee-dashboard.tsx
  - race-control.tsx
  - race-in-progress.tsx
  - race-series-verification.tsx
  - race-strategy.tsx
  - race-timer-pro.tsx
  - race/ai-coach-demo.tsx
  - race/analysis/[id].tsx
  - race/edit/[id].tsx
  - race/simulation/[id].tsx
  - race/tactical.tsx
  - race/tactical.web.tsx
  - race/timer/[id].tsx
  - race/validate/[id].tsx
  - racing-console-demo.tsx
  - racing-console-live-demo.tsx
  - recent-race-analysis.tsx
  - record-finishes.tsx
  - regatta-verification.tsx
  - results-scoring.tsx
  - results.tsx
  - review.tsx
  - score-races.tsx
  - series-race-config.tsx
  - series-standings.tsx
  - settings.tsx
  - settings/change-password.tsx
  - settings/delete-account.tsx
  - settings/edit-profile.tsx
  - settings/language.tsx
  - settings/notifications.tsx
  - start-sequence.tsx
  - subscription.tsx
  - support.tsx
  - test-sections.tsx
  - upload-documents.tsx
  - venue-intelligence.tsx
  - venue-test.tsx
  - venue-verification-review.tsx
  - venue-verification.tsx

## Import Updates Applied

### Component Imports
- **Before**: `from '@/components'`
- **After**: `from '@betterat/ui/components'`
- **Rationale**: Components moved to shared UI package

### Database/Supabase Imports
- **Before**: `from '@/services/supabase'`
- **After**: `from '@betterat/core/database'`
- **Rationale**: Shared database connection from core package

### Hooks Imports
- **Before**: `from '@/hooks'`
- **After**: `from '@betterat/core/hooks'`
- **Rationale**: Shared hooks from core package

### Lib/Utils Imports
- **Before**: `from '@/lib'`
- **After**: `from '@betterat/core/lib'`
- **Rationale**: Shared utilities from core package

### Types Imports
- **Before**: `from '@/types'`
- **After**: `from '@betterat/core/types'`
- **Rationale**: Shared type definitions from core package

### Constants Imports
- **Before**: `from '@/constants'`
- **After**: `from '@betterat/core/constants'`
- **Rationale**: Shared constants from core package

### Utils Imports
- **Before**: `from '@/utils'`
- **After**: `from '@betterat/core/utils'`
- **Rationale**: Shared utility functions from core package

### Service Imports
- **Status**: `from '@/services'` - **Unchanged**
- **Rationale**: Services remain app-specific in yacht-racing/services/

## Navigation Structure Preserved

All Expo Router navigation structure has been maintained:
- `_layout.tsx` files preserved in all directories
- Tab navigation structure intact
- Modal presentations configured
- Stack navigation hierarchies maintained

## Next Steps

1. Update tsconfig.json to ensure @/ path mapping points to yacht-racing directory
2. Verify all imports resolve correctly
3. Test navigation flows
4. Verify component rendering
5. Test service integrations

## Migration Completed

Date: $(date)
Total Files Migrated: 164
Import Updates: ~600+ import statements updated

