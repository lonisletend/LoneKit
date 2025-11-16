<template>
  <div class="w-full h-full flex">
    <!-- 左侧输入区域 -->
    <div class="w-1/2 h-full p-2 flex flex-col">
      <!-- 固定的操作按钮 -->
      <div class="flex-shrink-0 w-full h-8 flex items-center space-x-4 mb-2">
        <n-tag size="large" type="warning">
          输入
        </n-tag>
        <n-button @click="readClipboard">剪贴板</n-button>
        <n-button @click="showExample">示例</n-button>
        <n-button @click="clear">清空</n-button>
        <n-button @click="compressive">压缩</n-button>
        <n-button @click="copySource">复制</n-button>
      </div>
      <!-- 可滚动的输入区域 -->
      <div class="flex-1 w-full overflow-hidden">
        <n-input v-model:value="sourceJson" type="textarea" class="w-full h-full text-lg"
                 placeholder="输入 Json 字符串" @input="handleSourceJsonChange"/>
      </div>
    </div>
    
    <!-- 右侧输出区域 -->
    <div class="w-1/2 h-full p-2 flex flex-col">
      <!-- 固定的操作按钮 -->
      <div class="flex-shrink-0 w-full h-8 flex items-center space-x-4 mb-2">
        <n-tag size="large" type="success">输出</n-tag>
        <n-button @click="copyJson">复制</n-button>
        <n-input v-model:value="jsonPath" type="text" @keydown.enter="jsonFilter" clearable
                 placeholder="使用 JsonPath 进行过滤"/>
        <n-tooltip trigger="hover">
          <template #trigger>
            <a href="https://docs.hevodata.com/sources/engg-analytics/streaming/rest-api/writing-jsonpath-expressions/" target="_blank">
              <n-button size="small" circle>
                <n-icon size="16"><question-icon /></n-icon>
              </n-button>
            </a>
          </template>
          JsonPath 是一种类似于 XPath 的表达式，可用于从 JSON 文档中选择元素。点击了解更多。
        </n-tooltip>
      </div>
      <!-- 可滚动的输出区域 -->
      <div class="flex-1 w-full p-1 text-lg border border-gray-400 rounded overflow-auto">
        <vue-json-pretty :data="jsonObject" v-if="sourceJson" :showLineNumber="true" :showIcon="true" :editable="true"/>
      </div>
    </div>
  </div>
</template>

<script setup>

import {ref, onMounted, reactive, computed} from "vue";
import {NInput, NTag, NButton, NIcon, NTooltip, useNotification} from "naive-ui";
import { Question24Filled as QuestionIcon } from '@vicons/fluent';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import jsonpath from 'jsonpath';
import { writeText, readText } from "@tauri-apps/api/clipboard";

const props = defineProps({
  id: {
    type: Number,
    required: false,
    default: 0
  }
});

const sourceJson = ref();
const exampleJsonObject = ref({
  "status": 200,
  "text": "",
  "error": null,
  "data": [{
    "news_id": 51184,
    "title": "iPhone X Review: Innovative future with real black technology",
    "source": "Netease phone"
  }, {
    "news_id": 51183,
    "title": "Traffic paradise: How to design streets for people and unmanned vehicles in the future?",
    "source": "Netease smart",
    "link": "http://netease.smart/traffic-paradise/1235"
  }, {
    "news_id": 51182,
    "title": "Teslamask's American Business Relations: The government does not pay billions to build factories",
    "source": "AI Finance",
    "members": ["Daniel", "Mike", "John"]
  }]
});
const jsonObject = ref();
const jsonPath = ref();

function handleSourceJsonChange(val) {
  try {
    if (sourceJson.value.trim() === '') {
      throw new Error('The input is empty!')
    }
    if (jsonPath.value) {
      jsonObject.value = jsonpath.query(JSON.parse(sourceJson.value), jsonPath.value);
    } else {
      jsonObject.value = JSON.parse(sourceJson.value);
    }
  } catch (error) {
    jsonObject.value = error;
  }
}

function readClipboard() {
  if (navigator && navigator.clipboard) {
    navigator.clipboard.readText().then(text => {
      sourceJson.value = text;
      handleSourceJsonChange(sourceJson.value);
    });
  }
  if (window.__TAURI_IPC__) {
    readText().then(text => {
      sourceJson.value = text;
      handleSourceJsonChange(sourceJson.value);
    });
  }
}

function showExample() {
  sourceJson.value = JSON.stringify(exampleJsonObject.value);
  handleSourceJsonChange(sourceJson.value);
}

function compressive() {
  sourceJson.value = JSON.stringify(jsonObject.value);
}

function copySource() {
  copy(sourceJson.value);
}

function clear() {
  sourceJson.value = '';
}

function copyJson() {
  copy(JSON.stringify(jsonObject.value, undefined, 2));
}

function jsonFilter() {
  handleSourceJsonChange(sourceJson.value);
}

const notification = useNotification();

function notify(type, message) {
  notification[type]({
    content: message,
    duration: 2500,
    keepAliveOnHover: true
  });
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

<style>
.vjs-tree {
  font-family: Monaco, Menlo, Consolas, Bitstream Vera Sans Mono, monospace;
  font-size: 15px;
  text-align: left;
}
</style>
