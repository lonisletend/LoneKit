<script setup>

import {ref, watch} from "vue";
import {NButton, NInput, NSelect, NTag, NSplit, useNotification} from "naive-ui";
import 'vue-json-pretty/lib/styles.css';
import { encode, decode } from 'js-base64';
import {readText, writeText} from "@tauri-apps/api/clipboard";

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

function handleChange(val, type) {
  console.log('handleChange', val, type);
  if (type === 1) {
    if (lineMode.value === 'single') {
      target.value = encode(source.value);
    } else {
      const values = source.value.split('\n').filter(item => item);
      const results = values.map(value => encode(value));
      target.value = results.join('\n');
    }
  }
  if (type === 2) {
    if (lineMode.value === 'single') {
      source.value = decode(target.value);
    } else {
      const values = target.value.split('\n').filter(item => item);
      const results = values.map(value => decode(value));
      source.value = results.join('\n');
    }
  }
}

function readClipboard(type) {
  if (navigator && navigator.clipboard) {
    navigator.clipboard.readText().then(text => {
      if (type === 1) {
        source.value = text;
        handleChange(source.value, 1);
      } else {
        target.value = text;
        handleChange(target.value, 2);
      }
    });
  }
  if (window.__TAURI_IPC__) {
    readText().then(text => {
      if (type === 1) {
        source.value = text;
        handleChange(source.value, 1);
      } else {
        target.value = text;
        handleChange(target.value, 2);
      }
    });
  }
}

function showExample(type) {
  if (type === 1) {
    source.value = 'test';
    handleChange(source.value, 1);
  } else {
    target.value = 'dGVzdA==';
    handleChange(target.value, 2);
  }
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

function copyValue(type) {
  if (type === 1) {
    copy(source.value);
  } else {
    copy(target.value);
  }
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
    <n-split direction="horizontal" :default-size="0.5" :min="0.2" :max="0.8">
      <template #resize-trigger>
        <div class="resize-trigger"></div>
      </template>
      <template #1>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="warning">编码</n-tag>
            <n-select v-model:value="lineMode" :options="lineModeOptions" :style="{width: '80px'}" />
            <n-button @click="readClipboard(1)">剪贴板</n-button>
            <n-button @click="showExample(1)">示例</n-button>
            <n-button @click="clear">清空</n-button>
            <n-button @click="copyValue(1)">复制</n-button>
          </div>
          <div class="w-full h-full text-xl">
            <n-input v-model:value="source" type="textarea" class="w-full h-full"
                     placeholder="输入编码字符串" @input="val => handleChange(val, 1)"/>
          </div>
        </div>
      </template>
      <template #2>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="success">解码</n-tag>
            <n-select v-model:value="lineMode" :options="lineModeOptions" :style="{width: '80px'}"  />
            <n-button @click="readClipboard(2)">剪贴板</n-button>
            <n-button @click="showExample(2)">示例</n-button>
            <n-button @click="clear">清空</n-button>
            <n-button @click="copyValue(2)">复制</n-button>
          </div>
          <div class="w-full h-full text-xl">
            <n-input v-model:value="target" type="textarea" class="w-full h-full"
                     placeholder="输入解码字符串" @input="val => handleChange(val, 2)"/>
          </div>
        </div>
      </template>
    </n-split>
  </div>
</template>

<style scoped>

</style>