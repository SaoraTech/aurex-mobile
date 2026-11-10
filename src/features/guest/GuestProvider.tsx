import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import EventSource from 'react-native-sse';
import { requestJson } from '../../core/api/apiClient';
import { apiUrl } from '../../core/config/apiConfig';
import type { ApiErrorEnvelope } from '../../core/api/apiTypes';

export type GuestMessage = {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

type GuestQuota = { limit: number; used: number; remaining: number };
type GuestSessionResponse = {
  sessionId: string;
  token: string;
  tokenType: 'Bearer';
  expiresAt: string;
  quota: GuestQuota;
};
type GuestSendResponse = {
  sessionId: string;
  userMessage: GuestMessage;
  message: GuestMessage & { provider?: string; model?: string | null };
  quota: GuestQuota;
  expiresAt: string;
};
type GuestImportResponse = {
  conversationId: string;
  imported: boolean;
  idempotentReplay: boolean;
  messageCount: number;
};
type GuestStatus = 'idle' | 'starting' | 'ready' | 'sending';

type GuestContextValue = {
  token: string | null;
  status: GuestStatus;
  transcript: GuestMessage[];
  quota: GuestQuota | null;
  expiresAt: string | null;
  streamingText: string;
  error: string | null;
  startSession: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;
  importToAccount: (accessToken: string) => Promise<GuestImportResponse | null>;
  revokeSession: () => Promise<void>;
  clearSession: () => void;
};

const GuestContext = createContext<GuestContextValue | null>(null);

function makeTransferId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    return (character === 'x' ? random : (random & 0x3) | 0x8).toString(16);
  });
}

function errorMessage(raw: string | null | undefined): string {
  if (!raw) return 'La connexion au mode invité a été interrompue.';
  try {
    const payload = JSON.parse(raw) as ApiErrorEnvelope;
    return Array.isArray(payload.message) ? payload.message.join(' ') : payload.message || payload.code || 'Une erreur est survenue.';
  } catch {
    return raw;
  }
}

export function GuestProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<GuestStatus>('idle');
  const [transcript, setTranscript] = useState<GuestMessage[]>([]);
  const [quota, setQuota] = useState<GuestQuota | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const transferId = useRef<string | null>(null);
  const stream = useRef<{ close: () => void } | null>(null);

  const clearSession = useCallback(() => {
    stream.current?.close();
    stream.current = null;
    transferId.current = null;
    setToken(null);
    setStatus('idle');
    setTranscript([]);
    setQuota(null);
    setExpiresAt(null);
    setStreamingText('');
    setError(null);
  }, []);

  const startSession = useCallback(async () => {
    if (token) return;
    setStatus('starting');
    setError(null);
    try {
      const session = await requestJson<GuestSessionResponse>('/api/v1/guest/sessions', { method: 'POST' });
      if (!session.token || session.tokenType !== 'Bearer') throw new Error('Le serveur n’a pas créé une session invitée valide.');
      setToken(session.token);
      setQuota(session.quota);
      setExpiresAt(session.expiresAt);
      setTranscript([]);
      setStatus('ready');
    } catch (cause) {
      setStatus('idle');
      const message = cause instanceof Error ? cause.message : 'Impossible de démarrer le mode invité.';
      setError(message);
      throw cause;
    }
  }, [token]);

  const sendMessage = useCallback((value: string) => new Promise<void>((resolve, reject) => {
    const content = value.trim();
    if (!token || !content || status === 'sending') {
      reject(new Error(!token ? 'La session invitée n’est pas active.' : 'Saisissez un message avant de l’envoyer.'));
      return;
    }

    const pendingUser: GuestMessage = { role: 'user', content, createdAt: new Date().toISOString() };
    setTranscript((current) => [...current, pendingUser]);
    setStatus('sending');
    setError(null);
    setStreamingText('');

    const source = new EventSource<'delta' | 'done' | 'error'>(
      apiUrl('/api/v1/guest/chat/messages/stream'),
      {
        method: 'POST',
        timeout: 0,
        timeoutBeforeConnection: 0,
        pollingInterval: 0,
        headers: {
          Accept: 'text/event-stream',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ content }),
      },
    );

    let settled = false;
    const close = () => {
      if (settled) return;
      settled = true;
      source.removeAllEventListeners();
      source.close();
      if (stream.current === handle) stream.current = null;
    };
    const handle = { close };
    stream.current = handle;

    source.addEventListener('delta', (event) => {
      if (settled) return;
      try {
        const payload = JSON.parse((event as { data?: string }).data ?? '{}') as { delta?: unknown };
        if (typeof payload.delta !== 'string') throw new Error('Fragment de réponse invalide.');
        setStreamingText((current) => current + payload.delta);
      } catch (cause) {
        close();
        setStatus('ready');
        const failure = cause instanceof Error ? cause : new Error('Erreur de lecture du flux.');
        setError(failure.message);
        reject(failure);
      }
    });

    source.addEventListener('done', (event) => {
      if (settled) return;
      try {
        const payload = JSON.parse((event as { data?: string }).data ?? '{}') as GuestSendResponse;
        if (!payload.userMessage?.createdAt || !payload.message?.content || !payload.message?.createdAt) {
          throw new Error('La réponse finale du serveur est incomplète.');
        }
        setTranscript((current) => [
          ...current.filter((message) => !(message.role === 'user' && message.createdAt === pendingUser.createdAt)),
          payload.userMessage,
          payload.message,
        ]);
        setQuota(payload.quota);
        setExpiresAt(payload.expiresAt);
        setStreamingText('');
        setStatus('ready');
        close();
        resolve();
      } catch (cause) {
        close();
        setStatus('ready');
        const failure = cause instanceof Error ? cause : new Error('Réponse finale invalide.');
        setError(failure.message);
        reject(failure);
      }
    });

    source.addEventListener('error', (event) => {
      if (settled) return;
      const raw = (event as { data?: string; message?: string }).data
        ?? (event as { message?: string }).message;
      close();
      setStatus('ready');
      const message = errorMessage(raw);
      setError(message);
      reject(new Error(message));
    });
  }), [token, status]);

  const stopGeneration = useCallback(() => {
    stream.current?.close();
    stream.current = null;
    setStatus('ready');
    setStreamingText('');
  }, []);

  const importToAccount = useCallback(async (accessToken: string) => {
    if (!token || transcript.length === 0) return null;
    transferId.current ??= makeTransferId();
    const result = await requestJson<GuestImportResponse>('/api/v1/guest/sessions/current/import', {
      method: 'POST',
      accessToken,
      headers: { 'X-Guest-Session-Token': token },
      body: { transferId: transferId.current, messages: transcript },
    });
    clearSession();
    return result;
  }, [token, transcript, clearSession]);

  const revokeSession = useCallback(async () => {
    const currentToken = token;
    if (!currentToken) {
      clearSession();
      return;
    }
    try {
      await requestJson('/api/v1/guest/sessions/current', { method: 'DELETE', accessToken: currentToken });
    } finally {
      clearSession();
    }
  }, [token, clearSession]);

  const value = useMemo<GuestContextValue>(() => ({
    token, status, transcript, quota, expiresAt, streamingText, error,
    startSession, sendMessage, stopGeneration, importToAccount, revokeSession, clearSession,
  }), [token, status, transcript, quota, expiresAt, streamingText, error, startSession, sendMessage, stopGeneration, importToAccount, revokeSession, clearSession]);

  return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>;
}

export function useGuestSession(): GuestContextValue {
  const context = useContext(GuestContext);
  if (!context) throw new Error('useGuestSession must be used inside GuestProvider.');
  return context;
}
