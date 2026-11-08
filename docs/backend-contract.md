# Aurex mobile — verified backend contracts

This document records the current contracts inspected in `SaoraTech/aurex-back`. It is a client integration reference, not a replacement for the backend's OpenAPI specification.

## Base URL and health

- API base URL is configured with `EXPO_PUBLIC_AUREX_API_URL`.
- REST API prefix: `/api/v1`.
- Readiness: `GET /api/v1/health/ready` (public). A successful response reports `status: "ready"`; database failure returns HTTP 503.
- Better Auth routes are mounted under `/api/auth/*`. The backend config enables email/password authentication and the Better Auth bearer plugin.

## Authentication constraints

- Provider keys, database credentials and payment credentials stay on the backend.
- Protected REST routes require an authenticated user.
- The backend's Better Auth bearer plugin returns the session token in the `set-auth-token` response header after successful sign-in/sign-up.
- The mobile client uses Better Auth's email/password client and sends the stored token in `Authorization: Bearer <token>` for subsequent auth and REST requests.
- On Android and iOS, the token is persisted with Expo SecureStore (Android encrypted preferences / iOS Keychain). On web development, it remains memory-only; there is no claim of secure browser persistence.
- The client uses Better Auth's default `/api/auth` base path. The Expo-specific server plugin is not assumed to be enabled on the backend.

## Conversations

All routes below are under `/api/v1` and require authentication:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/conversations` | List conversations |
| POST | `/conversations` | Create a conversation |
| GET | `/conversations/:id/messages` | Load messages for an owned conversation |
| GET | `/conversations/page` | Cursor-paginated conversation list |
| GET | `/conversations/:id/messages/page` | Cursor-paginated messages |
| DELETE | `/conversations/:id` | Delete an owned conversation |

The backend also exposes rename, archive, unarchive, pin and unpin operations. Ownership is checked server-side.

## Chat message request

The authenticated streaming endpoint is:

`POST /api/v1/chat/messages/stream`

Request JSON:

```json
{
  "conversationId": "optional-existing-conversation-id",
  "content": "Question de mathématiques",
  "requestId": "client-generated-id",
  "webSearch": "off"
}
```

- `content` is required and limited to 20,000 characters.
- `conversationId` is optional; when omitted, the backend creates a conversation.
- `requestId` is optional and is used for request idempotency.
- `webSearch` accepts `off`, `on` or `auto`.
- The backend ignores any client-supplied model and selects Groq server-side. The app must not expose a model selector or send provider settings.

## Server-Sent Events

The stream uses `text/event-stream` and currently emits:

- `event: delta` — JSON data containing `{ "delta": "..." }`.
- `event: done` — JSON data containing the completed send result, including `conversationId` and `message`.
- `event: error` — JSON error payload. Use its stable `code` field, not localized message matching.

The client must handle partial output, cancellation, connection loss and duplicate request IDs. A disconnect aborts the backend generation. The backend also exposes:

- `GET /api/v1/chat/generations/:requestId`
- `POST /api/v1/chat/generations/:requestId/cancel`

## Plans and entitlements

- `GET /api/v1/plans` is public and returns plan display information.
- `GET /api/v1/entitlements/me` is authenticated and returns the current user's effective plan, subscription state and quotas.

The server is authoritative for plan, price, access and quota decisions. The mobile client must never submit authoritative entitlement values.

## Error handling

The documented JSON error envelope includes `statusCode`, `error`, stable `code`, `message`, `details` and `requestId`. Rate-limit responses may include `Retry-After`. UI logic should branch on HTTP status and stable error code, not translated message text.

## Audio

- `POST /api/v1/audio/transcriptions?languageCode=fr|en`: authenticated raw audio bytes; response includes recognized text and metadata.
- `POST /api/v1/audio/speech`: authenticated JSON body with text and optional language code; response is a binary audio stream.
- Azure Speech credentials remain server-side; there is no provider fallback.

Audio UI and platform recording/playback dependencies are deferred until their SDK 58 compatibility and permission flows are checked.
