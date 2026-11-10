const configuredBaseUrl =
  process.env.EXPO_PUBLIC_API_URL
  || process.env.EXPO_PUBLIC_AUREX_API_URL
  || 'https://aurex-back.onrender.com';

export const apiBaseUrl = configuredBaseUrl.trim().replace(/\\/+$/, '');

export const isApiConfigured = apiBaseUrl.length > 0;

export function apiUrl(path: string): string {
  if (!isApiConfigured) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}
