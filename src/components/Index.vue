<template>
  <div class="w-full h-full flex">
    <n-layout has-sider>
      <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="200" :collapsed="collapsed"
        show-trigger @collapse="collapsed = true" @expand="collapsed = false">
        <div class="flex flex-col h-full">
          <div>
            <div
              class="w-full h-16 mt-2 flex items-center justify-center font-bold font-logo text-2xl text-green-600 cursor-pointer select-none"
              v-if="!collapsed">
              <router-link to="/">LoneKit</router-link>
            </div>
            <div
              class="w-full h-16 mt-2 flex items-center justify-center font-bold font-logo text-2xl text-green-600 cursor-pointer select-none"
              v-else>
              <router-link to="/">Kit</router-link>
            </div>
            <n-menu v-model:value="activeKey" :collapsed="collapsed" :collapsed-width="64" :collapsed-icon-size="22"
              @update:value="handleMenuUpdate"
              :options="menuOptions" />
          </div>
          <!-- 版本号显示 -->
          <div class="mt-auto mb-4 flex items-center justify-center">
            <div class="text-xs text-gray-500 font-mono" v-if="!collapsed">
              Version: {{ version }}
            </div>
            <div class="text-xs text-gray-500 font-mono" v-else>
              V{{ version.split('.')[0] }}.{{ version.split('.')[1] }}
            </div>
          </div>
        </div>
      </n-layout-sider>
      <div class="w-full h-full px-4 py-2 overflow-auto">
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
import { NLayout, NLayoutSider, NMenu, NIcon, NNotificationProvider } from "naive-ui";
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
import { FlagOutline } from '@vicons/ionicons5';

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

// const message = useMessage();
function getFavoriteStorageKey() {
  if (typeof window === "undefined") return "lonekit.menuFavorites.default";
  const currentUser = localStorage.getItem("lonekit.currentUser") || "default";
  return `lonekit.menuFavorites.${currentUser}`;
}
const rawMenuItems = [
  { key: "common-format-wrapper", routeName: "CommonFormatWrapper", title: "通用格式化", icon: FlashIcon },
  { key: "json-format-wrapper", routeName: "JsonFormatWrapper", title: "Json 格式化", icon: JsonIcon },
  { key: "xml-format-wrapper", routeName: "XmlFormatWrapper", title: "XML 格式化", icon: CodeIcon },
  { key: "sql-format-wrapper", routeName: "SQLFormatWrapper", title: "SQL 格式化", icon: SQLIcon },
  { key: "time-tool", routeName: "TimeTool", title: "时间处理", icon: TimeIcon },
  { key: "diff-tool", routeName: "DiffToolWrapper", title: "文本对比", icon: DiffIcon },
  { key: "folder-diff-tool", routeName: "FolderDiffToolWrapper", title: "文件夹对比", icon: FolderDiffIcon },
  { key: "text-count-tool", routeName: "TextCountTool", title: "文本计数", icon: TextCountIcon },
  { key: "uuid-tool", routeName: "UUIDTool", title: "UUID", icon: UUIDIcon },
  { key: "md5-tool", routeName: "Md5Tool", title: "Md5", icon: Md5Icon },
  { key: "base64-tool", routeName: "Base64Tool", title: "Base64", icon: Base64Icon },
  { key: "unicode-tool", routeName: "UnicodeTool", title: "Unicode", icon: StringHexIcon },
  { key: "string-hex-tool", routeName: "StringHexTool", title: "字符串16进制", icon: StringHexIcon },
  { key: "qr-code-tool", routeName: "QrCodeTool", title: "二维码生成", icon: QRCodeIcon },
  { key: "qr-code-reader-tool", routeName: "QRCodeReaderTool", title: "二维码识别", icon: QRCodeReaderIcon },
  { key: "barcode-tool", routeName: "BarcodeTool", title: "条形码生成", icon: BarcodeIcon },
  { key: "barcode-reader-tool", routeName: "BarcodeReaderTool", title: "条形码识别", icon: BarcodeReaderIcon },
  { key: "sendpay-display-tool", routeName: "SendpayDisplayWrapper", title: "Sendpay", icon: FlagOutline },
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
    console.warn("[menu] 读取收藏菜单失败", error);
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
            item.title
          ),
          h(
            "button",
            {
              type: "button",
              class: ["menu-favorite-star", { "is-favorite": isFavorite, "is-outline": !isFavorite }],
              title: isFavorite ? "取消收藏" : "收藏",
              "aria-label": isFavorite ? "取消收藏" : "收藏",
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

:deep(.menu-label-row) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

:deep(.menu-label-link) {
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
  font-weight: 700;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

:deep(.menu-favorite-star.is-outline) {
  color: transparent;
  -webkit-text-stroke: 1.2px #16a34a;
}

:deep(.menu-favorite-star.is-favorite) {
  color: #16a34a;
  -webkit-text-stroke: 0;
}

:deep(.menu-favorite-star:hover) {
  transform: scale(1.08);
}

:deep(.menu-label-row:hover .menu-favorite-star),
:deep(.menu-favorite-star.is-favorite) {
  opacity: 1;
}
</style>
