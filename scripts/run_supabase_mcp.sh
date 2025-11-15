#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env.local"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Copy .env.local.example and fill Supabase credentials." >&2
  exit 1
fi
set -a
source "$ENV_FILE"
set +a
: "${EXPO_PUBLIC_SUPABASE_URL:?EXPO_PUBLIC_SUPABASE_URL missing}"
: "${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY missing}"
: "${SUPABASE_ACCESS_TOKEN:?SUPABASE_ACCESS_TOKEN missing}"
exec npx -y @supabase/mcp-server-supabase@latest \
  --project-ref qavekrwdbsobecwrfxwu \
  --access-token "$SUPABASE_ACCESS_TOKEN"
