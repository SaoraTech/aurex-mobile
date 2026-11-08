import { apiUrl, isApiConfigured } from '../config/apiConfig';

export async function checkBackendReadiness(signal) {
  if (!isApiConfigured) {
    return { status: 'not-configured' };
  }

  const response = await fetch(apiUrl('/api/v1/health/ready'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Aurex API readiness check failed (${response.status}).`);
  }

  const payload = await response.json();
  if (payload?.status !== 'ready') {
    throw new Error('Aurex API did not report readiness.');
  }

  return { status: 'ready', checkedAt: new Date().toISOString() };
}
