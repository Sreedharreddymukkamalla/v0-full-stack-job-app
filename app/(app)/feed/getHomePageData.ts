import { createClient } from '@supabase/supabase-js';
import { apiFetch } from '@/lib/api';
import { setProfile } from '@/lib/profileStore';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

export async function getHomePageData(userId?: number) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  let finalUserId = userId;

  if (!finalUserId) {
    try {
      const profile = await apiFetch<any>('/profiles/me');
      // Store the profile in the in-memory global store (avoid localStorage)
      try {
        setProfile(profile);
      } catch (e) {
        console.warn('[v0] Could not set profile in store:', e);
      }

      finalUserId = profile?.user_id;
      console.log('[v0] Fetched userId from API (feed helper):', finalUserId);
    } catch (error) {
      console.warn('[v0] Could not fetch user profile in feed helper:', error);
      // Continue without userId
    }
  }

  const client = getSupabaseClient();
  try {
    const { data, error } = await client.rpc('home_bootstrap_rpc', {
      current_user_id: finalUserId || undefined,
    } as any);

    if (error) throw new Error(error.message);

    return data || { feed: [], latest_jobs: [], suggestions: [] };
  } catch (err) {
    console.error('[v0] Error fetching home page data (feed helper):', err);
    throw err;
  }
}
