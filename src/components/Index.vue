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
import { h, ref } from "vue";
import { RouterLink } from "vue-router";
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

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

// const message = useMessage();
const menuOptions = ref([
  {
    label: () => h(
      RouterLink,
      {
        to: {
          name: "TimeTool",
          params: {
          }
        }
      },
      { default: () => "时间戳转换" }
    ),
    key: "time-tool",
    icon: renderIcon(TimeIcon)
  },
  // {
  //   label: () => h(
  //     RouterLink,
  //     {
  //       to: {
  //         name: "JsonTool",
  //         params: {
  //         }
  //       }
  //     },
  //     { default: () => "Json格式化" }
  //   ),
  //   key: "json-tool",
  //   icon: renderIcon(JsonIcon)
  // },
  {
    label: () => h(
      RouterLink,
      {
        to: {
          name: "JsonFormatWrapper",
          params: {
          }
        }
      },
      { default: () => "Json 格式化" }
    ),
    key: "json-format-wrapper",
    icon: renderIcon(JsonIcon)
  },
  // {
  //   label: () => h(
  //     RouterLink,
  //     {
  //       to: {
  //         name: "JsonToolWrapper",
  //         params: {
  //         }
  //       }
  //     },
  //     { default: () => "Json格式化" }
  //   ),
  //   key: "json-tool-wrapper",
  //   icon: renderIcon(JsonIcon)
  // },
  {
    label: () => h(
      RouterLink,
      {
        to: {
          name: "XmlFormatWrapper",
          params: {
          }
        }
      },
      { default: () => "XML 格式化(Beta)" }
    ),
    key: "xml-format-wrapper",
    icon: renderIcon(CodeIcon)
  },
  {
    label: () => h(
      RouterLink,
      {
        to: {
          name: "XmlToolWrapper",
          params: {
          }
        }
      },
      { default: () => "XML 格式化" }
    ),
    key: "xml-tool-wrapper",
    icon: renderIcon(CodeIcon)
  },
  {
    label: () => h(
      RouterLink,
      {
        to: {
          name: "SQLTool",
          params: {
          }
        }
      },
      { default: () => "SQL格式化" }
    ),
    key: "sql-tool",
    icon: renderIcon(SQLIcon)
  },
  {
    label: () => h(
      RouterLink,
      {
        to: {
          name: "DiffTool",
          params: {
          }
        }
      },
      { default: () => "文本对比" }
    ),
    key: "diff-tool",
    icon: renderIcon(DiffIcon)
  },
  {
    label: () => h(
      RouterLink,
      {
        to: {
          name: "Md5Tool",
          params: {
          }
        }
      },
      { default: () => "Md5 加密" }
    ),
    key: "md5-tool",
    icon: renderIcon(Md5Icon)
  },
  {
    label: () => h(
      RouterLink,
      {
        to: {
          name: "Base64Tool",
          params: {
          }
        }
      },
      { default: () => "Base64 编码/解码" }
    ),
    key: "base64-tool",
    icon: renderIcon(Base64Icon)
  },
  {
    label: () => h(
      RouterLink,
      {
        to: {
          name: "StringHexTool",
          params: {
          }
        }
      },
      { default: () => "字符串16进制" }
    ),
    key: "string-hex-tool",
    icon: renderIcon(StringHexIcon)
  },
  {
    label: () => h(
      RouterLink,
      {
        to: {
          name: "QrCodeTool",
          params: {
          }
        }
      },
      { default: () => "二维码生成器" }
    ),
    key: "qr-code-tool",
    icon: renderIcon(QRCodeIcon)
  },
  {
    label: () => h(
      RouterLink,
      {
        to: {
          name: "BarcodeTool",
          params: {
          }
        }
      },
      { default: () => "条形码生成器" }
    ),
    key: "barcode-tool",
    icon: renderIcon(BarcodeIcon)
  },

]);
const activeKey = ref(null);
const collapsed = ref(false);
const version = packageJson.version;
</script>

<style scoped>
/* Logo字体样式 - 优先使用Monaco和Consolas */
.font-logo {
  font-family: Monaco, Consolas, 'Courier New', monospace !important;
}
</style>
