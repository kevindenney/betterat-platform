# Session 5 – Supabase + Config Notes

## 1. Verify Expo Dev Server Uses Earl's Supabase Credentials
1. Ensure Earl's secrets are present: from the repo root run
   ```bash
   python3 - <<'PY'
from pathlib import Path
path = Path('.env.local')
for line in path.read_text().splitlines():
    if line.startswith('EXPO_PUBLIC_SUPABASE_'):
        key, _, value = line.partition('=')
        masked = value[:6] + '...' if len(value) > 6 else value
        print(f"{key}={masked}")
PY
   ```
   You should see masked values for `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`, confirming the Earl project settings are loaded.
2. Start the Expo dev server from the app workspace so it automatically loads `.env.local`:
   ```bash
   cd apps/yacht-racing
   npx expo start --web
   ```
3. Open the running web app in your browser and check the DevTools console. You should see a collapsed log group labeled `[SupabaseClient]` showing the project URL, a masked anon key preview, and the storage adapter. Those values are sourced directly from `.env.local`, so this confirms the dev server is using Earl's Supabase credentials.

## 2. Venue Tab Detection Now Uses Supabase
- `apps/yacht-racing/services/location/VenueDetectionService.ts` now syncs its venue cache from Supabase (via `sailing_venues`) and prioritizes Supabase RPCs (`venues_within_radius` / `venues_within_bbox`) before falling back to the bundled demo dataset.
- Successful network detections hydrate the local cache so manual selection, dashboards, and offline fallbacks continue to work without code changes.
- Manual overrides still call Supabase directly, so any venue that exists in Earl's database can be selected even if it was not pre-bundled.

### Testing Steps
1. Launch the Expo app (web or native) and navigate to the **Venue** tab.
2. Allow location access when prompted. The app will attempt to resolve your GPS coordinates via Supabase; if a match is found, the map updates instantly and console logs show the detection method as `network`.
3. To verify the fallback path, temporarily disable network access (or revoke Supabase credentials) and repeat; the service will fall back to the built-in venue list but continue working.
4. Manual venue selection still works: choose a venue from the sidebar list or use the AI detection confirmation dialog—both paths now persist selections through Supabase so subsequent sessions load the same venue automatically.

## 3. Supabase Client Debug Logging
- The Supabase client now logs `[SupabaseClient]` details (project URL, anon key preview, adapter) whenever the app runs in a browser and `NODE_ENV !== 'production'`. Use this log to double-check which environment variables the client received without exposing full secrets.
