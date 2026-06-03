<template>
  <div class="w-full h-full overflow-hidden">
    <n-layout has-sider class="w-full h-full overflow-hidden">
      <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="siderWidth" :collapsed="collapsed"
        show-trigger @collapse="collapsed = true" @expand="collapsed = false">
        <div class="flex h-full min-h-0 flex-col overflow-hidden">
          <div
            class="w-full h-16 mt-2 flex items-center justify-center font-bold font-logo text-2xl text-green-600 cursor-pointer select-none shrink-0"
            v-if="!collapsed">
            <router-link to="/">LoneKit</router-link>
          </div>
          <div
            class="w-full h-16 mt-2 flex items-center justify-center font-bold font-logo text-2xl text-green-600 cursor-pointer select-none shrink-0"
            v-else>
            <router-link to="/">Kit</router-link>
          </div>
          <div class="min-h-0 flex-1 overflow-auto">
            <n-menu v-model:value="activeKey" :collapsed="collapsed" :collapsed-width="64" :collapsed-icon-size="22"
              @update:value="handleMenuUpdate"
              :options="menuOptions" />
          </div>
          <div class="shrink-0 mb-4 flex items-center justify-center border-t border-slate-200 dark:border-slate-800 pt-3">
            <div class="w-full px-2 flex flex-col items-center gap-2">
              <div class="flex items-center gap-2">
                <n-button size="small" quaternary circle class="theme-toggle-btn" @click="handleThemeToggleClick">
                  <template #icon>
                    <n-icon :component="currentThemeIcon" />
                  </template>
                </n-button>
                <n-button
                  size="small"
                  quaternary
                  circle
                  class="theme-toggle-btn locale-toggle-btn"
                  :title="t('common.language')"
                  :aria-label="t('common.language')"
                  @click="toggleLocaleMode"
                >
                  {{ localeButtonText }}
                </n-button>
                <n-button size="small" quaternary circle class="theme-toggle-btn" @click="handleGithubClick">
                  <template #icon>
                    <n-icon :component="GithubIcon" />
                  </template>
                </n-button>
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400 font-mono" v-if="!collapsed">
                {{ t('common.version') }}: {{ version }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400 font-mono" v-else>
                V{{ version.split('.')[0] }}.{{ version.split('.')[1] }}
              </div>
            </div>
          </div>
        </div>
      </n-layout-sider>
      <div class="w-full h-full min-h-0 px-4 py-2 overflow-auto">
        <n-notification-provider>
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </n-notification-provider>
      </div>
    </n-layout>
  </div>
</template>

<script setup>
import router from "../router";
import { computed, h, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { NLayout, NLayoutSider, NMenu, NIcon, NNotificationProvider, NButton } from "naive-ui";
import packageJson from "../../package.json";
import Base64Icon from "./icons/Base64Icon.vue";
import Md5Icon from "./icons/Md5Icon.vue";
import DiffIcon from "./icons/DiffIcon.vue";
import SQLIcon from "./icons/SQLIcon.vue";
import StringHexIcon from "./icons/StringHexIcon.vue";
import QRCodeIcon from "./icons/QRCodeIcon.vue";
import BarcodeIcon from "./icons/BarcodeIcon.vue";
import TimeIcon from "./icons/TimeIcon.vue";
import JsonIcon from "./icons/JsonIcon.vue";
import CodeIcon from "./icons/CodeIcon.vue";
import { Flash24Filled as FlashIcon, Fingerprint24Regular as UUIDIcon, FolderOpen24Regular as FolderDiffIcon, ScanDash24Filled as QRCodeReaderIcon, BarcodeScanner24Filled as BarcodeReaderIcon, TextWordCount24Filled as TextCountIcon } from '@vicons/fluent';
import { ContrastOutline, LogoGithub as GithubIcon, MoonOutline, SunnyOutline, FlagOutline, LanguageOutline as UnicodeMenuIcon } from '@vicons/ionicons5';
import { useThemeMode } from "../composables/useThemeMode";
import { useLocaleMode } from "../composables/useLocaleMode";

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const { t } = useI18n();

// const message = useMessage();
function getFavoriteStorageKey() {
  if (typeof window === "undefined") return "lonekit.menuFavorites.default";
  const currentUser = localStorage.getItem("lonekit.currentUser") || "default";
  return `lonekit.menuFavorites.${currentUser}`;
}
const rawMenuItems = [
  { key: "common-format-wrapper", routeName: "CommonFormatWrapper", titleKey: "menu.commonFormat", icon: FlashIcon },
  { key: "json-format-wrapper", routeName: "JsonFormatWrapper", titleKey: "menu.jsonFormat", icon: JsonIcon },
  { key: "xml-format-wrapper", routeName: "XmlFormatWrapper", titleKey: "menu.xmlFormat", icon: CodeIcon },
  { key: "sql-format-wrapper", routeName: "SQLFormatWrapper", titleKey: "menu.sqlFormat", icon: SQLIcon },
  { key: "time-tool", routeName: "TimeTool", titleKey: "menu.time", icon: TimeIcon },
  { key: "diff-tool", routeName: "DiffToolWrapper", titleKey: "menu.diff", icon: DiffIcon },
  { key: "folder-diff-tool", routeName: "FolderDiffToolWrapper", titleKey: "menu.folderDiff", icon: FolderDiffIcon },
  { key: "text-count-tool", routeName: "TextCountTool", titleKey: "menu.textCount", icon: TextCountIcon },
  { key: "uuid-tool", routeName: "UUIDTool", titleKey: "menu.uuid", icon: UUIDIcon },
  { key: "md5-tool", routeName: "Md5Tool", titleKey: "menu.md5", icon: Md5Icon },
  { key: "base64-tool", routeName: "Base64Tool", titleKey: "menu.base64", icon: Base64Icon },
  { key: "unicode-tool", routeName: "UnicodeTool", titleKey: "menu.unicode", icon: UnicodeMenuIcon },
  { key: "string-hex-tool", routeName: "StringHexTool", titleKey: "menu.stringHex", icon: StringHexIcon },
  { key: "qr-code-tool", routeName: "QrCodeTool", titleKey: "menu.qrCode", icon: QRCodeIcon },
  { key: "qr-code-reader-tool", routeName: "QRCodeReaderTool", titleKey: "menu.qrCodeReader", icon: QRCodeReaderIcon },
  { key: "barcode-tool", routeName: "BarcodeTool", titleKey: "menu.barcode", icon: BarcodeIcon },
  { key: "barcode-reader-tool", routeName: "BarcodeReaderTool", titleKey: "menu.barcodeReader", icon: BarcodeReaderIcon },
  { key: "sendpay-display-tool", routeName: "SendpayDisplayWrapper", titleKey: "menu.sendpay", icon: FlagOutline },
];

function readFavoriteMenuKeys() {
  if (typeof window === "undefined") return [];
  try {
    const rawValue = localStorage.getItem(getFavoriteStorageKey());
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    const validKeys = new Set(rawMenuItems.map((item) => item.key));
    const uniqueKeys = [];
    for (const key of parsed) {
      if (typeof key === "string" && validKeys.has(key) && !uniqueKeys.includes(key)) {
        uniqueKeys.push(key);
      }
    }
    return uniqueKeys;
  } catch (error) {
    console.warn(t("menu.readFavoritesFailed"), error);
    return [];
  }
}

const favoriteMenuKeys = ref(readFavoriteMenuKeys());

function saveFavoriteMenuKeys() {
  if (typeof window === "undefined") return;
  localStorage.setItem(getFavoriteStorageKey(), JSON.stringify(favoriteMenuKeys.value));
}

function toggleFavoriteMenu(key) {
  const index = favoriteMenuKeys.value.indexOf(key);
  if (index >= 0) {
    favoriteMenuKeys.value.splice(index, 1);
  } else {
    favoriteMenuKeys.value.push(key);
  }
  saveFavoriteMenuKeys();
}

const sortedMenuItems = computed(() => {
  const favoriteOrder = new Map(favoriteMenuKeys.value.map((key, index) => [key, index]));
  const favoriteSet = new Set(favoriteMenuKeys.value);

  return [...rawMenuItems].sort((a, b) => {
    const aIsFavorite = favoriteSet.has(a.key);
    const bIsFavorite = favoriteSet.has(b.key);
    if (aIsFavorite && bIsFavorite) {
      return favoriteOrder.get(a.key) - favoriteOrder.get(b.key);
    }
    if (aIsFavorite) return -1;
    if (bIsFavorite) return 1;
    return 0;
  });
});

const menuOptions = computed(() =>
  sortedMenuItems.value.map((item) => {
    const isFavorite = favoriteMenuKeys.value.includes(item.key);
    return {
      key: item.key,
      icon: renderIcon(item.icon),
      label: () =>
        h("div", { class: "menu-label-row" }, [
          h(
            "span",
            {
              class: "menu-label-link",
            },
            t(item.titleKey)
          ),
          h(
            "button",
            {
              type: "button",
              class: ["menu-favorite-star", { "is-favorite": isFavorite, "is-outline": !isFavorite }],
              title: isFavorite ? t("menu.unfavorite") : t("menu.favorite"),
              "aria-label": isFavorite ? t("menu.unfavorite") : t("menu.favorite"),
              onMousedown: (event) => {
                event.preventDefault();
                event.stopPropagation();
              },
              onClick: (event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleFavoriteMenu(item.key);
              },
            },
            "★"
          ),
        ]),
    };
  })
);
const activeKey = ref(null);
const collapsed = ref(false);
const version = packageJson.version;
const route = useRoute();
const { themeMode, setThemeMode } = useThemeMode();
const { localeMode, toggleLocaleMode } = useLocaleMode();
const themeModeOrder = ["light", "dark", "auto"];
const localeButtonText = computed(() => (localeMode.value === "zh-CN" ? "EN" : "中"));
const siderWidth = computed(() => {
  const longestLabelLength = rawMenuItems.reduce((max, item) => Math.max(max, t(item.titleKey).length), 0);
  return Math.min(260, Math.max(200, longestLabelLength * 8 + 96));
});

const currentThemeIcon = computed(() => {
  switch (themeMode.value) {
    case "light":
      return SunnyOutline;
    case "dark":
      return MoonOutline;
    default:
      return ContrastOutline;
  }
});

function handleThemeToggleClick() {
  const currentIndex = themeModeOrder.indexOf(themeMode.value);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % themeModeOrder.length : 0;
  setThemeMode(themeModeOrder[nextIndex]);
}

async function handleGithubClick() {
  const githubUrl = "https://github.com/lonisletend/LoneKit";
  try {
    const { open } = await import("@tauri-apps/plugin-shell");
    await open(githubUrl);
  } catch {
    window.open(githubUrl, "_blank", "noopener,noreferrer");
  }
}

const routeNameToMenuKey = rawMenuItems.reduce((map, item) => {
  map[item.routeName] = item.key;
  return map;
}, {
  DiffTool: "diff-tool",
});
const menuKeyToRouteName = rawMenuItems.reduce((map, item) => {
  map[item.key] = item.routeName;
  return map;
}, {});

function handleMenuUpdate(key) {
  const routeName = menuKeyToRouteName[key];
  if (routeName && route.name !== routeName) {
    router.push({ name: routeName });
  }
}

watch(
  () => route.name,
  (name) => {
    activeKey.value = routeNameToMenuKey[name] || null;
  },
  { immediate: true }
);
</script>

<style scoped>
/* Logo字体样式 - 优先使用Monaco和Consolas */
.font-logo {
  font-family: Monaco, Consolas, 'Courier New', monospace !important;
}

.theme-toggle-btn {
  width: 32px;
  height: 32px;
}

:deep(.menu-label-row) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

:deep(.menu-label-link) {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: inherit;
  text-decoration: none;
}

:deep(.menu-favorite-star) {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: #16a34a;
  cursor: pointer;
  opacity: 0;
  padding: 0;
  line-height: 1;
  font-size: 16px;
  font-weight: 400;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

:deep(.menu-favorite-star.is-outline) {
  color: transparent;
  -webkit-text-stroke: 1px #16a34a;
}

:deep(.menu-favorite-star.is-favorite) {
  color: #16a34a;
  -webkit-text-stroke: 0;
}

:deep(.menu-favorite-star:hover) {
  transform: scale(1.08);
}

:deep(.menu-favorite-star:hover),
:deep(.menu-favorite-star.is-favorite) {
  opacity: 1;
}
</style>
