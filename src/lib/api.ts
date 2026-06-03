/**
 * Base URL for API calls.
 * Uses NEXT_PUBLIC_API_URL from .env if available, otherwise falls back to localhost.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Helper function to construct full API endpoints.
 * @param path - The API path (e.g., '/api/users' or 'api/users')
 */
export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};

/**
 * Helper wrapper for fetch that automatically prepends the API_URL.
 * Usage: apiFetch('/api/data', { method: 'GET' })
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = getApiUrl(endpoint);
  return fetch(url, options);
};
