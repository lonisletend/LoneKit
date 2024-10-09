<script setup>

import {ref, watch} from "vue";
import {NButton, NInput, NSelect, NTag, useNotification} from "naive-ui";
import {readText, writeText} from "@tauri-apps/api/clipboard";
// import { ModelOperations } from "@vscode/vscode-languagedetection";

const source = ref();
const target = ref();
const options = {
  language: 'sql',
  tabWidth: 2,
  keywordCase: 'upper',
  linesBetweenQueries: 2,
}

// const modulOperations = new ModelOperations();

async function handleChange(val) {
//   const result = await modulOperations.runModel(`
// function makeThing(): Thing {
//     let size = 0;
//     return {
//         get size(): number {
//         return size;
//         },
//         set size(value: string | number | boolean) {
//         let num = Number(value);
//         // Don't allow NaN and stuff.
//         if (!Number.isFinite(num)) {
//             size = 0;
//             return;
//         }
//         size = num;
//         },
//     };
// }
// `);
  console.log(result);
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
  source.value = 'select supplier_name,city from\n' +
      '(select * from suppliers join addresses on suppliers.address_id=addresses.id)\n' +
      'as suppliers\n' +
      'where supplier_id > 500\n' +
      'order by supplier_name asc,city desc;';
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
  <div class="w-full h-full flex">
    <div class="w-1/2 h-full p-2 flex flex-col space-y-2">
      <div class="w-full h-8 flex items-center space-x-4">
        <n-tag size="large" type="warning">输入</n-tag>
        <n-button @click="readClipboard">剪贴板</n-button>
        <n-button @click="showExample">示例</n-button>
        <n-button @click="clear">清空</n-button>
      </div>
      <div class="w-full h-full text-xl">
        <n-input v-model:value="source" type="textarea" class="w-full h-full"
                 placeholder="输入需要格式化的代码片段" @input="handleChange"/>
      </div>

    </div>
    <div class="w-1/2 h-full p-2 flex flex-col space-y-2">
      <div class="w-full h-8 flex items-center space-x-4">
        <n-tag size="large" type="success">结果</n-tag>
        <n-button @click="copyValue">复制</n-button>
      </div>
      <div class="w-full h-full text-xl">
        <n-input v-model:value="target" type="textarea" class="w-full h-full"
                 placeholder="格式化结果" :readonly="true"/>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
