/**
 * Placeholder script for provisioning Supabase resources during local development.
 * The real automation lives in the RegattaFlow monorepo, but we keep a shim
 * here so TypeScript consumers can import it without runtime errors.
 */
export async function setupSupabaseDb() {
  console.warn('[scripts/setup-supabase-db] Stub invoked. No database changes were made.');
  return { success: true };
}
