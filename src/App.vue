<template>
  <n-config-provider :theme="naiveTheme">
    <div class="w-full h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-neutral-950 dark:text-slate-100">
      <router-view />
      <UpdateDialog ref="updateDialogRef" />
    </div>
  </n-config-provider>
</template>
<script setup>
import { computed, ref } from 'vue';
import { NConfigProvider, darkTheme } from 'naive-ui';
import UpdateDialog from './components/common/UpdateDialog.vue';
import { useThemeMode } from './composables/useThemeMode';

const updateDialogRef = ref(null);
const { resolvedTheme, initThemeMode } = useThemeMode();

initThemeMode();

const naiveTheme = computed(() => (resolvedTheme.value === 'dark' ? darkTheme : null));
</script>

<style>
:root {
  --lk-scrollbar-thumb: #cbd5e1;
  --lk-scrollbar-thumb-hover: #94a3b8;
}

html.dark {
  --lk-scrollbar-thumb: #475569;
  --lk-scrollbar-thumb-hover: #64748b;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

/* 滚动条轨道 - 与 shadcn-vue ScrollArea 保持一致 */
::-webkit-scrollbar-track {
  background: transparent;
}

/* 滚动条滑块 - 使用灰色系，与 shadcn-vue 设计保持一致 */
::-webkit-scrollbar-thumb {
  background-color: var(--lk-scrollbar-thumb);
  border-radius: 9999px;
  border: 1px solid transparent;
  background-clip: padding-box;
}

/* 滚动条滑块悬停效果 */
::-webkit-scrollbar-thumb:hover {
  background-color: var(--lk-scrollbar-thumb-hover);
}

/* 滚动条角落 */
::-webkit-scrollbar-corner {
  background: transparent;
}
</style>