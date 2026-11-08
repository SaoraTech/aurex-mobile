# Aurex Mobile — client architecture

## Scope

The mobile application is a conversational mathematics assistant. It consumes the existing Aurex backend; it does not reimplement backend business rules, LLM orchestration, billing entitlements, or mathematical computation.

## Current structure

```text
src/
  components/          Shared visual components
  features/
    chat/
      components/      Chat-specific presentation components
      ChatScreen.js    Initial chat home and application shell
  theme/
    tokens.js          Aurex color, spacing, radius and typography tokens
```

## Client boundaries

- **App shell:** application bootstrap, global providers, navigation and screen lifecycle.
- **Design system:** semantic colors, typography, spacing, radii, reusable controls and responsive layout primitives.
- **Features:** authentication, conversation list, chat, attachments, account and subscription screens.
- **Core services:** typed API client, session/token handling, configuration and shared error handling.
- **Platform adapters:** secure storage, file access, audio and platform-specific behavior.

Feature UI must not call the backend directly. Screens and components should depend on feature-level hooks/use-cases, which in turn use the core API client.

## Backend integration constraints

- The API base URL is environment configuration, not a source-code constant.
- The mobile app must not contain provider API keys or backend secrets.
- Authentication and endpoint contracts must be confirmed against the deployed Aurex backend before implementing requests.
- The UI must not expose a model selector.
- Mathematical answers must be rendered safely, including Markdown and LaTeX, without evaluating model output as code.
- Streaming, retries, cancellation and error states must be designed as explicit API-client behavior.
- Do not simulate assistant replies or claim a request was sent when the backend is not connected.

## Visual direction

The approved Aurex identity is the source of truth: blue/indigo/cyan/violet palette, Inter/Geist typography, and JetBrains Mono for mathematical or code-oriented text. The mobile implementation adapts the mobile references through local design tokens and native components.

## Delivery sequence

1. **Repository foundations:** repository hygiene, SDK compatibility, environment conventions and architecture documentation.
2. **Design system and shell:** tokens, reusable components, welcome state, responsive layout and accessibility.
3. **Engineering baseline:** TypeScript/tooling setup, typed app entry and quality checks, after lockfile generation is available.
4. **Backend contract audit:** verify authentication, chat, streaming, file and billing contracts against the deployed backend.
5. **Authentication:** secure session lifecycle and auth screens.
6. **Chat experience:** conversation history, composer, message states, Markdown/LaTeX and streaming.
7. **Extended capabilities:** attachments, audio, subscription/account surfaces as supported by backend contracts.
8. **Validation and release:** device testing, accessibility, performance, security review and Android/iOS builds.

## Explicitly deferred

Expo Router, state-management libraries, animation/gesture packages, list virtualization, persistence libraries and UI kits are not dependencies yet. Select them only when the relevant feature is designed and their SDK 58 compatibility is checked.

## Documentation discipline

Use Context7 with the exact SDK/library version before coding against Expo, React Native, React, navigation, storage, networking or UI packages. Prefer the versioned Expo SDK 58 documentation over unversioned examples.
