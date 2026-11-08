import { requestJson } from '../../../core/api/apiClient';
import type {
  GenerationStatus,
  SendChatMessageInput,
  SendChatMessageResult,
} from '../../../core/api/apiTypes';

export function sendChatMessage(
  input: SendChatMessageInput,
  accessToken: string,
  signal?: AbortSignal,
): Promise<SendChatMessageResult> {
  return requestJson<SendChatMessageResult>('/api/v1/chat/messages', {
    method: 'POST',
    body: input,
    accessToken,
    signal,
  });
}

export function getGenerationStatus(
  requestId: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<GenerationStatus> {
  return requestJson<GenerationStatus>(
    `/api/v1/chat/generations/${encodeURIComponent(requestId)}`,
    { accessToken, signal },
  );
}

export function cancelGeneration(
  requestId: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<{ cancelled: boolean }> {
  return requestJson<{ cancelled: boolean }>(
    `/api/v1/chat/generations/${encodeURIComponent(requestId)}/cancel`,
    { method: 'POST', accessToken, signal },
  );
}
