<template>
  <n-config-provider
    :theme="naiveTheme"
    :theme-overrides="naiveThemeOverrides"
    :locale="naiveLocale"
    :date-locale="naiveDateLocale"
  >
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
import { useLocaleMode } from './composables/useLocaleMode';

const updateDialogRef = ref(null);
const { resolvedTheme, initThemeMode } = useThemeMode();
const { naiveLocale, naiveDateLocale, initLocaleMode } = useLocaleMode();

initThemeMode();
initLocaleMode();

const naiveTheme = computed(() => (resolvedTheme.value === 'dark' ? darkTheme : null));
const lightInputTheme = {
  color: '#ffffff',
  colorFocus: '#ffffff',
  colorDisabled: '#f8fafc',
  groupLabelColor: '#f8fafc',
  groupLabelBorder: '1px solid #cbd5e1',
  textColor: '#0f172a',
  placeholderColor: '#94a3b8',
  border: '1px solid #cbd5e1',
  borderHover: '1px solid #94a3b8',
  borderFocus: '1px solid #16a34a',
  boxShadowFocus: '0 0 0 1px #16a34a',
  caretColor: '#16a34a'
};
const lightSelectionTheme = {
  color: '#ffffff',
  colorActive: '#ffffff',
  colorDisabled: '#f8fafc',
  textColor: '#0f172a',
  placeholderColor: '#94a3b8',
  border: '1px solid #cbd5e1',
  borderHover: '1px solid #94a3b8',
  borderActive: '1px solid #16a34a',
  borderFocus: '1px solid #16a34a',
  boxShadowHover: 'none',
  boxShadowActive: '0 0 0 1px #16a34a',
  boxShadowFocus: '0 0 0 1px #16a34a',
  caretColor: '#16a34a'
};
const darkInputTheme = {
  color: '#18181b',
  colorFocus: '#18181b',
  colorDisabled: '#18181b',
  groupLabelColor: '#27272a',
  groupLabelBorder: '1px solid #3f3f46',
  textColor: '#e4e4e7',
  placeholderColor: '#71717a',
  border: '1px solid #3f3f46',
  borderHover: '1px solid #52525b',
  borderFocus: '1px solid #22c55e',
  boxShadowFocus: '0 0 0 1px #22c55e',
  caretColor: '#22c55e'
};
const darkSelectionTheme = {
  color: '#18181b',
  colorActive: '#18181b',
  colorDisabled: '#18181b',
  textColor: '#e4e4e7',
  placeholderColor: '#71717a',
  border: '1px solid #3f3f46',
  borderHover: '1px solid #52525b',
  borderActive: '1px solid #22c55e',
  borderFocus: '1px solid #22c55e',
  boxShadowHover: 'none',
  boxShadowActive: '0 0 0 1px #22c55e',
  boxShadowFocus: '0 0 0 1px #22c55e',
  caretColor: '#22c55e'
};
function createNaiveThemeOverrides(inputTheme, selectionTheme) {
  return {
    Input: inputTheme,
    InputNumber: {
      peers: {
        Input: inputTheme
      }
    },
    Select: {
      peers: {
        InternalSelection: selectionTheme
      }
    },
    DatePicker: {
      peers: {
        Input: inputTheme
      }
    }
  };
}

const naiveThemeOverrides = computed(() => (
  resolvedTheme.value === 'dark'
    ? createNaiveThemeOverrides(darkInputTheme, darkSelectionTheme)
    : createNaiveThemeOverrides(lightInputTheme, lightSelectionTheme)
));
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
