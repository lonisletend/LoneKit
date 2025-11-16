<script setup>

import { ref, watch } from "vue";
import { NButton, NInput, NSelect, NTag, NSplit, useNotification } from "naive-ui";
import { readText, writeText } from "@tauri-apps/api/clipboard";
import { XmlFormat } from 'lone-format';

const source = ref();
const target = ref();
const customXmlFormatRef = ref(null)

function handleChange(val) {
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
  source.value = `<?xml version="1.0" encoding="UTF-8"?><!-- 这是图书馆的 XML 数据 --><library><!-- 第一本书：TypeScript --><book id="1" category="programming"><title lang="en">Learning TypeScript</title><author>Josh Goldberg</author><year>2022</year><price currency="USD">39.99</price><example><![CDATA[const add = (a, b) => a + b; console.log(add(2, 3)); // 5]]></example><publisher><name>O'Reilly Media</name><location>Sebastopol, CA</location></publisher><tags><tag>TypeScript</tag><tag>JavaScript</tag><tag>Web Development</tag></tags></book><!-- 第二本书：Vue.js --><book id="2" category="web"><title lang="en">Vue.js 3 Cookbook</title><author>Heitor Ramon Ribeiro</author><year>2023</year><price currency="USD">44.99</price><publisher><name>Packt Publishing</name><location>Birmingham, UK</location></publisher><tags><tag>Vue.js</tag><tag>Frontend</tag><tag>Framework</tag></tags></book></library>`;
  handleChange(source.value);
}

function clear() {
  source.value = '';
  target.value = '';
}

function compressive() {
  customXmlFormatRef.value?.compressSource();
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

async function copyValue() {
  await customXmlFormatRef.value?.copyXml()
  notify('success', '复制成功!');
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
        <div class="h-full p-2 flex flex-col">
          <div class="flex-shrink-0 w-full h-8 flex items-center space-x-4 mb-2">
            <n-tag size="large" type="warning">输入</n-tag>
            <n-button @click="readClipboard">剪贴板</n-button>
            <n-button @click="showExample">示例</n-button>
            <n-button @click="clear">清空</n-button>
            <n-button @click="compressive">压缩</n-button>
            <n-button @click="copySource">复制</n-button>
          </div>
          <div class="flex-1 w-full overflow-hidden">
            <n-input v-model:value="source" type="textarea" class="w-full h-full text-xl" placeholder="输入需要格式化的 XML"
              @input="handleChange" />
          </div>
        </div>
      </template>
      <template #2>
        <div class="h-full p-2 flex flex-col">
          <div class="flex-shrink-0 w-full h-8 flex items-center space-x-4 mb-2">
            <n-tag size="large" type="success">输出</n-tag>
            <n-button @click="copyValue">复制</n-button>
          </div>
          <div class="flex-1 w-full overflow-hidden text-lg">
            <XmlFormat class="w-full h-full" ref="customXmlFormatRef" v-model="source" theme="min-light" :show-toolbar="false" />
          </div>
        </div>
      </template>
    </n-split>
  </div>
</template>

<style scoped>
</style>
