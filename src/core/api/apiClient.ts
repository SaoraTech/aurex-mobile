import { apiUrl } from '../config/apiConfig';
import type { ApiErrorEnvelope } from './apiTypes';

interface ApiErrorOptions extends ApiErrorEnvelope {
  status: number;
  retryAfter?: string | null;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  accessToken?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown>;
  readonly requestId: string | null;
  readonly retryAfter: string | null;

  constructor(options: ApiErrorOptions) {
    const message = Array.isArray(options.message)
      ? options.message.join(' ')
      : options.message;
    super(message || 'Une erreur est survenue lors de la requête.');
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code || 'API_REQUEST_FAILED';
    this.details = options.details ?? {};
    this.requestId = options.requestId ?? null;
    this.retryAfter = options.retryAfter ?? null;
  }
}

export async function requestJson<TResponse = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const {
    method = 'GET',
    body,
    accessToken,
    headers = {},
    signal,
  } = options;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(apiUrl(path), {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const payload: ApiErrorEnvelope | null = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      code: payload?.code,
      message: payload?.message,
      details: payload?.details,
      requestId: payload?.requestId,
      retryAfter: response.headers.get('Retry-After'),
    });
  }

  return payload as TResponse;
}
