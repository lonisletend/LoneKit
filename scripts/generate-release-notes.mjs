import { readFileSync } from 'node:fs';

const categoryLabels = {
  added: ['新增', 'Added'],
  optimized: ['优化', 'Optimized'],
  fixed: ['修复', 'Fixed'],
};

const tauriConfig = JSON.parse(readFileSync(new URL('../src-tauri/tauri.conf.json', import.meta.url), 'utf8'));
const version = tauriConfig.version;
const changelogVersion = `v${version}`;

const [{ default: zhChangelog }, { default: enChangelog }] = await Promise.all([
  import('../src/i18n/locales/changelog/zh-CN.js'),
  import('../src/i18n/locales/changelog/en-US.js'),
]);

const zhEntry = zhChangelog.find((entry) => entry.version === changelogVersion);
const enEntry = enChangelog.find((entry) => entry.version === changelogVersion);

if (!zhEntry || !enEntry) {
  const missingLocales = [
    !zhEntry ? 'zh-CN' : null,
    !enEntry ? 'en-US' : null,
  ].filter(Boolean).join(', ');

  throw new Error(`Missing changelog entry for ${changelogVersion}: ${missingLocales}`);
}

function renderEntry(entry, localeIndex) {
  const lines = [];

  for (const [key, labels] of Object.entries(categoryLabels)) {
    const items = entry[key];
    if (!Array.isArray(items) || items.length === 0) continue;

    lines.push(`### ${labels[localeIndex]}`);
    lines.push(...items.map((item) => `- ${item}`));
    lines.push('');
  }

  return lines.join('\n').trim();
}

const notes = [
  `## ${changelogVersion}`,
  '',
  renderEntry(zhEntry, 0),
  '',
  '---',
  '',
  renderEntry(enEntry, 1),
].join('\n').trim();

console.log(notes);
