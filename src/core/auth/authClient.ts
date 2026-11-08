import { createAuthClient } from 'better-auth/client';
import { apiBaseUrl } from '../config/apiConfig';
import { getCachedBearerToken } from './tokenStorage';

export const authClient = createAuthClient({
  baseURL: apiBaseUrl || undefined,
  fetchOptions: {
    auth: {
      type: 'Bearer',
      token: () => getCachedBearerToken() ?? '',
    },
  },
});
