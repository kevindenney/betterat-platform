# AI Services Stub Report

## Stubbed Services & Helpers
The following modules now provide deterministic placeholder data and log whenever they are invoked so UI screens can mount without native/AI backends:

- `services/ai/*` family (`RaceCourseExtractor`, `RaceStrategyEngine`, `DocumentProcessingService`, `VoiceNoteService`, `SailingEducationService`, `PDFExtractionService`, `StrategicPlanningService`, `AutoCourseGeneratorService`) plus `services/ai/index.ts` for re-exporting.
- Shim re-exports so legacy imports keep working: `services/RaceCourseExtractor.ts`, `RaceStrategyEngine.ts`, `DocumentProcessingService.ts`, `VoiceNoteService.ts`, `SailingEducationService.ts`, `PDFExtractionService.ts`, `StrategicPlanningService.ts`, `AutoCourseGeneratorService.ts`.
- Additional feature stubs now in place: `services/tuningGuideService.ts`, `services/TuningGuideExtractionService.ts`, `services/TacticalZoneGenerator.ts`, `services/RaceDocumentService.ts`, `services/monteCarloService.ts`, `services/MockRacingDataService.ts`, `services/weather/RegionalWeatherService.ts`, `services/weather/StormGlassService.ts`, `services/weather/mockWeatherData.ts`, plus support utilities under `lib/utils/logger.ts`.

## Packages Installed
```
victory
react-native-calendars
react-native-chart-kit
react-native-svg
@react-native-community/datetimepicker
react-native-worklets
react-native-worklets-core
expo-linking
metro
undici
```
All installs used `--legacy-peer-deps` to work around existing React version pinning inside the workspace. The extra CLI dependencies (`metro`, `undici`, `expo-linking`) were necessary to get Expo’s tooling running again after the initial module errors.

## Build & Runtime Status
| Command | Result | Notes |
| --- | --- | --- |
| `npx expo start --port 8085 --reset-cache` | ⚠️ | Metro boots and waits on port 8085 (watchman warns about recrawls). Running via `npm start` alone still prompts for a new port in non-interactive mode, so use the explicit `npx expo start` invocation to avoid the prompt. |
| `npx expo export --platform web` | ✅ | Completes successfully now; output lives under `apps/yacht-racing/dist`. Remaining warnings are about missing favicon and stub UI components, but no blocking errors. |
| `npm run ios` | ⚠️ | The native build now progresses into Xcode/Pods; no missing-module crashes. I stopped the process after confirming compilation kicked off to avoid a long-running simulator build in this environment. |

## Remaining Issues / Next Steps
1. **Watchman Warning** – `watchman` recrawl warnings still appear when starting Metro. Consider running `watchman watch-del ...` per the logged guidance to clear the caches.
2. **Favicon Missing** – Expo reports `web.favicon` pointing at `./assets/favicon.png`, which does not exist. Drop in the asset or remove the reference from `app.json` to silence the warning.
3. **Stub UX** – Many UI components still render stub implementations (`@betterat/ui` placeholders). Replace these with real components as they become available.
4. **Runtime Secrets** – Supabase clients now fall back to stub URLs/keys so builds succeed. Replace `stub.supabase.co` and `stub-anon-key` with real environment variables before shipping.
5. **iOS Build** – Re-run `npm run ios` when you’re ready to finish a simulator/device build; expect a longer compile the first time because Pods and React Native frameworks need to finish building.

With these stubs and toolchain fixes, Metro/Web bundling run to completion, so screens load without missing-module crashes. Replace the stub implementations gradually as the real AI and backend pieces come online.
