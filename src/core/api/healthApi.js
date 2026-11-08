import { isApiConfigured } from '../config/apiConfig';
import { requestJson } from './apiClient';

export async function checkBackendReadiness(signal) {
  if (!isApiConfigured) {
    return { status: 'not-configured' };
  }

  const payload = await requestJson('/api/v1/health/ready', { signal });
  if (payload?.status !== 'ready') {
    throw new Error('Aurex API did not report readiness.');
  }

  return { status: 'ready', checkedAt: new Date().toISOString() };
}
