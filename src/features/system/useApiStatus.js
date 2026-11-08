import { useEffect, useState } from 'react';
import { isApiConfigured } from '../../core/config/apiConfig';
import { checkBackendReadiness } from '../../core/api/healthApi';

export function useApiStatus() {
  const [status, setStatus] = useState(isApiConfigured ? 'checking' : 'not-configured');

  useEffect(() => {
    if (!isApiConfigured) {
      setStatus('not-configured');
      return undefined;
    }

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
