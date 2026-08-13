/**
 * SENTI API Error Classes
 * Structured error handling for the API layer.
 */

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'OFFLINE'
  | 'UNKNOWN';

export class ApiError extends Error {
  code: ErrorCode;
  status: number;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode,
    status: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static fromStatus(status: number, message?: string): ApiError {
    const codeMap: Record<number, ErrorCode> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      429: 'RATE_LIMIT',
      500: 'SERVER_ERROR',
      502: 'SERVER_ERROR',
      503: 'SERVER_ERROR',
      504: 'TIMEOUT',
    };
    return new ApiError(
      message ?? `Request failed with status ${status}`,
      codeMap[status] ?? 'UNKNOWN',
      status,
    );
  }

  static network(): ApiError {
    return new ApiError('Network error — please check your connection', 'NETWORK_ERROR', 0);
  }

  static offline(): ApiError {
    return new ApiError('You appear to be offline', 'OFFLINE', 0);
  }
}
