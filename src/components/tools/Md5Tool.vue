<script setup>

import {ref, watch} from "vue";
import {NButton, NInput, NSelect, NTag, useNotification} from "naive-ui";
import md5 from 'blueimp-md5';
import {readText, writeText} from "@tauri-apps/api/clipboard";
import SplitPanel from '../common/SplitPanel.vue'

const source = ref();
const example = ref('test');
const target = ref();

const lineMode = ref('multi');
const lineModeOptions = ref([
  {label: '多行', value: 'multi'},
  {label: '整体', value: 'single'},
]);

watch(lineMode, () => {
  clear();
})

function handleChange(val) {
  if (lineMode.value === 'single') {
    target.value = md5(source.value);
  } else {
    const values = source.value.split('\n').filter(item => item);
    const results = values.map(value => md5(value));
    target.value = results.join('\n');
  }
}

function readClipboard() {
  if (navigator && navigator.clipboard) {
    navigator.clipboard.readText().then(text => {
      source.value = text;
      handleChange(source.value);
    });
  }
  if (window.__TAURI_IPC__) {
    readText().then(text => {
      source.value = text;
      handleChange(source.value);
    });
  }
}

function showExample() {
  source.value = 'test';
  handleChange(source.value);
}

function clear() {
  source.value = '';
  target.value = '';
}

const notification = useNotification();

function notify(type, message) {
  notification[type]({
    content: message,
    duration: 2500,
    keepAliveOnHover: true
  });
}

function copyValue() {
  copy(target.value);
}

function copy(value) {
  if (navigator && navigator.clipboard) {
    navigator.clipboard.writeText(value);
  }
  if (window.__TAURI_IPC__) {
    writeText(value.toString());
  }
  notify('success', '复制成功!');
}

</script>

<template>
  <div class="w-full h-full">
    <SplitPanel>
      <template #left>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="warning">加密</n-tag>
            <n-select v-model:value="lineMode" :options="lineModeOptions" :style="{width: '80px'}" />
            <n-button @click="readClipboard">剪贴板</n-button>
            <n-button @click="showExample">示例</n-button>
            <n-button @click="clear">清空</n-button>
          </div>
          <div class="w-full h-full text-xl">
            <n-input v-model:value="source" type="textarea" class="w-full h-full"
                     placeholder="输入字符串" @input="val => handleChange(val, 1)"/>
          </div>
        </div>
      </template>
      <template #right>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="success">结果</n-tag>
            <n-button @click="copyValue">复制</n-button>
          </div>
          <div class="w-full h-full text-xl">
            <n-input v-model:value="target" type="textarea" class="w-full h-full"
                     placeholder="加密结果" :readonly="true"/>
          </div>
        </div>
      </template>
    </SplitPanel>
  </div>
</template>

<style scoped>

</style>
