import EventSource from 'react-native-sse';
import { apiUrl } from '../../../core/config/apiConfig';
import type {
  ApiErrorEnvelope,
  SendChatMessageInput,
  SendChatMessageResult,
} from '../../../core/api/apiTypes';

type ChatStreamEventName = 'delta' | 'done' | 'error';

type ChatStreamCallbacks = {
  onDelta: (delta: string) => void;
  onDone: (result: SendChatMessageResult) => void;
  onError: (error: ApiErrorEnvelope | Error) => void;
};

type EventWithData = { data?: string | null; message?: string; xhrStatus?: number };

function parseJson<T>(raw: string | null | undefined, label: string): T {
  if (!raw) throw new Error(`Événement Aurex vide : ${label}.`);
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Événement Aurex invalide : ${label}.`);
  }
}

function toError(raw: string | null | undefined): ApiErrorEnvelope | Error {
  if (!raw) return new Error('La connexion au flux Aurex a été interrompue.');
  try {
    return JSON.parse(raw) as ApiErrorEnvelope;
  } catch {
    return new Error(raw);
  }
}

export function streamChatMessage(
  input: SendChatMessageInput,
  accessToken: string,
  callbacks: ChatStreamCallbacks,
): { close: () => void } {
  const requestId = input.requestId
    ?? `mob-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  const source = new EventSource<ChatStreamEventName>(
    apiUrl('/api/v1/chat/messages/stream'),
    {
      method: 'POST',
      timeout: 0,
      timeoutBeforeConnection: 0,
      pollingInterval: 0,
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        ...input,
        requestId,
        webSearch: input.webSearch ?? 'off',
      }),
    },
  );

  let settled = false;

  const close = () => {
    if (settled) return;
    settled = true;
    source.removeAllEventListeners();
    source.close();
  };

  source.addEventListener('delta', (event) => {
    if (settled) return;
    try {
      const payload = parseJson<{ delta?: unknown }>((event as EventWithData).data, 'delta');
      if (typeof payload.delta !== 'string') {
        throw new Error('Le fragment reçu par Aurex est invalide.');
      }
      callbacks.onDelta(payload.delta);
    } catch (error) {
      close();
      callbacks.onError(error instanceof Error ? error : new Error('Erreur de lecture du flux.'));
    }
  });

  source.addEventListener('done', (event) => {
    if (settled) return;
    const raw = (event as EventWithData).data;
    if (typeof raw !== 'string' || raw.length === 0) {
      // The library also emits a built-in "done" event when the HTTP stream ends.
      // The backend's named "done" event always carries a JSON result.
      close();
      callbacks.onError(new Error('Le flux Aurex s’est terminé sans résultat final.'));
      return;
    }

    try {
      const result = parseJson<SendChatMessageResult>(raw, 'done');
      if (!result.conversationId || !result.message?.id) {
        throw new Error('La réponse finale d’Aurex est incomplète.');
      }
      close();
      callbacks.onDone(result);
    } catch (error) {
      close();
      callbacks.onError(error instanceof Error ? error : new Error('Réponse finale invalide.'));
    }
  });

  source.addEventListener('error', (event) => {
    if (settled) return;
    const typedEvent = event as EventWithData;
    const raw = typedEvent.data ?? typedEvent.message;
    close();
    callbacks.onError(toError(raw));
  });

  return { close };
}
