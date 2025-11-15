# Supabase MCP / CLI Setup for Codex

We already store the Supabase credentials used by the Expo app inside `.env.local`. You can leverage the same values to either:

1. start the Supabase MCP server locally (so Codex `/mcp` commands can run SQL directly), or
2. fall back to the Supabase CLI for migrations/queries.

## MCP server (recommended for quick SQL)

1. Ensure `.env.local` contains these values (they already exist in this repo):

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://qavekrwdbsobecwrfxwu.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
   SUPABASE_ACCESS_TOKEN=sbp_...
   ```

2. Run the helper script (it exports the env vars and launches the MCP server):

   ```bash
   ./scripts/run_supabase_mcp.sh
   ```

   Leave it running; Codex will connect on stdin/stdout.

3. Add the MCP entry to `~/.codex/config.toml`:

   ```toml
   [mcp_servers.supabase]
   command = "npx"
   args = [
     "-y",
     "@supabase/mcp-server-supabase@latest",
     "--project-ref", "qavekrwdbsobecwrfxwu"
   ]
   env = { SUPABASE_ACCESS_TOKEN = "${SUPABASE_ACCESS_TOKEN}" }
   startup_timeout_ms = 20000
   ```

   On Windows use `command = "cmd"` and prefix args with `"/c"` plus the full `npx.cmd` path, as per the Reddit/GitHub examples.

4. Restart Codex and run `/mcp list`. You should now see `supabase`. Try a test prompt:

   > Using the Supabase MCP, run `SELECT 1;` and show the result.

## Supabase CLI fallback

If you prefer not to keep the MCP server running, you can still push migrations / run SQL with the CLI:

```bash
supabase login                                    # paste the same PAT as SUPABASE_ACCESS_TOKEN
supabase link --project-ref qavekrwdbsobecwrfxwu \
  --db-url "postgresql://postgres:$SUPABASE_SERVICE_ROLE_KEY@db.qavekrwdbsobecwrfxwu.supabase.co:5432/postgres"

supabase migration new add_start_end_to_timeline_events
# edit supabase/migrations/...sql
define view changes
supabase db push
```

Either route gets you the live `timeline_events` view the `/races` timeline requires.
