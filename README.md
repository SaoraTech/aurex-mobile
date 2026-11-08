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
| Entry point | `index.js` → `App.js` |
| UI foundation | React Native primitives, local Aurex design tokens |

The dependency versions are retained from the repository baseline. Add new native dependencies through `npx expo install` so Expo can select SDK-compatible versions.

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

For a production application, use an Expo development build and EAS Build rather than relying on Expo Go as the final runtime.

## Project principles

- Preserve Aurex's approved visual identity and mobile design system.
- Keep model/provider selection out of the user interface.
- Isolate backend communication from presentation components.
- Keep secrets out of the mobile bundle. `EXPO_PUBLIC_*` variables are public at runtime.
- Do not silently add backend providers, mathematical engines, or product behavior without an explicit architecture decision.
- Use Context7 and versioned Expo documentation before introducing framework APIs or dependencies.

## Development status

The first mobile shell and initial Aurex design tokens are now present. The welcome state and composer are presentation foundations; the composer is intentionally disabled until the deployed backend authentication and chat contracts are verified.

Authentication, navigation, live chat, streaming, mathematical rendering, attachments, audio and subscriptions are not yet implemented.

See [docs/architecture.md](docs/architecture.md) for the client architecture, [docs/backend-contract.md](docs/backend-contract.md) for verified API contracts, and the implementation sequence.
