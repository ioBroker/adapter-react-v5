# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@iobroker/adapter-react-v5` — a shared React component library used by ioBroker adapter UIs. Adapters consume this package to build their configuration pages with a consistent look and feel, theme system, i18n, and WebSocket connection management.

## Commands

- **Build:** `npm run build` (cleans `build/`, generates icon sets, copies assets, patches README version, runs `tsc`)
- **TypeScript only:** `npm run build:ts` (runs `tsc -p tsconfig.build.json`)
- **Lint:** `npm run lint` (ESLint with `@iobroker/eslint-config` + React config)
- **Release:** `npm run release-patch`, `release-minor`, `release-major` (uses `@alcalzone/release-script`)
- **No test suite** — there are no unit tests in this project.

## Architecture

### Core Modules (`src/`)

- **`GenericApp.tsx`** — Base class that all ioBroker adapter UIs extend. Handles socket connection lifecycle, theme initialization, Sentry error reporting, config load/save, and the save/close button bar. This is the central integration point.
- **`Connection.tsx` / `AdminConnection.tsx`** — Re-exports from `@iobroker/socket-client`. The actual WebSocket logic lives in that package; these files exist so consumers import from adapter-react-v5.
- **`LegacyConnection.tsx`** — Older connection class kept for backward compatibility with adapters not yet migrated to socket-client.
- **`Theme.tsx`** — MUI theme factory. Builds dark/light/colored themes with ioBroker-specific palette extensions (`IobTheme` type extends MUI's `Theme`).
- **`i18n.ts`** — Static `I18n` class for translation string management. Translations are loaded per-language from JSON files in `src/i18n/`.
- **`dictionary.ts`** — Aggregates all 11 language JSON files from `src/i18n/` into a single dictionary object.
- **`types.d.ts`** — Shared TypeScript types (`GenericAppProps`, `GenericAppState`, `ThemeName`, `ThemeType`, `IobTheme`, `ConnectionProps`, etc.).

### Public API (`src/index.ts`)

Single barrel export file. All components, dialogs, icons, connection classes, utilities, and types are exported from here. Some exports have deprecated aliases (e.g., `DialogConfirm` is also exported as `Confirm`).

### Module Federation (`modulefederation.admin.config.ts`)

`moduleFederationShared()` generates the shared module config for Webpack Module Federation. ioBroker admin loads adapter UIs as micro-frontends — this function ensures React, MUI, and other key packages are shared as singletons.

### Build Pipeline (`tasks.js`)

Node script with flag-driven steps:
- `--0-clean` — deletes `build/`
- `--2-copy` — generates base64 icon set JSONs from SVGs in `src/assets/devices/` and `src/assets/rooms/`, copies `.d.ts`, `.css`, assets, and i18n JSON files
- `--3-patchReadme` — updates the version number in README.md

## i18n

Two separate translation sets:
1. **Library-level** — `src/i18n/*.json` (11 languages: en, de, ru, pt, nl, fr, it, es, pl, uk, zh-cn). Aggregated in `src/dictionary.ts`.
2. **DeviceType component** — `src/Components/DeviceType/i18n/*.json` (same 11 languages). Loaded separately via `deviceTypeTranslations.ts`.

All translations are flat key-value JSON. English (`en.json`) is the source of truth.

## Key Conventions

- TypeScript with `"jsx": "react"` (not `react-jsx`). Uses `tsc` directly, no bundler.
- MUI 6 + Emotion for styling. No CSS modules or styled-components.
- Components are mostly single-file `.tsx` (not directory-per-component), except `DeviceType/`, `SimpleCron/`, and `Loaders/`.
- Icons in `src/icons/` are React components wrapping inline SVG paths — not imported SVG files.
- The `tsconfig.build.json` extends `tsconfig.json` with `strict: false` and `checkJs: false` for less restrictive production builds.
