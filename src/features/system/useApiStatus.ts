import { useEffect, useState } from 'react';
import { isApiConfigured } from '../../core/config/apiConfig';
import { checkBackendReadiness } from '../../core/api/healthApi';

export type ApiStatusValue = 'checking' | 'ready' | 'unavailable' | 'not-configured';

export function useApiStatus(): ApiStatusValue {
  const [status, setStatus] = useState<ApiStatusValue>(
    isApiConfigured ? 'checking' : 'not-configured',
  );

  useEffect(() => {
    if (!isApiConfigured) return undefined;

    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 30000);

    checkBackendReadiness(controller.signal)
      .then(() => {
        if (active) setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('unavailable');
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return status;
}
