import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.');
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
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/google/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signUpWithGoogle() {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/google/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getCurrentUser() {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.getUser();
  if (error) {
    return null;
  }
  return data.user;
}

export async function signOut() {
  const client = getSupabaseClient();
  await client.auth.signOut();
}
