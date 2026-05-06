# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Tauri dev server (launches desktop window)
npm run build     # Build frontend with Vite
npm run tauri     # Run arbitrary Tauri CLI commands (e.g. npm run tauri build)
```

> Building the full desktop app requires a Rust toolchain. Frontend-only changes can be previewed with `npm run preview` after `npm run build`.

## Architecture

LoneKit is a **Tauri 2 + Vue 3** desktop developer-utility toolkit (version 0.9.x). It bundles 20+ tools (formatters, encoders, hashers, QR/barcode, diff, etc.) behind a single window.

### Key directories

| Path | Purpose |
|------|---------|
| `src/` | Vue 3 frontend (SFC + Composition API) |
| `src/components/tools/` | One `.vue` file per tool (e.g. `JsonFormatTool.vue`) |
| `src/components/wrapper/` | Tab-management shells that host tool components |
| `src/components/common/` | Shared UI: `SplitPanel`, `EditableTabLabel`, `UpdateDialog` |
| `src/composables/` | Reusable logic hooks |
| `src/router/` | Vue Router config — all tool routes are lazy-loaded |
| `src/utils/` | Pure utility functions (formatter, languageDetector, xmlUtil) |
| `src-tauri/` | Rust/Tauri backend (clipboard, shell, updater, OS plugins) |

### Wrapper / Tool pattern

Every tool follows a two-layer structure:

- **Tool component** (`*Tool.vue`) — business logic, input/output rendering, uses `SplitPanel` for left/right layout.
- **Wrapper component** (`*Wrapper.vue`) — provides multi-tab UI via `useTabManager()`. Wraps the tool with `<KeepAlive>` (max 10 cached tabs).

When adding a new tool, create both files and register a lazy-loaded route in `src/router/index.js`.

### Core composables

| Composable | Responsibility |
|------------|----------------|
| `useCommon()` | Notifications, clipboard (Tauri API with Web API fallback), Excel export |
| `useTabManager()` | Multi-tab state, keep-alive key management |
| `useSplitPanel()` | Resizable left/right panel state |

### UI stack

- **Naive UI** — primary component library (forms, tabs, buttons, notifications)
- **Tailwind CSS** — utility classes; global styles in `src/style.css`
- **@vicons/fluent** + **@vicons/ionicons5** — icon sets

### Build optimisation

`vite.config.js` splits output into named chunks: `naive-ui`, `lone-format`, `dayjs`, `v-code-diff`, `exceljs`, `qr-barcode`, `vue-core`, `tauri`, `vicons`, etc. Keep this split up-to-date when adding heavy dependencies.

### Clipboard & system access

Prefer `useCommon()` helpers over raw APIs. The composable already handles the Tauri ↔ Web API fallback and shows user-facing notifications on error.
