/**
 * SENTI API Client
 * Centralized HTTP client ready for backend integration.
 * Currently routes to mock services; when the backend is live,
 * update NEXT_PUBLIC_API_URL and remove mock fallback.
 */

import { ApiError } from './error';
import { applyRequestInterceptors, applyErrorInterceptors } from './interceptors';
import type { ApiResponse, RequestOptions, HttpMethod } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const DEFAULT_TIMEOUT = 30_000;

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers, signal } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  const config: RequestInit = applyRequestInterceptors({
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : undefined,
    signal: controller.signal,
  });

  try {
    if (!BASE_URL) {
      throw new ApiError(
        'API URL not configured. Using mock services.',
        'NETWORK_ERROR',
        0,
      );
    }

    const response = await fetch(`${BASE_URL}${path}`, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw ApiError.fromStatus(
        response.status,
        errorBody?.error?.message ?? response.statusText,
      );
    }

    const json: ApiResponse<T> = await response.json();
    return json.data;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) {
      throw applyErrorInterceptors(err);
    }

    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out', 'TIMEOUT', 408);
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw ApiError.offline();
    }

    throw ApiError.network();
  }
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: 'GET' as HttpMethod }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: 'POST' as HttpMethod, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: 'PUT' as HttpMethod, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: 'PATCH' as HttpMethod, body }),
  delete: <T>(path: string, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: 'DELETE' as HttpMethod }),
};
