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
          <span>LoneKit</span>
        </div>
        <div class="w-full h-16 mt-2 flex items-center justify-center font-bold text-2xl text-green-600 cursor-pointer select-none"
             v-else>
          <span>LK</span>
        </div>
        <n-menu
          v-model:value="activeKey"
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
        />
      </n-layout-sider>
      <div class="w-full h-full px-4 py-2 overflow-scroll">
        <n-notification-provider>
          <router-view />
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
import { TimeOutline as TimeIcon } from "@vicons/ionicons5";
import { Braces24Filled as JsonIcon } from "@vicons/fluent";
import Md5Icon from "./icons/Md5Icon.vue";
import Base64Icon from "./icons/Base64Icon.vue";

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
]);
const activeKey = ref(null);
const collapsed = ref(false);
</script>