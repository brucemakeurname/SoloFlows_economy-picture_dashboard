const API_BASE = import.meta.env.VITE_API_URL || "/api";

interface ApiResponse<T> {
  data: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE}/${endpoint}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options?.headers },
      ...options,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { data: null as T, error: body.error || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return { data };
  } catch (err) {
    return {
      data: null as T,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};
