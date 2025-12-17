<script setup>

import {ref, watch} from "vue";
import {NButton, NButtonGroup, NInput, NSelect, NTag, useNotification} from "naive-ui";
import {readText, writeText} from "@tauri-apps/api/clipboard";
import SplitPanel from '../common/SplitPanel.vue'

defineOptions({
  name: 'DiffTool'
});

const source = ref();
const target = ref();
const panel = ref('source');

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
    </div>
    <div class="w-full h-full text-xl flex space-x-4">
      <code-diff
          :old-string="source"
          :new-string="target"
          output-format="side-by-side"
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
</style>
