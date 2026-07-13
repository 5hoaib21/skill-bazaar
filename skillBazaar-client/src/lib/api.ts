import type { ApiResponse } from "@/types";
import { getSession } from "@/lib/session-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/volunteerconnect\.csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const s = getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // Send session ID via header so backend can look up the session
  if (s?.session?.id) {
    headers["X-Session-ID"] = s.session.id;
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) headers["X-CSRF-Token"] = csrf;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  const json: ApiResponse<T> = await res.json();
  if (!json.success) {
    throw new Error(json.message || "Request failed");
  }
  return json.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
};
