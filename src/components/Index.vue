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
              <div class="flex items-center justify-center gap-2 flex-wrap">
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
                <n-button
                  size="small"
                  quaternary
                  circle
                  class="theme-toggle-btn"
                  :title="t('about.title')"
                  :aria-label="t('about.title')"
                  @click="showAboutModal = true"
                >
                  <template #icon>
                    <n-icon :component="InfoIcon" />
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
    <n-modal v-model:show="showAboutModal" :mask-closable="true">
      <div class="about-modal">
        <n-tabs
          v-model:value="aboutActiveTab"
          type="line"
          animated
          justify-content="center"
          pane-class="about-tab-pane"
          @update:value="handleAboutTabUpdate"
        >
          <n-tab-pane name="about" :tab="t('about.tabs.about')">
            <section class="about-content">
              <img class="about-logo-image" :src="logoImage" :alt="t('common.appName')" />
              <div class="about-logo font-logo">LoneKit</div>
              <div class="about-version">{{ t('common.version') }} {{ version }}</div>
              <div class="about-description">
                <p>{{ t('about.description.line1') }}</p>
                <p>{{ t('about.description.line2') }}</p>
                <p>{{ t('about.description.line3') }}</p>
                <p>
                  {{ t('about.description.issuePrefix') }}
                  <a class="about-link" :href="issueUrl" @click.prevent="openExternalLink(issueUrl)">Issue</a>
                  {{ t('about.description.issueSuffix') }}
                </p>
              </div>
            </section>
          </n-tab-pane>
          <n-tab-pane name="support" :tab="t('about.tabs.support')">
            <section class="support-content" aria-label="support project">
              <div v-if="!supportAcknowledged" class="support-intro">
                <div class="support-intro-text">
                  <p>{{ t('about.support.intro.line1') }}</p>
                  <p>{{ t('about.support.intro.line2') }}</p>
                  <p>{{ t('about.support.intro.line3') }}</p>
                  <p>{{ t('about.support.intro.line4') }}</p>
                  <p>{{ t('about.support.intro.line5') }}</p>
                </div>
                <n-button type="primary" round class="support-ack-button" @click="supportAcknowledged = true">
                  {{ t('about.support.acknowledge') }}
                </n-button>
              </div>
              <div v-else class="support-methods">
                <p class="support-methods-note">{{ t('about.support.methodsNote') }}</p>
                <n-collapse accordion>
                  <n-collapse-item :title="t('about.support.methods.token.title')" name="token">
                    <p class="support-method-description">
                      {{ t('about.support.methods.token.descriptionPrefix') }}
                    </p>
                    <div class="support-token">{{ t('about.support.methods.token.emailBase64') }}</div>
                  </n-collapse-item>
                  <n-collapse-item :title="t('about.support.methods.wechat.title')" name="wechat">
                    <div class="payment-qr-card">
                      <img class="payment-qr-image" :src="wechatPayQrUrl" :alt="t('about.support.methods.wechat.title')" />
                    </div>
                  </n-collapse-item>
                  <n-collapse-item :title="t('about.support.methods.alipay.title')" name="alipay">
                    <div class="payment-qr-card">
                      <img class="payment-qr-image" :src="alipayQrUrl" :alt="t('about.support.methods.alipay.title')" />
                    </div>
                  </n-collapse-item>
                </n-collapse>
              </div>
            </section>
          </n-tab-pane>
          <n-tab-pane name="thanks" :tab="t('about.tabs.thanks')">
            <section class="thanks-content">
              <div class="thanks-section">
                <h3>{{ t('about.thanks.specialTitle') }}</h3>
                <p>{{ t('about.thanks.special.line1') }}</p>
                <p>{{ t('about.thanks.special.line2') }}</p>
                <p>{{ t('about.thanks.special.line3') }}</p>
              </div>
              <div class="thanks-section">
                <h3>{{ t('about.thanks.sponsorTitle') }}</h3>
                <p>{{ t('about.thanks.sponsor.empty') }}</p>
              </div>
            </section>
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import router from "../router";
import { computed, h, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { NLayout, NLayoutSider, NMenu, NIcon, NNotificationProvider, NButton, NModal, NTabs, NTabPane, NCollapse, NCollapseItem } from "naive-ui";
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
import logoImage from "../assets/logo.png";
import alipayQrImage from "../assets/sponsor/alipay.jpg";
import wechatPayQrImage from "../assets/sponsor/wechat_pay.jpg";
import { Flash24Filled as FlashIcon, Fingerprint24Regular as UUIDIcon, FolderOpen24Regular as FolderDiffIcon, ScanDash24Filled as QRCodeReaderIcon, BarcodeScanner24Filled as BarcodeReaderIcon, TextWordCount24Filled as TextCountIcon, DocumentTextToolbox24Regular as TextProcessIcon } from '@vicons/fluent';
import { ContrastOutline, InformationCircleOutline as InfoIcon, LogoGithub as GithubIcon, MoonOutline, SunnyOutline, FlagOutline, LanguageOutline as UnicodeMenuIcon } from '@vicons/ionicons5';
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
  { key: "text-process-tool", routeName: "TextProcessToolWrapper", titleKey: "menu.textProcess", icon: TextProcessIcon },
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
const aboutActiveTab = ref("about");
const showAboutModal = ref(false);
const supportAcknowledged = ref(false);
const version = packageJson.version;
const route = useRoute();
const { themeMode, setThemeMode } = useThemeMode();
const { localeMode, toggleLocaleMode } = useLocaleMode();
const themeModeOrder = ["light", "dark", "auto"];
const githubUrl = "https://github.com/lonisletend/LoneKit";
const issueUrl = "https://github.com/lonisletend/LoneKit/issues";
const wechatPayQrUrl = wechatPayQrImage;
const alipayQrUrl = alipayQrImage;
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

function handleAboutTabUpdate(value) {
  if (value === "support") {
    supportAcknowledged.value = false;
  }
}

async function handleGithubClick() {
  await openExternalLink(githubUrl);
}

async function openExternalLink(url) {
  try {
    const { open } = await import("@tauri-apps/plugin-shell");
    await open(url);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
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

.about-modal {
  width: min(720px, calc(100vw - 32px));
  padding: 36px 48px 44px;
  border-radius: 18px;
  background: var(--n-color);
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.22);
}

.about-content {
  min-height: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.about-logo-image {
  width: 112px;
  height: 112px;
  border-radius: 24px;
  object-fit: contain;
  filter: drop-shadow(0 16px 28px rgba(22, 163, 74, 0.22));
}

.about-logo {
  margin-top: 18px;
  color: #16a34a;
  font-size: 42px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.02em;
}

.about-version {
  margin-top: 12px;
  color: #64748b;
  font-size: 13px;
  font-family: Monaco, Consolas, 'Courier New', monospace;
}

.about-description {
  margin-top: 34px;
  color: #334155;
  font-size: 15px;
  line-height: 2.5;
}

.about-description p {
  margin: 0;
}

.about-link {
  color: #16a34a;
  font-weight: 600;
  text-decoration: none;
}

.about-link:hover {
  text-decoration: underline;
}

.support-content {
  width: min(560px, 100%);
  min-height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.support-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.support-intro-text {
  color: #334155;
  font-size: 15px;
  line-height: 2.2;
}

.support-intro-text p {
  margin: 0;
}

.support-ack-button {
  margin-top: 34px;
  min-width: 132px;
}

.support-methods {
  width: 100%;
}

.support-methods-note {
  margin: 0 0 18px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.8;
  text-align: center;
}

.support-method-description {
  margin: 0;
  color: #334155;
  font-size: 14px;
  line-height: 1.9;
}

.support-token {
  margin-top: 10px;
  font-family: Monaco, Consolas, 'Courier New', monospace;
  color: #16a34a;
  font-size: 13px;
  line-height: 1.7;
  word-break: break-all;
}

.payment-qr-card {
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #94a3b8;
  border-radius: 16px;
  color: #64748b;
  background: rgba(148, 163, 184, 0.08);
}

.payment-qr-image {
  width: min(320px, 100%);
  max-height: 360px;
  border-radius: 12px;
  object-fit: contain;
}

.thanks-content {
  width: min(580px, 100%);
  min-height: 480px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 28px;
}

.thanks-section {
  text-align: left;
}

.thanks-section h3 {
  margin: 0 0 12px;
  color: #16a34a;
  font-size: 16px;
  font-weight: 700;
}

.thanks-section p {
  margin: 0;
  color: #334155;
  font-size: 15px;
  line-height: 2;
}

:deep(.about-tab-pane) {
  display: flex;
  justify-content: center;
}

:deep(.dark) .about-modal,
:global(.dark) .about-modal {
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.5);
}

:global(.dark) .about-version {
  color: #94a3b8;
}

:global(.dark) .about-description {
  color: #cbd5e1;
}

:global(.dark) .support-intro-text,
:global(.dark) .support-methods-note,
:global(.dark) .support-method-description,
:global(.dark) .thanks-section p {
  color: #cbd5e1;
}

:global(.dark) .payment-qr-card {
  border-color: #475569;
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.08);
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
