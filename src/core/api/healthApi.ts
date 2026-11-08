import { isApiConfigured } from '../config/apiConfig';
import { requestJson } from './apiClient';
import type { BackendReadiness } from './apiTypes';

export async function checkBackendReadiness(
  signal?: AbortSignal,
): Promise<BackendReadiness | { status: 'not-configured' }> {
  if (!isApiConfigured) {
    return { status: 'not-configured' };
  }

  const payload = await requestJson<BackendReadiness>('/api/v1/health/ready', { signal });
  if (payload.status !== 'ready') {
    throw new Error('Aurex API did not report readiness.');
  }

  return payload;
}
