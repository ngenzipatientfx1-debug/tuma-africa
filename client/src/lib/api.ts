// API client with JWT authentication

const API_URL = import.meta.env.VITE_API_URL || "";

// Get token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

// Set token in localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem("authToken");
  localStorage.setItem("authToken", token);
}

// Remove token from localStorage
export function clearAuthToken(): void {
  localStorage.removeItem("authToken");
}

// Fetch with auth token
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If unauthorized, clear token and redirect to login
  if (response.status === 401) {
    clearAuthToken();
    window.location.href = "/";
  }

  return response;
}

// API helper functions
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || "Request failed");
  }
  return response.json();
}

export async function apiPatch<T>(endpoint: string, data: any): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export async function apiDelete(endpoint: string): Promise<void> {
  const response = await apiFetch(endpoint, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
}
