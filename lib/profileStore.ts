/**
 * Simple in-memory profile store.
 * This avoids using localStorage and allows the app to access
 * the fetched profile during the current session.
 */

let _profile: any = null;

export function setProfile(profile: any) {
  _profile = profile;
}

export function getProfile() {
  return _profile;
}

export function clearProfile() {
  _profile = null;
}

// Try to load profile from the API when needed. This is async and should
// be called from a client component on app startup to ensure the in-memory
// store survives page reloads by re-populating it.
export async function loadProfileFromApi() {
  if (typeof window === 'undefined') return null;
  if (_profile) return _profile;

  try {
    const { apiFetch } = await import('@/lib/api');
    const profile = await apiFetch<any>('/profiles/me').catch(() => null);
    if (profile) setProfile(profile);
    return profile;
  } catch (e) {
    console.warn('[v0] profileStore.loadProfileFromApi failed:', e);
    return null;
  }
}

export default { getProfile, setProfile, clearProfile, loadProfileFromApi };
