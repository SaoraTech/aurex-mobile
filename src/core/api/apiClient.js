import { apiUrl } from '../config/apiConfig';

export class ApiError extends Error {
  constructor({ status, code, message, details, requestId, retryAfter }) {
    super(message || 'Une erreur est survenue lors de la requête.');
    this.name = 'ApiError';
    this.status = status;
    this.code = code || 'API_REQUEST_FAILED';
    this.details = details ?? {};
    this.requestId = requestId ?? null;
    this.retryAfter = retryAfter ?? null;
  }
}

export async function requestJson(path, options = {}) {
  const {
    method = 'GET',
    body,
    accessToken,
    headers = {},
    signal,
  } = options;

  const requestHeaders = {
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

  const payload = await response.json().catch(() => null);

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

  return payload;
}
