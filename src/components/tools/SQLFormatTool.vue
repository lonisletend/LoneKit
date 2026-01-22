<script setup>

import {ref} from "vue";
import {NButton, NInput, NTag, useNotification} from "naive-ui";
import { 
  ArrowMaximizeVertical24Regular as ExpandIcon,
  ArrowMinimizeVertical24Regular as CollapseIcon
} from '@vicons/fluent';

import { SqlFormat } from 'lone-format'
import SplitPanel from '../common/SplitPanel.vue'
import { useCommon } from '../../composables/useCommon'

const { notify, copyToClipboard, readFromClipboard } = useCommon();

defineOptions({
  name: 'SQLFormatTool'
});

const source = ref();
const customSqlFormatRef = ref(null)

async function readClipboard() {
  const text = await readFromClipboard();
  if (text) {
    source.value = text;
  }
}

function showExample() {
  source.value = 'select supplier_name,city from\n' +
      '(select * from suppliers join addresses on suppliers.address_id=addresses.id)\n' +
      'as suppliers\n' +
      'where supplier_id > 500\n' +
      'order by supplier_name asc,city desc;';
}

function clear() {
  source.value = '';
}

async function copyValue() {
  await customSqlFormatRef.value?.copySql()
  notify('success', '复制成功!');
}

function compressive() {
  customSqlFormatRef.value?.compressSource();
}

function copySource() {
  copyToClipboard(source.value);
}

function expandAll() {
  customSqlFormatRef.value?.expandAll();
}

function collapseAll() {
  customSqlFormatRef.value?.collapseAll();
}


</script>

<template>
  <div class="w-full h-full">
    <SplitPanel>
      <template #left>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="warning">SQL</n-tag>
            <n-button @click="readClipboard">剪贴板</n-button>
            <n-button @click="showExample">示例</n-button>
            <n-button @click="clear">清空</n-button>
            <n-button @click="compressive">压缩</n-button>
            <n-button @click="copySource">复制</n-button>
          </div>
          <div class="w-full h-full text-xl">
            <n-input v-model:value="source" type="textarea" class="w-full h-full"
                     placeholder="输入需要格式化的 SQL"/>
          </div>
        </div>
      </template>
      <template #right>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="success">结果</n-tag>
            <n-button @click="copyValue">复制</n-button>
            <n-button @click="collapseAll">
              <template #icon> <component :is="CollapseIcon" /> </template>
            </n-button>
            <n-button @click="expandAll">
              <template #icon> <component :is="ExpandIcon" /> </template>
            </n-button>
          </div>
          <div class="flex-1 w-full overflow-hidden text-lg border border-gray-300 rounded">
            <SqlFormat class="w-full h-full"
            ref="customSqlFormatRef" v-model="source" theme="min-light"/>
          </div>
        </div>
      </template>
    </SplitPanel>
  </div>
</template>

<style scoped>

</style>
