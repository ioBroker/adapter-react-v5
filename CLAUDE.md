# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@iobroker/gui-components` — a shared React component library (React 19 / MUI 9) used by ioBroker adapter UIs. Adapters consume this package to build their configuration pages with a consistent look and feel, theme system, i18n, and WebSocket connection management. It is the successor of `@iobroker/adapter-react-v5` (React 18 / MUI 6), which is kept for older systems on the `adapter-react-v5` branch.

## Commands

- **Build:** `npm run build` (cleans `build/`, generates icon sets, copies assets, patches README version, runs `tsc`)
- **TypeScript only:** `npm run build:ts` (runs `tsc -p tsconfig.build.json`)
- **Type check:** `npm run check` (runs `tsc -p tsconfig.build.json --noEmit`)
- **Lint:** `npm run lint` (ESLint with `@iobroker/eslint-config` + React config)
- **Device type check:** `npm run check-device-types` (see below)
- **Dev GUI:** `cd test-gui && npm start` (Vite dev server on port 3000, imports directly from `../../src/`)
- **Release:** `npm run release-patch`, `release-minor`, `release-major` (uses `@alcalzone/release-script`)
- **No test suite** — there are no unit tests in this project. CI runs `check`, `lint` and `check-device-types`.

## Architecture

### Core Modules (`src/`)

- **`GenericApp.tsx`** — Base class that all ioBroker adapter UIs extend. Handles socket connection lifecycle, theme initialization, Sentry error reporting, config load/save, and the save/close button bar. This is the central integration point.
- **`Connection.tsx` / `AdminConnection.tsx`** — Single-line re-exports from `@iobroker/socket-client`. The actual WebSocket logic lives in that package; these files exist so consumers import from gui-components.
- **`Components/ObjectBrowser/`** — The biggest component of the library, split into `ObjectBrowserClass.tsx` (state, subscriptions, tree, `render`), `dialogs.tsx`, `toolbar.tsx`, `renderLeaf.tsx`, `contextMenu.tsx`, `styles.ts`, `constants.tsx`, `utils.tsx` and `types.d.ts`. The extracted render functions take the component instance as first argument (`that`), therefore the members of `ObjectBrowserClass` are not `private`.
- **`Theme.tsx`** — MUI theme factory. Builds dark/light/colored themes with ioBroker-specific palette extensions (`IobTheme` type extends MUI's `Theme`).
- **`i18n.ts`** — Static `I18n` class for translation string management. Translations are loaded per-language from JSON files in `src/i18n/`.
- **`dictionary.ts`** — Aggregates all 11 language JSON files from `src/i18n/` into a single dictionary object.
- **`types.d.ts`** — Shared TypeScript types (`GenericAppProps`, `GenericAppState`, `ThemeName`, `ThemeType`, `IobTheme`, `ConnectionProps`, etc.).

### Public API (`src/index.ts`)

Single barrel export file. All components, dialogs, icons, connection classes, utilities, and types are exported from here. Some exports have deprecated aliases (e.g., `DialogConfirm` is also exported as `Confirm`).

### Module Federation

Two config files for Webpack Module Federation (ioBroker admin loads adapter UIs as micro-frontends):

- **`src/modulefederation.admin.config.ts`** — TypeScript source, compiled to `build/` by tsc.
- **`modulefederation.admin.config.js`** (root) — Hand-maintained CJS copy for consumers that can't import ESM. Must be kept in sync with the TS source manually.

### Build Pipeline (`tasks.ts`)

Node script with flag-driven steps:

- `--0-clean` — deletes `build/`
- `--2-copy` — generates base64 icon set JSONs from SVGs in `src/assets/devices/` and `src/assets/rooms/`, copies `.d.ts`, `.css`, assets, and i18n JSON files
- `--3-patchReadme` — updates the version number in README.md
- `--check-device-types` — verifies that `src/Components/DeviceType/` is in sync with the `Types` enum of `@iobroker/type-detector`: every type has an icon in `TYPE_ICONS` and a name in every language, no names are left over for removed types, and every language file is actually imported by `deviceTypeTranslations.ts`. Run in CI; exits non-zero on drift.

### Test GUI (`test-gui/`)

Vite-based app for visual development and testing of components. Imports directly from `../../src/` (not the built output), so changes are reflected immediately. Connects to a running ioBroker instance at `127.0.0.1:8081` (configured as proxy in package.json).

## i18n

Two separate translation sets:

1. **Library-level** — `src/i18n/*.json` (11 languages: en, de, ru, pt, nl, fr, it, es, pl, uk, zh-cn). Aggregated in `src/dictionary.ts`.
2. **DeviceType component** — `src/Components/DeviceType/i18n/*.json` (same 11 languages). Loaded separately via `deviceTypeTranslations.ts`. Every language file must be imported there, and the `type-*` keys must match the `Types` enum of `@iobroker/type-detector` — both are enforced by `npm run check-device-types`.

All translations are flat key-value JSON. English (`en.json`) is the source of truth.

## Key Conventions

- TypeScript with `"jsx": "react"` (not `react-jsx`). Uses `tsc` directly, no bundler.
- MUI 9 + Emotion for styling. No CSS modules or styled-components.
- Components are mostly single-file `.tsx` (not directory-per-component), except `ObjectBrowser/`, `DeviceType/`, `SimpleCron/`, and `Loaders/`.
- Icons in `src/icons/` are React components wrapping inline SVG paths — not imported SVG files.
- The `tsconfig.build.json` extends `tsconfig.json` with `strict: false` and `checkJs: false` for less restrictive production builds.
- The `package.json` `files` field controls what gets published to npm: `build/`, `i18n/`, root-level `index.css`, `modulefederation.admin.config.js/.d.ts`.
