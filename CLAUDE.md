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

## Release process

Follow these rules whenever bumping the version, writing changelogs, or merging for release.

### Version numbering

Semantic versioning, judged by user-visible impact:

- **Minor** (`1.1.x` → `1.2.0`) — a significant change or a sizeable new feature.
- **Patch** (`1.1.3` → `1.1.4`) — small improvements and bug fixes.

Bump the version in all three files together: `package.json`, `package-lock.json` (2 occurrences), `src-tauri/tauri.conf.json`.

### Changelog

Entries live in `src/i18n/locales/changelog/zh-CN.js` and `en-US.js` (newest first, keys: `added` / `optimized` / `fixed`). Both locales must stay in sync.

**Include** only what users notice: tool features, behaviour, UI/styling.

**Exclude** internal work: code refactors, architecture changes, CI/workflow changes, dependency bumps, tests.

Writing style:

- Concise and specific. Do not simply restate commit messages.
- One entry per user-facing change; do not split a single change across several entries.
- A short usage hint is welcome (how to reach the feature, what it does).
- Do not log the iteration process of developing a feature. Polishing a new feature during its own release is part of that feature's `added` entry, not a separate `optimized` entry.

Example — v1.1.3 should have been a single `added` entry: 「通用格式化：JSON/XML 片段的悬浮工具栏新增过滤功能。」

### Confirmation gate

After bumping the version and writing the changelog, **stop and ask the user to confirm or amend the entries before committing**. Only after explicit confirmation: commit, push, merge into `main`, and push `main` to trigger the release CI.

Pushing `main` runs the `publish` workflow, which builds all platforms and publishes a release for the version in `package.json`. Pushing `main` again without a version bump fails, because the release for that tag is no longer a draft. Pushes that only touch `vercel.json`, Markdown, `LICENSE` or `.github/**` are excluded from the trigger and can go to `main` at any time.
