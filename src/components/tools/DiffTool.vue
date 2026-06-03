<script setup>

import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NButtonGroup, NIcon, NInput } from "naive-ui";
import SplitPanel from '../common/SplitPanel.vue';
import { CodeDiff } from 'v-code-diff'
import { useThemeMode } from "../../composables/useThemeMode";
import { SplitHorizontal12Regular, SplitVertical12Regular } from '@vicons/fluent';

defineOptions({
  name: 'DiffTool'
});

const props = defineProps({
  id: { type: Number, default: 0 },
  // 由数据传输机制注入的初始数据，格式：{ left: string, right: string }
  initialData: { type: Object, default: null }
});

const source = ref();
const target = ref();
const panel = ref('source');
const outputFormat = ref('side-by-side');
const { resolvedTheme } = useThemeMode();
const { t } = useI18n();
const diffTheme = computed(() => (resolvedTheme.value === 'dark' ? 'dark' : 'light'));

onMounted(() => {
  if (props.initialData?.left) source.value = props.initialData.left
  if (props.initialData?.right) target.value = props.initialData.right
});

function showExample() {
}

function clear() {
  source.value = '';
  target.value = '';
}

</script>

<template>
  <div class="w-full h-full min-h-0 flex flex-col p-2"  v-show="panel === 'source'">
    <div class="w-full h-8 shrink-0 flex items-center space-x-4">
      <n-button-group>
        <n-button secondary type="primary">
          {{ t('tool.diff.sourceText') }}
        </n-button>
        <n-button ghost @click="() => panel = 'result'">
          {{ t('tool.diff.result') }}
        </n-button>
      </n-button-group>
    </div>
    <div class="w-full flex-1 min-h-0 text-xl">
      <SplitPanel>
        <template #left>
          <div class="h-full py-2 flex flex-col space-y-2">
            <div class="w-full h-full text-xl">
              <n-input v-model:value="source" type="textarea" class="w-full h-full"
                       :placeholder="t('tool.diff.sourceText')"/>
            </div>
          </div>
        </template>
        <template #right>
          <div class="h-full py-2 flex flex-col space-y-2">
            <div class="w-full h-full text-xl">
              <n-input v-model:value="target" type="textarea" class="w-full h-full"
                       :placeholder="t('tool.diff.targetText')"/>
            </div>
          </div>
        </template>
      </SplitPanel>
    </div>
  </div>

  <div class="w-full h-full min-h-0 flex flex-col p-2" v-show="panel === 'result'">
    <div class="w-full h-8 shrink-0 flex items-center space-x-4">
      <n-button-group>
        <n-button ghost @click="() => panel = 'source'">
          {{ t('tool.diff.sourceText') }}
        </n-button>
        <n-button secondary type="primary">
          {{ t('tool.diff.result') }}
        </n-button>
      </n-button-group>
      <n-button-group>
        <n-button
          :secondary="outputFormat === 'side-by-side'"
          :ghost="outputFormat !== 'side-by-side'"
          :type="outputFormat === 'side-by-side' ? 'primary' : 'default'"
          :title="t('tool.diff.sideBySide')"
          :aria-label="t('tool.diff.sideBySide')"
          @click="() => outputFormat = 'side-by-side'"
        >
          <template #icon>
            <n-icon :component="SplitVertical12Regular" />
          </template>
        </n-button>
        <n-button
          :secondary="outputFormat === 'line-by-line'"
          :ghost="outputFormat !== 'line-by-line'"
          :type="outputFormat === 'line-by-line' ? 'primary' : 'default'"
          :title="t('tool.diff.lineByLine')"
          :aria-label="t('tool.diff.lineByLine')"
          @click="() => outputFormat = 'line-by-line'"
        >
          <template #icon>
            <n-icon :component="SplitHorizontal12Regular" />
          </template>
        </n-button>
      </n-button-group>
    </div>
    <div class="w-full flex-1 min-h-0 text-xl flex space-x-4 custom-diff-area">
      <CodeDiff
          :old-string="source"
          :new-string="target"
          :output-format="outputFormat"
          :theme="diffTheme"
      />
    </div>
  </div>
</template>

<style scoped>
/* Diff 对比结果展示区域字体优化 - 覆盖 v-code-diff 组件自带样式 */
.custom-diff-area :deep(.blob-code-inner),
.custom-diff-area :deep(.file-header) {
  font-family: Monaco, Consolas, 'Courier New', monospace !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
}

.custom-diff-area :deep(.file-header) {
  background-color: var(--color-canvas-default) !important;
}

/* 确保 CodeDiff 组件占满全宽 */
.custom-diff-area :deep(.code-diff-view) {
  width: 100% !important;
  height: calc(100% - 8px) !important;
  margin-top: 8px !important;
  margin-bottom: 0 !important;
  border: 1px solid var(--lk-surface-border) !important;
  border-radius: var(--lk-surface-radius) !important;
  background: var(--lk-surface-bg) !important;
}
</style>
