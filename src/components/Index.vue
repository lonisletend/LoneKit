<template>
  <div class="w-full h-full flex">
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
    <div class="w-full h-full px-8 py-4 overflow-scroll">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import router from "../router";
import { h, ref } from "vue";
import { RouterLink } from "vue-router";
import { NLayout, NLayoutSider, NMenu, NSpace, NSwitch, NIcon } from "naive-ui";
import { TimeOutline as TimeIcon } from "@vicons/ionicons5";
import { Braces24Filled as JsonIcon } from "@vicons/fluent";

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
]);
const activeKey = ref(null);
const collapsed = ref(false);
</script>