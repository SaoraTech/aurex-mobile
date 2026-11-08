import { authClient } from './authClient';
import {
  clearBearerToken,
  getCachedBearerToken,
  hydrateBearerToken,
  persistBearerToken,
} from './tokenStorage';

export class AuthError extends Error {
  readonly code: string;

  constructor(message: string, code = 'AUTH_REQUEST_FAILED') {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

type Credentials = { email: string; password: string };
type SignUpCredentials = Credentials & { name: string };

async function captureBearerToken(response: Response): Promise<void> {
  const token = response.headers.get('set-auth-token');
  if (token) await persistBearerToken(token);
}

export async function signInWithEmail(credentials: Credentials) {
  await hydrateBearerToken();
  const result = await authClient.signIn.email(credentials, {
    onSuccess: async (context) => captureBearerToken(context.response),
  });

  if (result.error) {
    throw new AuthError(result.error.message || 'Connexion impossible.', result.error.code || 'AUTH_SIGN_IN_FAILED');
  }

  if (!getCachedBearerToken()) {
    throw new AuthError('Le serveur n’a pas retourné de jeton de session.', 'AUTH_TOKEN_MISSING');
  }

  return result.data;
}

export async function signUpWithEmail(credentials: SignUpCredentials) {
  await hydrateBearerToken();
  const result = await authClient.signUp.email(credentials, {
    onSuccess: async (context) => captureBearerToken(context.response),
  });

  if (result.error) {
    throw new AuthError(result.error.message || 'Création du compte impossible.', result.error.code || 'AUTH_SIGN_UP_FAILED');
  }

  if (!getCachedBearerToken()) {
    throw new AuthError('Le serveur n’a pas retourné de jeton de session.', 'AUTH_TOKEN_MISSING');
  }

  return result.data;
}

export async function getCurrentSession() {
  await hydrateBearerToken();
  const result = await authClient.getSession();

  if (result.error) {
    throw new AuthError(result.error.message || 'Impossible de restaurer la session.', result.error.code || 'AUTH_SESSION_FAILED');
  }

  return result.data;
}

export async function signOut() {
  await hydrateBearerToken();
  try {
    const result = await authClient.signOut();
    if (result.error) {
      throw new AuthError(result.error.message || 'Déconnexion impossible.', result.error.code || 'AUTH_SIGN_OUT_FAILED');
    }
  } finally {
    // Clear the device session even if the server is temporarily unavailable.
    await clearBearerToken();
  }
}

export async function restoreBearerToken(): Promise<string | null> {
  return hydrateBearerToken();
}
