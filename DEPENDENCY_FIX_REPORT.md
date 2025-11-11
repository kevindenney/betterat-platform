# Dependency Fix Report

## Installed packages
- Added Expo UI and NativeWind stack for the yacht-racing app: `expo-router`, `nativewind`, `tailwindcss`, `lucide-react-native`, `expo-image`, `expo-image-picker`, `expo-file-system`, `expo-location`, `expo-secure-store`, `expo-document-picker`, `expo-constants`, `expo-crypto`, `expo-keep-awake`, `expo-av`, `expo-blur`, `@expo/vector-icons`, `@expo/html-elements`, `@react-native-community/netinfo`, `@react-native-community/slider`, `@react-native-async-storage/async-storage`, `react-native-svg`, `@gorhom/bottom-sheet`, and the complete `@gluestack-ui/*` family plus `@legendapp/motion`.
- Installed `@stripe/stripe-react-native` and `babel-plugin-module-resolver` so the new providers compile and Metro can resolve the custom aliases.
- Added `@types/geojson` to `@betterat/core` for the bathymetry/wind types.

## Export and provider changes
- Created `packages/core/src/providers/AuthProvider.tsx`, `CoachWorkspaceProvider.tsx`, and `StripeProvider.tsx`, plus the supporting `AuthService`, storage adapter, and new hooks (`useNetworkStatus`, `useRealtimeConnection`, `useCoachWorkspace`).
- Expanded `packages/core/src/index.ts` to re-export the new services and typed database helpers.
- Added a NativeWind-aware barrel structure under `packages/ui/src/components/{ui,onboarding,shared}` and hooked it into `packages/ui/src/index.ts`.

## NativeWind setup
- Added `apps/yacht-racing/tailwind.config.js`, `global.css`, `nativewind-env.d.ts`, and a project-local `tsconfig.json`/`babel.config.js` so the Expo app can resolve `@` and `@betterat/ui/*` aliases and accept `className` on React Native components.

## Build & type-check status
- `npm run build` (packages/core): ✅
- `npm run build` (packages/ui): ✅
- `pnpm tsc --noEmit` (apps/yacht-racing): could not run because `pnpm` is not installed on this machine. Running `npx tsc --project tsconfig.json --noEmit` instead now yields significantly more focused errors, but still fails because many `@betterat/core` hooks (`useSailorOnboardingState`, `useClubWorkspace`, `useData`, etc.) and UI modules (`@betterat/ui/components/onboarding/*`, `@betterat/ui/components/shared/*`) have not been implemented yet, and Metro/TypeScript still report `className` typing gaps in some screens.

## Remaining issues
- Missing core hooks (`useSailorOnboardingState`, `useClubWorkspace`, `useData`, `useClubIntegrationSnapshots`, etc.) and UI components (`@betterat/ui/components/onboarding/*`, `@betterat/ui/components/shared/*`) still block `tsc`.
- Several screens import `@betterat/core/lib/gates`, `@betterat/core/lib/utils/userTypeRouting`, or other modules that have not been created—those will need to be stubbed or migrated next.
- Once the outstanding hooks/components exist, rerun `npx tsc --project tsconfig.json --noEmit` (or `pnpm tsc` after installing pnpm) to verify the error count drops below the desired threshold.
