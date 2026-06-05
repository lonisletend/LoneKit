export default [
  {
    date: '2026.06.05',
    version: 'v0.9.10',
    optimized: [
      'Optimized frontend chunk splitting to reduce large dependencies preloaded on the first screen and improve home page startup speed.',
      'Changed locale messages to load on demand: only the current locale is loaded at startup, and the target locale loads when switching languages.',
      'Preloaded high-frequency tools such as Common/JSON/XML formatters after the home page is ready and the browser is idle, reducing first-open latency.',
      'Cleaned up tool dependency loading boundaries: the barcode component now loads locally, while the Excel export dependency remains loaded only when exporting.',
    ],
  },
  {
    date: '2026.06.04',
    version: 'v0.9.9',
    added: [
      'Added Text Process Tool with a side-by-side input/output layout and local scripts that chain atomic text operations.',
      'Text processing scripts now support whole-text, line-level, and join/split operation groups, including prefixes/suffixes, line numbering, empty-line removal, line sorting, line deduplication, line joining, delimiter splitting, and space compression.',
      'Text processing script settings now support local saving, multi-operation pipelines, two-level cascader operation selection, per-script collapse/expand, and collapse all/expand all.',
    ],
  },
  {
    date: '2026.06.03',
    version: 'v0.9.8',
    added: [
      'Added bilingual i18n support, allowing interface text and changelog entries to switch between Chinese and English.',
      'Localized tool example data so Chinese and English environments show matching examples.',
    ],
    optimized: [
      'Added surface theme variables and Naive UI overrides to unify component visuals in light/dark mode.',
      'Improved responsive i18n layout behavior for narrow screens and longer translated copy.',
    ],
  },
  {
    date: '2026.06.02',
    version: 'v0.9.7',
    added: [
      'Added dark mode support with light/dark/auto switching.',
      'Added a dialect selector to SQL Formatter, supporting BigQuery, ClickHouse, MySQL, PostgreSQL, SQLite, Snowflake, and more, with the last selection remembered.',
      'Added "Send to Text Diff" to Universal Formatter, allowing full formatted content to be sent to the Text Diff tool in one click.',
      'Added time interval and time shift calculations to Time Tools.',
    ],
    optimized: [
      'Timestamp conversion now supports more common input formats, including slash/dot-separated dates, compact numeric datetimes, ISO datetimes, seconds/milliseconds timestamps, and rotating examples.',
      'UUID Tool now generates UUIDs automatically with the default configuration when opened, reducing first-use steps.',
      'Improved light/dark mode details for QR Code Reader, Barcode Reader, Folder Diff, and other tools.',
      'Unified borders, radius, backgrounds, and focus styles for inputs, selectors, result areas, and placeholders in light/dark mode.',
      'Improved Text Diff result area height adaptation and changed side-by-side/line-by-line switching to icon buttons.',
      'Improved alignment for interval/shift inputs in Time Tools and added clipboard reading to timestamp conversion.',
      'Upgraded lone-format to 0.16.0 to follow formatter component capabilities.',
    ],
    fixed: [
      'Fixed excessive top spacing in QR Code and Barcode recognition result areas.',
      'Fixed edge cases when clearing seconds/milliseconds timestamp inputs in timestamp conversion.',
    ],
  },
  {
    date: '2026.06.01',
    version: 'v0.9.6',
    added: [
      'Added sidebar menu favorites with pinned favorites and local storage, so common tools can be ordered by personal preference.',
      'Added cross-tool data transfer. JSON/XML formatted results can be sent to Text Diff in one click.',
    ],
  },
  {
    date: '2026.05.21',
    version: 'v0.9.5',
    fixed: [
      'Upgraded lone-format to 0.13.0, improving SQL formatting display and fixing keyword recognition plus collapse/expand issues.',
    ],
  },
  {
    date: '2026.05.17',
    version: 'v0.9.4',
    added: [
      'Added Unicode Tool with Unicode encode/decode, batch input, clipboard reading, and per-item actions.',
      'Added shortcut support to MD5, Base64, Unicode, and String Hex tools: press Ctrl/Cmd + Enter in non-batch mode to jump to the next input.',
    ],
    optimized: [
      'Standardized tool route URLs with shorter names while keeping legacy route aliases compatible.',
    ],
  },
  {
    date: '2026.05.07',
    version: 'v0.9.3',
    fixed: [
      'Fixed XML fragment recognition errors in Universal Formatter for nested tags with the same name. The parser was upgraded from regex matching to a depth-tracking algorithm.',
      'Fixed sendpayMap display editing in Sendpay Tool.',
      'Upgraded lone-format to 0.12.1 to fix XML formatting issues with sibling tags that share names and self-closing tags.',
    ],
  },
  {
    date: '2026.04.28',
    version: 'v0.9.2',
    added: [
      'Added sendpayMap parsing support to Sendpay Tool, allowing sendpay and sendpayMap to be entered together for combined explanation matching.',
      'Added "All Explanations" mode to the Sendpay explanation area, with unmatched items highlighted in red and expandable for inspection.',
      'Added expand all/collapse all support to Sendpay explanations, and automatic line breaks for \\n in explanation text.',
      'Added fixed-title profile support for Sendpay explanation configs for easier reuse.',
    ],
  },
  {
    date: '2026.04.21',
    version: 'v0.9.1',
    optimized: [
      'Improved Sendpay editing experience and added same-position match comparison display.',
      'Optimized packaging configuration to greatly reduce JS bundle size and improve startup performance.',
    ],
  },
  {
    date: '2026.04.21',
    version: 'v0.9.0',
    releaseLink: 'https://github.com/lonisletend/LoneKit/releases/tag/app-v0.9.0',
    added: [
      'Added Barcode Reader, supporting upload, paste, drag-and-drop image recognition for multiple barcode formats, with recognized format tags.',
      'Added a format selector to Barcode Generator, supporting 9 formats: CODE128, CODE39, EAN13, EAN8, UPC, ITF14, MSI, Pharmacode, and Codabar.',
      'Added Sendpay Display Tool with display, editing, and explanation config matching support.',
    ],
    optimized: [
      'Replaced sidebar icons for QR Code Reader, Barcode Reader, and Text Count with Fluent icons for a unified visual style.',
      'Moved QR Code Reader and Barcode Reader action buttons from the top right to the bottom right for better interaction consistency.',
    ],
  },
  {
    date: '2026.04.15',
    version: 'v0.8.2',
    added: [
      'Result lists in Barcode Generator and QR Code Generator now support copying individual images to the clipboard.',
      'Added Excel export to Barcode Generator and QR Code Generator, exporting text and corresponding images into an Excel file.',
    ],
  },
  {
    date: '2026.04.02',
    version: 'v0.8.1',
    added: [
      'Timestamp conversion was upgraded to multi-tab mode, supporting multiple time tasks side by side.',
      'Added Time Interval and Time Shift modules to Time Tools, supporting start/end time differences, directional shifts, and one-click copy.',
    ],
  },
  {
    date: '2026.03.25',
    version: 'v0.8.0',
    added: [
      'Refactored QR Code Generator and Barcode Generator into a multi-input card layout, with automatic blank item appending, per-item deletion, synchronized horizontal scrolling, and adaptive sizing.',
      'Refactored MD5, Base64, and String Hex tools into a unified two-column card layout with per-item action buttons and batch copy.',
    ],
    optimized: [
      'Unified interaction style and visual details across multiple tools, reducing duplicated code and improving maintainability.',
    ],
    fixed: [
      'Fixed sidebar route activation so menu highlighting stays aligned with the current route during page switches and direct tool page visits.',
    ],
  },
  {
    date: '2026.03.24',
    version: 'v0.7.3',
    added: [
      'Added Text Count Tool, supporting character, word, line, paragraph, UTF-8 byte count, and reading time statistics.',
    ],
  },
  {
    date: '2026.03.23',
    version: 'v0.7.2',
    added: [
      'Added Folder Diff Tool, supporting side-by-side directory trees, diff status markers, and file content diff preview.',
    ],
  },
  {
    date: '2026.03.10',
    version: 'v0.7.1',
    added: [
      'Added UUID Tool with v4 generation and parsing.',
    ],
  },
  {
    date: '2026.01.25',
    version: 'v0.7.0',
    releaseLink: 'https://github.com/lonisletend/LoneKit/releases/tag/app-v0.7.0',
    added: [
      'Added collapse all and expand all to the render area of Universal Formatter. JSON/XML blocks support sorting.',
      'Added sorting to XML Formatter.',
      'Upgraded Tauri to v2, added Apple Silicon packaging support, RPM packaging support, version checks, and automatic updates.',
    ],
    optimized: [
      'Improved several style details and upgraded dependencies.',
    ],
  },
  {
    date: '2026.01.21',
    version: 'v0.6.3',
    optimized: [
      'Improved display font and styles in Universal Formatter.',
      'Improved diff display font and styles in Text Diff. Added side-by-side/line-by-line comparison modes.',
    ],
  },
  {
    date: '2026.01.20',
    version: 'v0.6.2',
    added: [
      'Added Universal Formatter, supporting segmented formatting for text containing PlainText/JSON/XML.',
    ],
    optimized: [
      'Improved display style details across multiple tools and updated dependencies.',
    ],
  },
  {
    date: '2026.01.18',
    version: 'v0.6.1',
    added: [
      'SQL Formatter now supports highlighting and folding.',
    ],
    optimized: [
      'Removed deprecated implementation and reduced dependencies.',
    ],
  },
  {
    date: '2026.01.14',
    version: 'v0.6.0',
    added: [
      'Added QR Code Reader, supporting image drag-and-drop, click upload, clipboard reading, history list, and automatic URL rendering.',
    ]
  },
  {
    date: '2026.01.14',
    version: 'v0.5.2',
    fixed: [
      'Fixed page content loss after editing tab titles on multi-tab pages.',
    ],
  },
  {
    date: '2026.01.05',
    version: 'v0.5.1',
    added: [
      'All multi-tab pages now support double-click editing of tab titles.',
    ],
  },
  {
    date: '2025.12.19',
    version: 'v0.5.0',
    added: [
      'JSON Formatter and XML Formatter now support collapse all/expand all.',
      'SQL Formatter (Beta).',
    ],
    optimized: [
      'The resize divider in all split-pane tools now supports double-click reset to a 1:1 layout.',
    ],
    fixed: [
      'Fixed XML Formatter incorrectly treating CDATA content as invalid entity references.',
    ],
  },
  {
    date: '2025.12.10',
    version: 'v0.4.3',
    fixed: [
      'Fixed XML Formatter defaulting empty content to self-closing tags while preserving original format.',
      'Fixed entity reference validation errors in XML Formatter.',
    ],
  },
  {
    date: '2025.12.07',
    version: 'v0.4.2',
    added: [
      'JSON Formatter now supports sorting formatted result keys.',
      'XML Formatter now supports XPath filtering.',
    ],
  },
  {
    date: '2025.12.05',
    version: 'v0.4.1',
    optimized: [
      'Changed JavaScript filtering in JSON Formatter so $ refers to current data, aligning with JsonPath.',
    ],
    fixed: [
      'Fixed decimal protection matching errors in JavaScript filtering for JSON Formatter.',
    ],
  },
  {
    date: '2025.12.03',
    version: 'v0.4.0',
    optimized: [
      'Improved editing styles in JSON Formatter.',
    ],
    added: [
      'XML Formatter (Beta) graduated to stable, with editing support, alignment lines, and improved display.',
    ],
  },
  {
    date: '2025.11.19',
    version: 'v0.3.6',
    optimized: [
      'Improved collapse hints for JSON Formatter and XML Formatter (Beta).',
    ],
    fixed: [
      'Fixed formatting errors after editing and saving large numeric strings in JSON Formatter.',
    ],
  },
  {
    date: '2025.11.16',
    version: 'v0.3.5',
    optimized: [
      'DiffTool and SQLTool now support multi-tab mode.',
      'All split-pane tools now support draggable width adjustment, with the divider hidden by default and shown on hover.',
      'JSON Formatter and XML Formatter render result areas now scroll properly.',
    ],
  },
  {
    date: '2025.11.03',
    version: 'v0.3.0',
    added: [
      'XML Formatter (Beta), implemented with lone-format and supporting node collapse/expand.',
    ],
    optimized: [
      'JSON Formatter Beta graduated to stable.',
    ],
  },
  {
    date: '2025.08.05',
    version: 'v0.1.4',
    added: [],
    optimized: [
      'Improved line wrapping, comma display, and long-number display for JSON Formatter (Beta).',
      'JSON Formatter now supports JsonPath and JavaScript filtering.',
    ],
  },
  {
    date: '2025.08.05',
    version: 'v0.1.2',
    added: [
      'JSON Formatter (Beta), using lone-format component, with large-number and editing support.',
    ],
  },
  {
    date: '2025.04.01',
    version: 'v0.1.0',
    added: [
      'XML Formatter.',
    ],
    removed: [
      'Universal Formatter, removed due to excessive dependencies and poor performance.',
    ]
  },
  {
    date: '2025.02.23',
    version: 'v0.0.9',
    added: [
      'Universal Formatter with XML and Java formatting support.',
    ],
  },
  {
    date: '2024.10.10',
    version: 'v0.0.8',
    optimized: [
      'JSON Formatter (Wrap mode) now supports tabs, so multiple browser tabs are no longer needed.',
    ],
  },
  {
    date: '2024.06.09',
    version: 'v0.0.7',
    added: [
      'String Hex conversion.',
    ],
  },
  {
    date: '2024.02.20',
    version: 'v0.0.6',
    added: [
      'SQL Formatter.',
      'Text Diff.',
    ],
  },
  {
    date: '2024.01.04',
    version: 'v0.0.5',
    added: [
      'Timestamp conversion.',
      'JSON Formatter.',
      'Base64 encode/decode.',
      'MD5 encryption.',
      'QR Code Generator.',
      'Barcode Generator.',
    ],
  },
  {
    date: '2023.12.10',
    version: 'v0.0.1',
    added: [
      'Project initialization.',
    ],
  }
];
