import { createClient } from '@supabase/supabase-js';

type Env = () => { url: string; key: string };

const getEnv: Env = () => ({
  url:
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    (globalThis as any)?.__EXPO_CONSTS?.supabaseUrl ||
    '',
  key:
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    (globalThis as any)?.__EXPO_CONSTS?.supabaseKey ||
    '',
});

let client: ReturnType<typeof createClient> | null = null;

export const supabase = () => {
  if (!client) {
    const { url, key } = getEnv();
    if (!url || !key) {
      throw new Error('Supabase credentials are not configured.');
    }
    client = createClient(url, key);
  }

  return client;
};
