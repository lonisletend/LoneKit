<script setup>

import { ref, watch } from "vue";
import { NButton, NInput, NSelect, NTag, useNotification } from "naive-ui";
import { readText, writeText } from "@tauri-apps/api/clipboard";
import { formatXml, prettifyXml } from '../../utils/xmlUtil';
import SplitPanel from '../common/SplitPanel.vue'

const source = ref();
const target = ref();

function handleChange(val) {
  target.value = formatXml(source.value, true, '  ');
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
  source.value = `<?xml version="1.0"?> <catalog> <book id="bk101"> <author>Gambardella, Matthew</author> <title>XML Developer's Guide</title> <genre>Computer</genre> <price>44.95</price> <publish_date>2000-10-01</publish_date> <description>An in-depth look at creating applications with XML.</description> </book> </catalog>`;
  handleChange(source.value);
}

function clear() {
  source.value = '';
  target.value = '';
}

function compressCode() {
  if (source.value) {
    source.value = source.value.replace(/\s+/g, ' ').trim();
    handleChange(source.value);
  }
}

function copySource() {
  copy(source.value);
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
  copy(prettifyXml(source.value));
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
            <n-tag size="large" type="warning">输入</n-tag>
            <n-button @click="readClipboard">剪贴板</n-button>
            <n-button @click="showExample">示例</n-button>
            <n-button @click="clear">清空</n-button>
            <n-button @click="compressCode">压缩</n-button>
            <n-button @click="copySource">复制</n-button>
          </div>
          <div class="w-full h-full text-xl">
            <n-input v-model:value="source" type="textarea" class="w-full h-full" placeholder="输入需要格式化的 XML"
              @input="handleChange" />
          </div>
        </div>
      </template>
      <template #right>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="success">输出</n-tag>
            <n-button @click="copyValue">复制</n-button>
          </div>
          <div class="w-full h-full p-1 transition border border-gray-400 rounded overflow-auto">
            <div v-html="target"></div>
          </div>
        </div>
      </template>
    </SplitPanel>
  </div>
</template>

<style>
.xtb {
  display: table;
  font-family: monospace;
}

.xtc {
  display: table-cell;
}

.xmt {
  color: #24292E;
  display: inline;
}

.xel {
  color: #22863A;
  display: inline;
}

.xdt {
  color: #24292E;
  display: inline;
}

.xat {
  color: #6F42C1;
  display: inline;
}
</style>
