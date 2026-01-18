<template>
  <SplitPanel>
    <template #left>
      <!-- 左侧输入区域 -->
      <div class="h-full p-2 flex flex-col">
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
    </template>
    <template #right>
      <!-- 右侧输出区域 -->
      <div class="h-full p-2 flex flex-col">
        <!-- 固定的操作按钮 -->
        <div class="flex-shrink-0 w-full h-8 flex items-center space-x-4 mb-2">
          <n-tag size="large" type="success">输出</n-tag>
          <n-button @click="copyJson">复制</n-button>
          <n-button @click="collapseAll">
            <template #icon> <component :is="CollapseIcon" /> </template>
          </n-button>
          <n-button @click="expandAll">
            <template #icon> <component :is="ExpandIcon" /> </template>
          </n-button>
          <n-button @click="toggleSort" :secondary="isSorted" :type="isSorted ? 'success' : 'default'">
            <template #icon> <component :is="SortIcon" /> </template>
          </n-button>
          <n-input-group>
            <n-select v-model:value="filterType" :options="filterTypeOptions" :style="{ width: '140px' }" />
            <n-input 
              v-model:value="filterExpression" 
              type="text" 
              @keydown.enter="jsonFilter" 
              @clear="onFilterExpressionClear"
              clearable
              :placeholder="filterType === 'jsonpath' ? '使用 JsonPath 进行过滤，如：$.data[*].title' : '使用 JavaScript 进行过滤，如：$.data.filter(item => item.rating > 0.5)'"
            />
          </n-input-group>
        </div>
        <!-- 可滚动的输出区域 -->
        <div class="flex-1 w-full overflow-hidden text-lg">
          <JsonFormat class="w-full h-full"
          ref="customJsonFormatRef" v-model="sourceJson" theme="min-light" :show-toolbar="false" />
        </div>
      </div>
    </template>
  </SplitPanel>
</template>

<script setup>

import {ref, watch} from "vue";
import {NInput, NInputGroup, NSelect, NTag, NButton, useNotification} from "naive-ui";
import { 
  TextSortAscending24Regular as SortIcon,
  ArrowMaximizeVertical24Regular as ExpandIcon,
  ArrowMinimizeVertical24Regular as CollapseIcon
} from '@vicons/fluent';
import jsonpath from 'jsonpath';
import { writeText, readText } from "@tauri-apps/api/clipboard";
import { JsonFormat } from 'lone-format'
import SplitPanel from '../common/SplitPanel.vue'

const props = defineProps({
  id: {
    type: Number,
    required: false,
    default: 0
  }
});

const customJsonFormatRef = ref(null)
const sourceJson = ref();
const exampleJsonStr = ref(`{"status":200,"text":"","error":null,"data":[{"news_id":123456789012345678901234567890,"title":"iPhone X Review: Innovative future with real black technology","source":"Netease phone","rating":0.5},{"news_id":123456789012345678901234567891,"title":"Traffic paradise: How to design streets for people and unmanned vehicles in the future?","source":"Netease smart","link":"http://netease.smart/traffic-paradise/1235","rating":0.60},{"news_id":123456789012345678901234567892,"title":"Teslamask's American Business Relations: The government does not pay billions to build factories","source":"AI Finance","rating":0.8000,"members":["Daniel","Mike","John"]}]}`);
const jsonObject = ref();
const filterType = ref('jsonpath');
const filterExpression = ref('');
const isSorted = ref(false);

// 过滤类型选项
const filterTypeOptions = [
  { label: 'JsonPath', value: 'jsonpath' },
  { label: 'JavaScript', value: 'js' }
];

// 监听过滤类型变化，自动清空表达式
watch(filterType, () => {
  filterExpression.value = '';
  executeFilter(); // 清空后执行过滤（实际上是清空过滤）
});

function handleSourceJsonChange(val) {
  try {
    if (sourceJson.value.trim() === '') {
      throw new Error('The input is empty!')
    }
    if (filterExpression.value) {
      jsonObject.value = jsonpath.query(JSON.parse(sourceJson.value), filterExpression.value);
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
  sourceJson.value = exampleJsonStr.value;
  handleSourceJsonChange(sourceJson.value);
}

function compressive() {
  customJsonFormatRef.value?.compressSource();
}

function copySource() {
  copy(sourceJson.value);
}

function clear() {
  sourceJson.value = '';
}

async function copyJson() {
  await customJsonFormatRef.value?.copyJson()
  notify('success', '复制成功!');
}

function executeFilter() {
  const expression = filterExpression.value.trim();
  
  if (!expression) {
    // 表达式为空时，清空过滤
    customJsonFormatRef.value?.clearFilter();
    customJsonFormatRef.value?.expandAll();
    return;
  }
  
  // 表达式有值时，执行过滤
  const filterConfig = {
    type: filterType.value,
    expression: expression
  };
  
  customJsonFormatRef.value?.filter(filterConfig);
}

function onFilterExpressionClear() {
  // 清空表达式时也触发过滤执行
  executeFilter();
}

function jsonFilter() {
  executeFilter();
}

function toggleSort() {
  isSorted.value = !isSorted.value;
  if (isSorted.value) {
    customJsonFormatRef.value?.sortKeys();
  } else {
    customJsonFormatRef.value?.clearSortKeys();
  }
}

function expandAll() {
  customJsonFormatRef.value?.expandAll();
}

function collapseAll() {
  customJsonFormatRef.value?.collapseAll();
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

<style scoped>
/* 组件特有样式可以保留在这里 */
</style>
