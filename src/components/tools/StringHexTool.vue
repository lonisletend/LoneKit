<script setup>

import {ref, watch} from "vue";
import { NButton, NInput, NSelect, NTag } from "naive-ui";
import { readText } from "@tauri-apps/api/clipboard";
import SplitPanel from '../common/SplitPanel.vue';
import { useCommon } from '../../composables/useCommon';

const { notify, copyToClipboard } = useCommon();

const source = ref();
const target = ref();

const lineMode = ref('multi');
const lineModeOptions = ref([
  {label: '多行', value: 'multi'},
  {label: '整体', value: 'single'},
]);

watch(lineMode, () => {
  clear();
})

// ----------------------------------------------------------------------------
// This is the same for all of the below, and
// you probably won't need it except for debugging
// in most cases.
function bytesToHex(bytes) {
  return Array.from(
      bytes,
      byte => byte.toString(16).padStart(2, "0")
  ).join("");
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i !== bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// You almost certainly want UTF-8, which is
// now natively supported:
function stringToUTF8Bytes(string) {
  return new TextEncoder().encode(string);
}

// But you might want UTF-16 for some reason.
// .charCodeAt(index) will return the underlying
// UTF-16 code-units (not code-points!), so you
// just need to format them in whichever endian order you want.
function stringToUTF16Bytes(string, littleEndian) {
  const bytes = new Uint8Array(string.length * 2);
  // Using DataView is the only way to get a specific
  // endianness.
  const view = new DataView(bytes.buffer);
  for (let i = 0; i != string.length; i++) {
    view.setUint16(i, string.charCodeAt(i), littleEndian);
  }
  return bytes;
}

// And you might want UTF-32 in even weirder cases.
// Fortunately, iterating a string gives the code
// points, which are identical to the UTF-32 encoding,
// though you still have the endianess issue.
function stringToUTF32Bytes(string, littleEndian) {
  const codepoints = Array.from(string, c => c.codePointAt(0));
  const bytes = new Uint8Array(codepoints.length * 4);
  // Using DataView is the only way to get a specific
  // endianness.
  const view = new DataView(bytes.buffer);
  for (let i = 0; i != codepoints.length; i++) {
    view.setUint32(i, codepoints[i], littleEndian);
  }
  return bytes;
}
// ----------------------------------------------------------------------------



function encode(value) {
  return bytesToHex(stringToUTF8Bytes(value));
}

function decode(value) {
  return new TextDecoder().decode(hexToBytes(value));
}

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
    target.value = '74657374';
    handleChange(target.value, 2);
  }
}

function clear() {
  source.value = '';
  target.value = '';
}

function copyValue(type) {
  const value = type === 1 ? source.value : target.value;
  copyToClipboard(value, '复制成功!');
}

</script>

<template>
  <div class="w-full h-full">
    <SplitPanel>
      <template #left>
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
                     placeholder="输入字符串" @input="val => handleChange(val, 1)"/>
          </div>
        </div>
      </template>
      <template #right>
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
                     placeholder="输入16进制" @input="val => handleChange(val, 2)"/>
          </div>
        </div>
      </template>
    </SplitPanel>
  </div>
</template>

<style scoped>

</style>
