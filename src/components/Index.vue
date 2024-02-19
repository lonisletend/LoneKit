<template>
  <div class="w-full h-full flex">
    <n-layout has-sider>
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="200"
        :collapsed="collapsed"
        show-trigger
        @collapse="collapsed = true"
        @expand="collapsed = false"
      >
        <div class="w-full h-16 mt-2 flex items-center justify-center font-bold text-2xl text-green-600 cursor-pointer select-none"
             v-if="!collapsed">
          <router-link to="/">LoneKit</router-link>
        </div>
        <div class="w-full h-16 mt-2 flex items-center justify-center font-bold text-2xl text-green-600 cursor-pointer select-none"
             v-else>
          <router-link to="/">Kit</router-link>
        </div>
        <n-menu
          v-model:value="activeKey"
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
        />
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
import {NLayout, NLayoutSider, NMenu, NIcon, NNotificationProvider} from "naive-ui";
import { TimeOutline as TimeIcon, QrCodeOutline as QRCodeIcon, BarcodeOutline as BarcodeIcon } from "@vicons/ionicons5";
import { Braces24Filled as JsonIcon, LockClosed24Regular as Md5Icon, DatabaseSearch24Regular as SQLIcon } from "@vicons/fluent";
import Base64Icon from "./icons/Base64Icon.vue";
import DiffIcon from "./icons/DiffIcon.vue";

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
  {
    label: () => h(
      RouterLink,
      {
        to: {
          name: "JsonTool",
          params: {
          }
        }
      },
      { default: () => "Json格式化" }
    ),
    key: "json-tool",
    icon: renderIcon(JsonIcon)
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
</script>
