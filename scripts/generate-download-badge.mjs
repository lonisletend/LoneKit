import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// 只统计用户真正下载的安装包。
// 排除：latest.json（更新器与服务器脚本轮询，占总量七成以上）、
//      .sig 签名、dist-v*.tar.gz 前端产物、自动更新产物（.app.tar.gz / .nsis.zip / .msi.zip / .AppImage.tar.gz）。
const INSTALLER_PATTERN = /\.(dmg|exe|msi|deb|rpm|AppImage)$/;

const repository = process.env.GITHUB_REPOSITORY ?? 'lonisletend/LoneKit';
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

let total = 0;
for (let page = 1; ; page += 1) {
  const response = await fetch(
    `https://api.github.com/repos/${repository}/releases?per_page=100&page=${page}`,
    { headers },
  );

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }

  const releases = await response.json();
  if (releases.length === 0) break;

  for (const release of releases) {
    for (const asset of release.assets ?? []) {
      if (INSTALLER_PATTERN.test(asset.name)) {
        total += asset.download_count;
      }
    }
  }

  if (releases.length < 100) break;
}

const message = total >= 10000 ? `${(total / 1000).toFixed(1)}k` : String(total);
const badge = {
  schemaVersion: 1,
  label: 'downloads',
  message,
  color: 'blue',
};

const outputPath = fileURLToPath(new URL('../docs/badges/downloads.json', import.meta.url));
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(badge, null, 2)}\n`);

console.log(`installer downloads: ${total} -> ${outputPath}`);
