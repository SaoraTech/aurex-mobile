export type WebSearchMode = 'off' | 'on' | 'auto';

export interface ApiErrorEnvelope {
  statusCode?: number;
  error?: string;
  code?: string;
  message?: string | string[];
  details?: Record<string, unknown>;
  requestId?: string;
}

export interface BackendReadiness {
  status: 'ready';
  dependencies?: Record<string, unknown>;
  timestamp: string;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: ChatRole;
  content: string;
  provider?: string | null;
  model?: string | null;
  latencyMs?: number | null;
  tokenCount?: number | null;
  requestId?: string | null;
  createdAt: string;
  sources?: Record<string, unknown> | null;
}

export interface SendChatMessageInput {
  conversationId?: string;
  content: string;
  requestId?: string;
  webSearch?: WebSearchMode;
}

export interface SendChatMessageResult {
  conversationId: string;
  message: ChatMessage;
  provider?: string;
  model?: string;
  webSearch?: Record<string, unknown>;
  idempotentReplay?: boolean;
}

export type ChatStreamEvent =
  | { event: 'delta'; data: { delta: string } }
  | { event: 'done'; data: SendChatMessageResult }
  | { event: 'error'; data: ApiErrorEnvelope };
