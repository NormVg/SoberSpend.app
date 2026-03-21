
// NOTE: You must replace these with your actual Supabase URL and Anon Key
// from Supabase Dashboard -> Project Settings -> API
export const SUPABASE_URL = 'YOUR_SUPABASE_URL';
export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Hosted backend URL:
export const API_BASE_URL = 'https://sober-spend-backend.vercel.app';

/**
 * Helper to fetch from the Nuxt backend
 * Automatically parses JSON and handles non-2xx errors.
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMsg = `API Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) errorMsg = errorData.message;
    } catch {
      // Ignore JSON parse errors if the response isn't JSON
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
