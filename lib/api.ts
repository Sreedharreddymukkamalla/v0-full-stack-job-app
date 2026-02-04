/**
 * API Helper Functions
 * Centralized API calls for the AImploy platform
 * Supports both real API calls and mock data
 */

import { isUsingMockData } from './auth';
import {
  MOCK_POSTS,
  MOCK_JOBS,
  MOCK_MESSAGES,
  MOCK_CONVERSATIONS,
  MOCK_COMPANIES,
  MOCK_NOTIFICATIONS,
} from './mock-data';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Make authenticated API requests or return mock data
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: ApiOptions
): Promise<T> {
  // Check if we should use mock data
  const useMock = USE_MOCK || (typeof window !== 'undefined' && isUsingMockData());

  if (useMock) {
    return getMockData<T>(endpoint);
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  
  // Add query parameters
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.warn('[API] Request failed, falling back to mock data:', endpoint);
    return getMockData<T>(endpoint);
  }
}

/**
 * Return mock data based on endpoint
 */
function getMockData<T>(endpoint: string): T {
  // Simulate network delay
  const delay = Math.random() * 500 + 200;
  
  if (endpoint.includes('/posts') || endpoint === '/feed') {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_POSTS as T), delay);
    }) as any;
  }

  if (endpoint.includes('/jobs') || endpoint === '/listings') {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_JOBS as T), delay);
    }) as any;
  }

  if (endpoint.includes('/messages')) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_MESSAGES as T), delay);
    }) as any;
  }

  if (endpoint.includes('/conversations')) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_CONVERSATIONS as T), delay);
    }) as any;
  }

  if (endpoint.includes('/companies')) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_COMPANIES as T), delay);
    }) as any;
  }

  if (endpoint.includes('/notifications')) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_NOTIFICATIONS as T), delay);
    }) as any;
  }

  // Default empty response
  return new Promise((resolve) => {
    setTimeout(() => resolve([] as T), delay);
  }) as any;
}

/**
 * Upload file to storage
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  const useMock = USE_MOCK || (typeof window !== 'undefined' && isUsingMockData());

  if (useMock) {
    // Return a mock URL
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${file.name}`;
        resolve(mockUrl);
      }, 800);
    });
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', path);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.url;
}

// Cache helpers for reducing API calls
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
}

export function setCacheData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
