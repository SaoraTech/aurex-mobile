# Aurex Mobile — client architecture

## Scope

The mobile application is a conversational mathematics assistant. It consumes the existing Aurex backend; it does not reimplement backend business rules, LLM orchestration, billing entitlements, or mathematical computation.

## Current structure

```text
App.tsx
src/
  AppRoot.tsx
  components/
    ApiStatus.tsx
    BrandMark.tsx
    IconButton.tsx
  core/
    api/
      apiClient.ts
      apiTypes.ts
      authenticatedRequest.ts
      healthApi.ts
    auth/
      AuthProvider.tsx
      authApi.ts
      authClient.ts
      tokenStorage.ts
    config/
      apiConfig.ts
  features/
    auth/
      AuthScreen.tsx
    chat/
      ChatScreen.tsx
      api/
        chatApi.ts
        chatStream.ts
      components/
        Composer.tsx
        MessageBubble.tsx
        PromptCard.tsx
    system/
      useApiStatus.ts
  theme/
    tokens.ts
```

## Client boundaries

- **App shell:** application bootstrap, auth provider and screen lifecycle.
- **Design system:** semantic colors, typography, spacing, radii, reusable controls and responsive layout primitives.
- **Features:** authentication, conversation list, chat, attachments, account and subscription screens.
- **Core services:** typed API client, bearer-token session handling, runtime configuration and shared error handling.
- **Platform adapters:** secure storage, file access, audio and platform-specific behavior.

Feature UI must not call the backend directly. Screens and components should depend on feature-level hooks/use-cases, which in turn use the core API client.

## Backend integration constraints

- The API base URL is environment configuration, not a source-code constant.
- The mobile app must not contain provider API keys or backend secrets.
- Better Auth uses the backend's bearer plugin; native bearer tokens are persisted in Expo SecureStore. Web development keeps the token in memory only.
- The UI must not expose a model selector.
- The chat stream uses the backend's `delta`, `done` and `error` events. A client disconnect closes the stream and lets the backend stop generation.
- Mathematical answers are rendered with the native Enriched Markdown component and RaTeX math support; model output remains untrusted and links are restricted to HTTP(S).
- Do not simulate assistant replies or claim a request was sent when the backend is not connected.

## Visual direction

The approved Aurex identity is the source of truth: blue/indigo/cyan/violet palette, Inter/Geist typography, and JetBrains Mono for mathematical or code-oriented text. The mobile implementation adapts the mobile references through local design tokens and native components.

## Delivery sequence

1. **Repository foundations:** repository hygiene, SDK compatibility, environment conventions and architecture documentation.
2. **Engineering baseline:** strict TypeScript, ESLint, typecheck scripts and typed API contracts.
3. **Design system and shell:** tokens, reusable components, welcome state, responsive layout and accessibility.
4. **Authentication:** Better Auth email/password sign-in and registration, bearer-token persistence and session restoration.
5. **Chat experience:** streamed responses, latest-conversation restoration, message states, native Markdown/LaTeX and cancellation. Conversation list navigation remains to be completed.
6. **Extended capabilities:** attachments, audio, subscription/account surfaces as supported by backend contracts.
7. **Validation and release:** device testing, accessibility, performance, security review and Android/iOS builds.

## Explicitly deferred

Expo Router, state-management libraries, animation/gesture packages, list virtualization, persistence libraries and UI kits are not dependencies yet. Select them only when the relevant feature is designed and their SDK 58 compatibility is checked.

## Quality gates

A change is not considered complete until the Expo SDK compatibility check, ESLint, TypeScript typecheck, production dependency audit, Expo Doctor and Android/iOS/web bundle export pass in CI. A cancelled or pending workflow is not a successful validation.

## Documentation discipline

Use Context7 with the exact SDK/library version before coding against Expo, React Native, React, navigation, storage, networking or UI packages. Prefer versioned Expo SDK 58 documentation over unversioned examples.
