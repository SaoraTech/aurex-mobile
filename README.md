# Aurex Mobile

Official mobile client for **Aurex**, Saora's mathematics-focused AI assistant.

The application targets Android, iOS and (for development) web through Expo and React Native. It is intended to be a real client connected to the Aurex backend, not a standalone demo.

## Current stack

| Layer | Choice |
| --- | --- |
| Framework | Expo SDK 58 |
| UI runtime | React Native 0.88.1 |
| React | 19.3.0 |
| Web support | React Native Web 0.21.x |
| Entry point | `index.js` → `App.tsx` |
| UI foundation | React Native primitives, local Aurex design tokens |
| Language baseline | TypeScript strict mode |

The Expo SDK, React and React Native baseline is kept aligned with the SDK 58 compatibility table. Better Auth handles the existing backend bearer flow; Expo SecureStore and the SSE transport are installed through the SDK-aware dependency workflow. Add new native dependencies through `npx expo install` so Expo can select SDK-compatible versions.

## Getting started

1. Install a Node.js release supported by Expo SDK 58 (see the [SDK 58 documentation](https://docs.expo.dev/versions/v58.0.0/)).
2. Install dependencies:

   ```bash
   npm ci
   ```

3. Copy `.env.example` to `.env` and set the public API base URL for the environment you are using.
4. Start Expo:

   ```bash
   npm start
   ```

Useful commands:

- `npm run android` — start the Android development target.
- `npm run ios` — start the iOS development target (macOS with Xcode required).
- `npm run web` — start the web development target.
- `npm run check:deps` — verify Expo SDK package compatibility.
- `npm run doctor` — run Expo Doctor.
- `npm run export` — export Android, iOS and web bundles.
- `npm run lint` — lint the project.
- `npm run typecheck` — run strict TypeScript checks.

GitHub Actions runs the dependency alignment, SDK compatibility, Expo Doctor and cross-platform export checks for this development branch and its pull request.

For a production application, use an Expo development build and EAS Build rather than relying on Expo Go as the final runtime.

## Project principles

- Preserve Aurex's approved visual identity and mobile design system.
- Keep model/provider selection out of the user interface.
- Isolate backend communication from presentation components.
- Keep secrets out of the mobile bundle. `EXPO_PUBLIC_*` variables are public at runtime.
- Do not silently add backend providers, mathematical engines, or product behavior without an explicit architecture decision.
- Use Context7 and versioned Expo documentation before introducing framework APIs or dependencies.

## Development status

The first mobile shell, typed design tokens, Better Auth email/password flow and native SSE chat client are present. The app uses the existing backend bearer-token contract; native tokens are stored with Expo SecureStore. The first chat view supports streaming, partial output, stop and error states.

Conversation history/navigation, rich Markdown and LaTeX rendering, attachments, audio and subscriptions remain in the delivery plan.

See [docs/architecture.md](docs/architecture.md) for the client architecture, [docs/backend-contract.md](docs/backend-contract.md) for verified API contracts, and the implementation sequence.
