# LoneKit

Desktop developer toolkit built with Tauri 2 + Vue 3.

[中文](README.md) | [Live Demo](https://kit.lonestack.com)

## Overview

LoneKit brings together a range of commonly used features, including text formatting, encoding and decoding, QR codes and barcodes, text comparison, and date and time handling. Its aim is to consolidate frequently used tools into a lightweight, user-friendly desktop application. With the right set of tools, you can save five minutes a day.

- Current version: `0.9.11`
- Stack: `Tauri 2`, `Vue 3`, `Vite`, `Naive UI`, `Tailwind CSS`
- Runtime: cross-platform desktop app (web frontend + Tauri/Rust shell)

## Features

Tools currently available in routes:

- Common Formatter (mixed PlainText / JSON / XML segment formatting)
- JSON Formatter
- XML Formatter
- SQL Formatter
- Time Tools
- Text Diff
- Folder Diff
- Text Counter
- Text Process (local scripts chaining atomic text operations)
- UUID Generator/Parser
- MD5
- Base64
- String Hex Converter
- QR Code Generator
- QR Code Reader
- Barcode Generator
- Barcode Reader
- Sendpay Viewer and Interpreter

## Quick Start

### 1. Requirements

- Node.js 18+
- npm 9+
- Rust toolchain (required only for Tauri desktop run/build)

### 2. Install

```bash
npm install
```

### 3. Development

Frontend only:

```bash
npm run dev
```

Tauri desktop development mode:

```bash
npm run tauri dev
```

### 4. Build

Build frontend assets:

```bash
npm run build
```

Preview built frontend:

```bash
npm run preview
```

Build desktop installers (Rust toolchain required):

```bash
npm run tauri build
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build frontend assets |
| `npm run preview` | Preview built frontend |
| `npm run tauri <args>` | Pass through Tauri CLI args (e.g. `npm run tauri dev`) |

## Project Structure

```text
.
├─ src/                     # Vue frontend
│  ├─ components/
│  │  ├─ tools/             # Tool components (business logic)
│  │  └─ wrapper/           # Multi-tab wrappers
│  ├─ composables/          # Shared hooks (useCommon/useTabManager/useSplitPanel)
│  ├─ router/               # Route config (lazy-loaded)
│  └─ utils/                # Pure utilities
├─ src-tauri/               # Tauri/Rust backend and packaging config
└─ lonekit-0.9.3/           # Example built output (static assets)
```

## Development Notes

- For new tools, follow the Tool + Wrapper pattern.
- Reuse existing composables for system capabilities (clipboard, shell, updater, etc.).
- If you add heavy dependencies, review chunk split strategy in `vite.config.js`.
