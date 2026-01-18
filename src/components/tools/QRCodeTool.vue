<script setup>

import {ref, watch} from "vue";
import {NButton, NInput, NSelect, NTag, NRadioGroup, NRadioButton, NColorPicker} from "naive-ui";
import QrcodeVue from 'qrcode.vue'
import {readText} from "@tauri-apps/api/clipboard";
import SplitPanel from '../common/SplitPanel.vue'
import { useCommon } from '../../composables/useCommon';

const { notify, copyToClipboard } = useCommon();

const source = ref();
const example = ref('test');
const target = ref();
const targetList = ref([]);

const lineMode = ref('multi');
const lineModeOptions = ref([
  {label: '多行', value: 'multi'},
  {label: '整体', value: 'single'},
]);

watch(lineMode, () => {
  clear();
})

const size = ref(200);
const sizeOptions = ref([
  {label: '小', value: 100},
  {label: '中', value: 200},
  {label: '大', value: 300},
])
const color = ref('#18A058');

function handleChange(val) {
  if (!val) {
    targetList.value = [];
    return;
  }
  if (lineMode.value === 'single') {
    targetList.value = [source.value];
  } else {
    targetList.value = source.value.split('\n').filter(item => item);
  }
  // console.log('targetList ==> ', JSON.stringify(targetList.value));
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
  source.value = 'https://kit.lonestack.com';
  handleChange(source.value);
}

function clear() {
  source.value = null;
  handleChange(source.value);
}

</script>

<template>
  <div class="w-full h-full">
    <SplitPanel>
      <template #left>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="warning">输入</n-tag>
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
            <n-radio-group v-model:value="size" name="sizeRadioGroup">
              <n-radio-button v-for="(item, index) in sizeOptions" :key="index" :value="item.value" :label="item.label"/>
            </n-radio-group>
            <n-color-picker v-model:value="color" :style="{width: '80px'}"
              :swatches="['#18A058','#2080F0','#F0A020','rgba(208, 48, 80, 1)','#000000']"
            />
          </div>
          <div class="w-full h-full p-1 text-lg transition border border-gray-400 rounded overflow-auto">
            <div v-for="(target, index) in targetList" :key="index" class="w-full mb-4">
              <div class="flex my-1 justify-center">
                <qrcode-vue :value="target" :size="size" level="H" :foreground="color" />
              </div>
              <div class="flex justify-center">
                {{ target }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </SplitPanel>
  </div>
</template>

<style scoped>

</style>
