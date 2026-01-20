<script setup>

import {ref} from "vue";
import {NButton, NButtonGroup, NInput, NSelect} from "naive-ui";
import SplitPanel from '../common/SplitPanel.vue';
import { CodeDiff } from 'v-code-diff'

defineOptions({
  name: 'DiffTool'
});

const source = ref();
const target = ref();
const panel = ref('source');
const outputFormat = ref('side-by-side');

const outputFormatOptions = [
  { label: '并排（side-by-side）', value: 'side-by-side' },
  { label: '逐行（line-by-line）', value: 'line-by-line' }
];

function showExample() {
}

function clear() {
  source.value = '';
  target.value = '';
}

</script>

<template>
  <div class="w-full h-full flex flex-col p-2"  v-show="panel === 'source'">
    <div class="w-full h-8 flex items-center space-x-4">
      <n-button-group>
        <n-button secondary type="primary">
          原始文本
        </n-button>
        <n-button ghost @click="() => panel = 'result'">
          对比结果
        </n-button>
      </n-button-group>
    </div>
    <div class="w-full h-full text-xl">
      <SplitPanel>
        <template #left>
          <div class="h-full p-2 flex flex-col space-y-2">
            <div class="w-full h-full text-xl">
              <n-input v-model:value="source" type="textarea" class="w-full h-full"
                       placeholder="原始文本"/>
            </div>
          </div>
        </template>
        <template #right>
          <div class="h-full p-2 flex flex-col space-y-2">
            <div class="w-full h-full text-xl">
              <n-input v-model:value="target" type="textarea" class="w-full h-full"
                       placeholder="对比文本"/>
            </div>
          </div>
        </template>
      </SplitPanel>
    </div>
  </div>

  <div class="w-full h-full flex flex-col p-2" v-show="panel === 'result'">
    <div class="w-full h-8 flex items-center space-x-4">
      <n-button-group>
        <n-button ghost @click="() => panel = 'source'">
          原始文本
        </n-button>
        <n-button secondary type="primary">
          对比结果
        </n-button>
      </n-button-group>
      <n-select 
        v-model:value="outputFormat" 
        :options="outputFormatOptions" 
        :style="{width: '200px'}"
        class="w-32"
      />
    </div>
    <div class="w-full h-full text-xl flex space-x-4 custom-diff-area">
      <CodeDiff
          :old-string="source"
          :new-string="target"
          :output-format="outputFormat"
      />
    </div>
  </div>
</template>

<style scoped>
.code-diff-view {
  position: relative;
  margin-top: 8px;
  margin-bottom: 0;
  border: 1px solid var(--color-border-default, #ddd);
  border-radius: 6px;
  overflow-y: auto;
}

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
}
</style>
