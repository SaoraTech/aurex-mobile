import { requestJson } from '../../../core/api/apiClient';
import type {
  ChatMessage,
  ConversationRecord,
  CreateConversationInput,
} from '../../../core/api/apiTypes';

export function listConversations(
  accessToken: string,
  signal?: AbortSignal,
): Promise<ConversationRecord[]> {
  return requestJson<ConversationRecord[]>('/api/v1/conversations', {
    accessToken,
    signal,
  });
}

export function createConversation(
  input: CreateConversationInput,
  accessToken: string,
  signal?: AbortSignal,
): Promise<ConversationRecord> {
  return requestJson<ConversationRecord>('/api/v1/conversations', {
    method: 'POST',
    body: input,
    accessToken,
    signal,
  });
}

export function listConversationMessages(
  conversationId: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<ChatMessage[]> {
  return requestJson<ChatMessage[]>(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
    { accessToken, signal },
  );
}

export function deleteConversation(
  conversationId: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return requestJson(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}`,
    { method: 'DELETE', accessToken, signal },
  );
}
