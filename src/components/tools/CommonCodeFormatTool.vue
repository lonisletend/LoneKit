<script setup>

import { ref, watch } from "vue";
import { NButton, NInput, NSelect, NTag, useNotification } from "naive-ui";
import { readText, writeText } from "@tauri-apps/api/clipboard";
import { codeToHtml } from 'shiki';

import { formatCode, supportedLanguages, codeExample } from '../../utils/formatter';
// import { detectLanguage } from '../../utils/languageDetector';

const source = ref();
const target = ref();

const selectedLanguage = ref('xml');
watch(selectedLanguage, (val) => {
  source.value = '';
  handleChange(source.value);
});
const targetHtml = ref();


async function handleChange(val) {
  if (!val) {
    target.value = '';
    targetHtml.value = '';
    return;
  }
  // selectedLanguage.value = detectLanguage(val);
  // console.log('selectedLanguage.value', selectedLanguage.value);
  try {
    target.value = await formatCode(val, selectedLanguage.value);
    targetHtml.value = await codeToHtml(target.value, { lang: selectedLanguage.value, theme: 'github-light' });
  } catch (error) {
    target.value = '';
    targetHtml.value = error.message;
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
  source.value = codeExample[selectedLanguage.value];
  handleChange(source.value);
}

function clear() {
  source.value = '';
  target.value = '';
  handleChange(source.value);
}

function compressCode() {
  if (source.value) {
    source.value = source.value.replace(/\s+/g, ' ').trim();
    handleChange(source.value);
  }
}

const notification = useNotification();

function notify(type, message) {
  notification[type]({
    content: message,
    duration: 2500,
    keepAliveOnHover: true
  });
}

function copySource() {
  copy(source.value);
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
  <div class="w-full h-full flex">
    <div class="w-1/2 h-full p-2 flex flex-col space-y-2">
      <div class="w-full h-8 flex items-center space-x-4">
        <n-tag size="large" type="warning">输入</n-tag>
        <n-select v-model:value="selectedLanguage" :options="supportedLanguages" placeholder="语言"
          :style="{ width: '100px' }" />
        <n-button @click="showExample">示例</n-button>
        <n-button @click="readClipboard">剪贴板</n-button>
        <n-button @click="clear">清空</n-button>
        <n-button @click="compressCode">压缩</n-button>
        <n-button @click="copySource">复制</n-button>
      </div>
      <div class="w-full h-full">
        <n-input v-model:value="source" type="textarea" class="w-full h-full" placeholder="输入需要格式化的代码片段"
          @input="handleChange" :style="{ fontSize: '14px' }" />
      </div>

    </div>
    <div class="w-1/2 h-full p-2 flex flex-col space-y-2">
      <div class="w-full h-8 flex items-center space-x-4">
        <n-tag size="large" type="success">结果</n-tag>
        <n-button @click="copyValue">复制</n-button>
      </div>
      <div class="w-full h-full p-1 transition border border-gray-400 rounded overflow-auto">
        <!-- <n-input v-model:value="target" type="textarea" class="w-full h-full" placeholder="格式化结果" :readonly="true" /> -->
        <div v-html="targetHtml"></div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
