import { requestJson } from './apiClient';
import { getCachedBearerToken, hydrateBearerToken } from '../auth/tokenStorage';

export class AuthenticationRequiredError extends Error {
  constructor() {
    super('Une session Aurex est nécessaire pour effectuer cette action.');
    this.name = 'AuthenticationRequiredError';
  }
}

type AuthenticatedRequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function authenticatedRequestJson<TResponse = unknown>(
  path: string,
  options: AuthenticatedRequestOptions = {},
): Promise<TResponse> {
  await hydrateBearerToken();
  const accessToken = getCachedBearerToken();

  if (!accessToken) throw new AuthenticationRequiredError();

  return requestJson<TResponse>(path, { ...options, accessToken });
}
