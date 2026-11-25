# @parcelhub/mobile (placeholder)

This becomes the Expo (React Native) courier and customer app in **week 7**. Until then it holds framework-free UI logic (`src/tracking.ts`) so it takes part in `npm test` and the type check.

Week 7 setup:

1. Follow the Expo monorepo guide: https://docs.expo.dev/guides/monorepos/
2. Create the app in this folder with `npx create-expo-app@latest` (TypeScript template), keeping `src/tracking.ts`.
3. Check that the React version Expo requires matches `apps/web`. If it doesn't, align the versions before going further.
4. Expo uses Jest (`jest-expo`) for component tests. Keep Vitest for the pure logic in `src/`, or move it all to Jest. Either way, write the choice down in an ADR.
