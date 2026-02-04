import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

export const supabase = {
  auth: {
    signInWithOAuth: async (options: any) => getSupabaseClient().auth.signInWithOAuth(options),
    signOut: async () => getSupabaseClient().auth.signOut(),
    getSession: async () => getSupabaseClient().auth.getSession(),
    getUser: async () => getSupabaseClient().auth.getUser(),
  },
};

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Google sign-in requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables to be set.');
  }

  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signUpWithGoogle() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Google sign-up requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables to be set.');
  }

  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const client = getSupabaseClient();
  const { data, error } = await client.auth.getUser();
  if (error) {
    return null;
  }
  return data.user;
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    return;
  }

  const client = getSupabaseClient();
  await client.auth.signOut();
}

export function isSupabaseAvailable(): boolean {
  return isSupabaseConfigured();
}

export async function getUserConversations(userId: number) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const client = getSupabaseClient();
  
  try {
    const { data, error } = await client.rpc('get_user_conversations', {
      current_user_id: userId,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (err) {
    console.error('[v0] Error fetching conversations:', err);
    throw err;
  }
}

export async function getHomePageData(userId?: number) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  let finalUserId = userId;

  // If userId not provided, fetch it from the API
  if (!finalUserId) {
    try {
      const { apiFetch } = await import('./api');
      const profile = await apiFetch<any>('/profiles/me');
      finalUserId = profile?.user_id;
      console.log('[v0] Fetched userId from API:', finalUserId);
    } catch (error) {
      console.warn('[v0] Could not fetch user profile:', error);
      // Continue without userId
    }
  }

  const client = getSupabaseClient();
  
  try {
    const { data, error } = await client.rpc('get_home_page_data', {
      current_user_id: finalUserId || null,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data || { feed: [], latest_jobs: [], suggestions: [] };
  } catch (err) {
    console.error('[v0] Error fetching home page data:', err);
    throw err;
  }
}

export async function getUserNetwork(userId: number) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const client = getSupabaseClient();
  
  try {
    const { data, error } = await client.rpc('get_user_network', {
      current_user_id: userId,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data || { connections: [], requests: [], suggestions: [] };
  } catch (err) {
    console.error('[v0] Error fetching network data:', err);
    throw err;
  }
}
