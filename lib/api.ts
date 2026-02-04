/**
 * API Helper Functions with Supabase Support
 * Comprehensive API utilities for authentication, file uploads, and data fetching
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1").replace(/\/$/, "");
const API_ORIGIN = (() => {
  try {
    const base = new URL(
      API_BASE,
      typeof window !== "undefined" ? window.location.origin : "http://localhost"
    );
    return base.origin;
  } catch {
    return "";
  }
})();

// Separate origin for file assets (/uploads). Allows pointing directly at backend host even when API_BASE is relative.
const FILE_BASE_ORIGIN = (() => {
  const override = process.env.NEXT_PUBLIC_FILE_BASE_URL as string | undefined;
  if (override) {
    try {
      return new URL(override).origin;
    } catch {
      /* fall through */
    }
  }
  // Fallback to API origin
  return API_ORIGIN || (typeof window !== "undefined" ? window.location.origin : "");
})();

// Supabase public bucket base for legacy /uploads paths (optional)
const SUPABASE_UPLOAD_BASE = process.env.NEXT_PUBLIC_SUPABASE_UPLOAD_BASE as string | undefined;

const missingUploads = new Set<string>();

export function markUploadMissing(url?: string) {
  if (!url) return;
  try {
    const normalized = new URL(url, API_ORIGIN || window.location.origin).toString();
    if (normalized.includes("/uploads/")) {
      missingUploads.add(normalized);
    }
  } catch {
    // ignore
  }
}

export function resolveMediaUrl(path?: string): string | undefined {
  if (!path) return path;
  // Detect supabase signed URLs or legacy uploads path and rewrite to configured public upload base when available.
  try {
    const parsed = new URL(path, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    const isSupabaseHost = parsed.host.includes("supabase.co");
    if (isSupabaseHost) {
      // Handle signed object URLs (e.g. /object/sign/uploads/<path>) or direct /uploads/ paths
      let matched: string | null = null;
      if (parsed.pathname.includes("/uploads/")) {
        matched = parsed.pathname.split("/uploads/").pop() || null;
      } else if (parsed.pathname.includes("/object/sign/")) {
        const after = parsed.pathname.split("/object/sign/").pop() || "";
        // After object/sign/ may include uploads/<path> or bucket/path; prefer the portion after uploads/ if present
        matched = after.includes("/uploads/") ? after.split("/uploads/").pop() : after || null;
      }
      if (matched) {
        const filenameOrPath = String(matched).replace(/^\/+/, "");
        if (SUPABASE_UPLOAD_BASE) {
          return `${SUPABASE_UPLOAD_BASE.replace(/\/$/, "")}/${filenameOrPath}`;
        }
        // Fall back to building a public storage URL on the same supabase origin
        const bucket = "uploads";
        return `${parsed.origin}/storage/v1/object/public/${bucket}/${filenameOrPath}`;
      }
    }
  } catch {
    // ignore URL parsing errors — fall back to other checks
  }

  const hasUploads = path.startsWith("/uploads") || path.startsWith("uploads/") || path.includes("/uploads/");
  if (hasUploads && SUPABASE_UPLOAD_BASE) {
    const filename = path.split("/").pop() || "";
    return `${SUPABASE_UPLOAD_BASE.replace(/\/$/, "")}/${filename}`;
  }
  // Already a fully-qualified URL (incl. data/blob URIs) – use as-is
  if (/^(https?:|data:|blob:)/i.test(path)) {
    try {
      const url = new URL(path);
      // Rewrite any upload URL to the current file origin to avoid mixed content/CORB
      const isUploadPath = url.pathname.startsWith("/uploads");
      const differentHost =
        FILE_BASE_ORIGIN &&
        new URL(FILE_BASE_ORIGIN).host !== url.host &&
        (url.protocol.startsWith("http"));
      if (isUploadPath && FILE_BASE_ORIGIN && differentHost) {
        return `${FILE_BASE_ORIGIN}${url.pathname}`;
      }
    } catch {
      // fall through
    }
    return path;
  }
  const origin = path.startsWith("/uploads") ? FILE_BASE_ORIGIN : API_ORIGIN;
  const full = path.startsWith("/") ? `${origin}${path}` : `${origin}/${path.replace(/^\/+/, "")}`;
  if (full.includes("/uploads/")) {
    if (missingUploads.has(full)) return undefined;
  }
  return full;
}

type ApiOptions = RequestInit & {
  /** When provided, will be JSON.stringify-ed and sent as the request body */
  json?: unknown;
  /** Skip attaching the Authorization header */
  skipAuth?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;
let refreshDisabled = false;

async function refreshToken(): Promise<boolean> {
  if (refreshDisabled) return false;
  if (refreshPromise) return refreshPromise;
  const token = localStorage.getItem("refreshToken");
  if (!token) {
    refreshDisabled = true;
    return false;
  }
  refreshPromise = (async () => {
    try {
      const res = await fetch(buildUrl("/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        // Only treat 401/422 as token-invalid and clear tokens; otherwise keep tokens and allow future retries
        if (res.status === 422 || res.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          refreshDisabled = true;
        } else {
          refreshDisabled = false;
        }
        return false;
      }
      const data = await res.json();
      if (data?.access_token && data?.refresh_token) {
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        refreshDisabled = false;
        return true;
      }
      refreshDisabled = false;
      return false;
    } catch {
      // Network/other error: don't clear tokens, allow retry on next request
      refreshDisabled = false;
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

function buildUrl(path: string): string {
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail) && data.detail[0]?.msg) return data.detail[0].msg;
    if (typeof data?.error?.message === "string") return data.error.message;
  } catch {
    // ignore JSON parse errors
  }
  return response.statusText || "Request failed";
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem("accessToken");

  // If we don't have an access token, attempt to refresh using a stored refresh token
  if (!options.skipAuth && !token) {
    const refreshed = await refreshToken();
    if (!refreshed) {
      throw new Error("Not authenticated");
    }
  }

  const finalToken = localStorage.getItem("accessToken");

  if (finalToken && !options.skipAuth) {
    headers.set("Authorization", `Bearer ${finalToken}`);
  }

  let body = options.body;
  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.json);
  }

  const doFetch = () =>
    fetch(buildUrl(path), {
      ...options,
      headers,
      body,
    });

  let response = await doFetch();

  if (!response.ok) {
    if (response.status === 401 && !options.skipAuth) {
      const refreshed = await refreshToken();
      if (refreshed) {
        headers.set("Authorization", `Bearer ${localStorage.getItem("accessToken") || ""}`);
        response = await doFetch();
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        throw new Error("Session expired. Please sign in again.");
      }
      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        throw new Error("Session expired. Please sign in again.");
      }
    }
    if (!response.ok) {
      throw new Error(await parseError(response));
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }
  try {
    return (await response.json()) as T;
  } catch {
    return undefined as T;
  }
}

// Upload a single media file (image or video) and return its public URL
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await apiFetch<{ url: string }>("/uploads/image", {
    method: "POST",
    body: formData,
  });
  return result.url;
}

// Upload any file and return its public URL
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  // Backend supports /uploads/image for both images/videos; reuse for generic file uploads.
  const result = await apiFetch<{ url: string }>("/uploads/image", {
    method: "POST",
    body: formData,
  });
  return result.url;
}
