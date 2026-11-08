import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'aurex.auth.bearer.v1';

let cachedToken: string | null = null;
let hydration: Promise<string | null> | null = null;

export function getCachedBearerToken(): string | null {
  return cachedToken;
}

export async function hydrateBearerToken(): Promise<string | null> {
  if (!hydration) {
    hydration = (Platform.OS === 'web'
      ? Promise.resolve(null)
      : SecureStore.getItemAsync(TOKEN_KEY)
    ).then((token) => {
      cachedToken = token;
      return token;
    }).catch((error: unknown) => {
      hydration = null;
      throw error;
    });
  }

  return hydration;
}

export async function persistBearerToken(token: string): Promise<void> {
  if (Platform.OS !== 'web') {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
  cachedToken = token;
  hydration = Promise.resolve(token);
}

export async function clearBearerToken(): Promise<void> {
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
  cachedToken = null;
  hydration = Promise.resolve(null);
}
