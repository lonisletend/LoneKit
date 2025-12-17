<script setup>

import { ref, watch } from "vue";
import { NButton, NInput, NInputGroup, NSelect, NTag, useNotification } from "naive-ui";
import { 
  ArrowMaximizeVertical24Regular as ExpandIcon,
  ArrowMinimizeVertical24Regular as CollapseIcon
} from '@vicons/fluent';
import { readText, writeText } from "@tauri-apps/api/clipboard";
import { XmlFormat } from 'lone-format';
import SplitPanel from '../common/SplitPanel.vue'

const source = ref();
const target = ref();
const customXmlFormatRef = ref(null);
const filterType = ref('xpath');
const filterExpression = ref('');

// 过滤类型选项
const filterTypeOptions = [
  { label: 'XPath', value: 'xpath' }
];

// 监听过滤类型变化，自动清空表达式
watch(filterType, () => {
  filterExpression.value = '';
  executeFilter(); // 清空后执行过滤（实际上是清空过滤）
});

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

function executeFilter() {
  const expression = filterExpression.value.trim();
  
  if (!expression) {
    // 表达式为空时，清空过滤
    customXmlFormatRef.value?.clearFilter();
    customXmlFormatRef.value?.expandAll();
    return;
  }
  
  // 表达式有值时，执行过滤
  const filterConfig = {
    type: filterType.value,
    expression: expression
  };
  
  customXmlFormatRef.value?.filter(filterConfig);
}

function onFilterExpressionClear() {
  // 清空表达式时也触发过滤执行
  executeFilter();
}

function xmlFilter() {
  executeFilter();
}

function expandAll() {
  customXmlFormatRef.value?.expandAll();
}

function collapseAll() {
  customXmlFormatRef.value?.collapseAll();
}

</script>

<template>
  <SplitPanel>
    <template #left>
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
    <template #right>
      <div class="h-full p-2 flex flex-col">
        <div class="flex-shrink-0 w-full h-8 flex items-center space-x-4 mb-2">
          <n-tag size="large" type="success">输出</n-tag>
          <n-button @click="copyValue">复制</n-button>
          <n-button @click="collapseAll">
            <template #icon> <component :is="CollapseIcon" /> </template>
          </n-button>
          <n-button @click="expandAll">
            <template #icon> <component :is="ExpandIcon" /> </template>
          </n-button>
          <n-input-group>
            <n-select v-model:value="filterType" :options="filterTypeOptions" :style="{ width: '140px' }" />
            <n-input 
              v-model:value="filterExpression" 
              type="text" 
              @keydown.enter="xmlFilter" 
              @clear="onFilterExpressionClear"
              clearable
              placeholder="使用 XPath 进行过滤，如：//book[@category='programming']/title"
            />
          </n-input-group>
        </div>
        <div class="flex-1 w-full overflow-hidden text-lg">
          <XmlFormat class="w-full h-full" ref="customXmlFormatRef" v-model="source" theme="min-light" :show-toolbar="false" />
        </div>
      </div>
    </template>
  </SplitPanel>
</template>

<style scoped>
</style>
