/**
 * Local Storage Service with Mock Data Support
 * Handles user session and data persistence
 */

import { MOCK_USERS } from './mock-data';

const STORAGE_KEYS = {
  CURRENT_USER: 'aimploy_current_user',
  AUTH_TOKEN: 'aimploy_auth_token',
  USE_MOCK_DATA: 'aimploy_use_mock_data',
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  title?: string;
  company?: string;
  bio?: string;
  location?: string;
}

/**
 * Sign in with email and password
 * Returns user data if successful
 */
export function signIn(email: string, password: string): User | null {
  const mockUser = MOCK_USERS.find(
    (u) => u.email === email && u.password === password
  );

  if (!mockUser) {
    return null;
  }

  const user: User = {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
    role: mockUser.role,
    avatar: mockUser.avatar,
    title: mockUser.title,
    company: mockUser.company,
    bio: mockUser.bio,
    location: mockUser.location,
  };

  // Store user in local storage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `token_${mockUser.id}`);
    localStorage.setItem(STORAGE_KEYS.USE_MOCK_DATA, 'true');
  }

  return user;
}

/**
 * Get currently logged in user
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

/**
 * Sign out current user
 */
export function signOut(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USE_MOCK_DATA);
  }
}

/**
 * Check if using mock data
 */
export function isUsingMockData(): boolean {
  if (typeof window === 'undefined') {
    return true; // Default to true on server
  }

  return localStorage.getItem(STORAGE_KEYS.USE_MOCK_DATA) === 'true';
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}
