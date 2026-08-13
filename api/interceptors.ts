/**
 * SENTI API Interceptors
 * Request/response interceptors for auth token injection,
 * error normalization, and offline detection.
 */

import type { ApiError, ErrorCode } from './error';
import { ApiError as ApiErrorClass } from './error';
import type { AuthTokens } from './types';

type Interceptor<T> = (value: T) => T | Promise<T>;
type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

const requestInterceptors: Interceptor<RequestInit>[] = [];
const responseErrorInterceptors: ErrorInterceptor[] = [];

let tokenStore: AuthTokens | null = null;

export function setAuthTokens(tokens: AuthTokens | null) {
  tokenStore = tokens;
  if (typeof window !== 'undefined') {
    if (tokens) {
      localStorage.setItem('senti_tokens', JSON.stringify(tokens));
    } else {
      localStorage.removeItem('senti_tokens');
    }
  }
}

export function getAuthTokens(): AuthTokens | null {
  if (tokenStore) return tokenStore;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('senti_tokens');
    if (stored) {
      try {
        tokenStore = JSON.parse(stored);
        return tokenStore;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function isTokenExpired(): boolean {
  const tokens = getAuthTokens();
  if (!tokens) return true;
  return Date.now() >= tokens.expiresAt;
}

// Default interceptor: inject auth header
requestInterceptors.push((config: RequestInit): RequestInit => {
  const tokens = getAuthTokens();
  const headers = new Headers(config.headers);
  if (tokens?.accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${tokens.accessToken}`);
  }
  if (!headers.has('Content-Type') && config.body) {
    headers.set('Content-Type', 'application/json');
  }
  return { ...config, headers };
});

// Default error interceptor: normalize errors
responseErrorInterceptors.push((error: ApiError): ApiError => {
  if (typeof window !== 'undefined' && !navigator.onLine) {
    return ApiErrorClass.offline();
  }
  return error;
});

export function applyRequestInterceptors(config: RequestInit): RequestInit {
  return requestInterceptors.reduce(
    (acc, fn) => fn(acc) as RequestInit,
    config,
  );
}

export function applyErrorInterceptors(error: ApiError): ApiError {
  return responseErrorInterceptors.reduce(
    (acc, fn) => fn(acc) as ApiError,
    error,
  );
}

export function addRequestInterceptor(fn: Interceptor<RequestInit>) {
  requestInterceptors.push(fn);
}

export function addErrorInterceptor(fn: ErrorInterceptor) {
  responseErrorInterceptors.push(fn);
}
