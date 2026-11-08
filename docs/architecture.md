# Aurex Mobile — initial architecture

## Scope

The mobile application is a conversational mathematics assistant. It consumes the existing Aurex backend; it does not reimplement backend business rules, LLM orchestration, billing entitlements, or mathematical computation.

## Proposed client boundaries

- **App shell:** bootstrap, global providers, navigation and screen lifecycle.
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

## Visual direction

The approved Aurex identity is the source of truth: blue/indigo/cyan/violet palette, Inter/Geist typography, and JetBrains Mono for mathematical or code-oriented text. The mobile implementation must adapt the supplied mobile references rather than inventing a competing visual language.

## Delivery sequence

1. **Foundations:** repository hygiene, runtime compatibility, environment conventions and architecture documentation.
2. **Engineering baseline:** TypeScript/tooling setup, typed app entry and quality checks, after dependency and lockfile validation.
3. **Design system:** tokens, typography, primitives and component variants.
4. **Application shell:** navigation, safe areas, theme/provider composition and screen structure.
5. **Authentication:** integrate only after confirming backend auth contracts and secure session requirements.
6. **Chat experience:** conversation history, composer, message states, Markdown/LaTeX and streaming.
7. **Extended capabilities:** attachments, audio, subscription/account surfaces as supported by backend contracts.
8. **Validation and release:** device testing, accessibility, performance, security review and Android/iOS builds.

## Explicitly deferred

Expo Router, state-management libraries, animation/gesture packages, list virtualization, persistence libraries and UI kits are not dependencies yet. Select them only when the relevant feature is designed and their SDK 58 compatibility is checked.
