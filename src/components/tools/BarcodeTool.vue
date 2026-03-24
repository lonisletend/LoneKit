<script setup>

import { computed, ref } from "vue";
import { NButton, NInput, NTag, NRadioGroup, NRadioButton, NColorPicker } from "naive-ui";
import SplitPanel from '../common/SplitPanel.vue'
import { useCommon } from '../../composables/useCommon';
import { useSyncedScroll } from '../../composables/useSyncedScroll';
import { useAutoAppendEntries } from '../../composables/useAutoAppendEntries';

const { notify, readFromClipboard } = useCommon();

const height = ref(150);
const sizeOptions = ref([
  {label: '小', value: 100},
  {label: '中', value: 150},
  {label: '大', value: 200},
])
const heightWidthMap = {
  100: 1,
  150: 2,
  200: 3,
}

const barcodeSize = computed(() => ({
  height: height.value,
  width: heightWidthMap[height.value] ?? 2,
}));

const color = ref('#18A058');

const cardHeight = computed(() => {
  const map = {
    100: 220,
    150: 280,
    200: 340,
  };
  return map[height.value] ?? 280;
});

const inputRows = computed(() => {
  const map = {
    100: 6,
    150: 8,
    200: 10,
  };
  return map[height.value] ?? 8;
});

const cardStyle = computed(() => ({
  height: `${cardHeight.value}px`,
}));

const { leftScrollRef, rightScrollRef, handleScroll } = useSyncedScroll();

function createEntry(content = '') {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    content,
  };
}

function hasContent(entry) {
  return !!entry.content?.trim();
}

const {
  entries,
  ensureEntries,
  removeEntry: removeEntryBase,
  resetEntries,
} = useAutoAppendEntries(createEntry, hasContent);

function handleEntryInput(index, val) {
  entries.value[index].content = val ?? '';
  ensureEntries();
}

function removeEntry(index) {
  removeEntryBase(index);
}

async function readClipboard() {
  const text = await readFromClipboard();
  if (text) {
    const lastIndex = entries.value.length - 1;
    if (!hasContent(entries.value[lastIndex])) {
      entries.value[lastIndex].content = text;
    } else {
      entries.value.push(createEntry(text));
    }
    ensureEntries();
  } else {
    notify('warning', '剪贴板中没有可用文本');
  }
}

function showExample() {
  resetEntries([
    createEntry('https://kit.lonestack.com'),
    createEntry(),
  ]);
}

function clear() {
  resetEntries();
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
            <n-button @click="clear">删除全部</n-button>
          </div>
          <div
            ref="leftScrollRef"
            class="w-full h-full overflow-auto space-y-3"
            @scroll="handleScroll('left', $event)"
          >
            <div v-for="(entry, index) in entries" :key="entry.id" class="relative rounded" :style="cardStyle">
              <div class="entry-delete-btn">
                <n-button
                  size="small"
                  @click="removeEntry(index)"
                  :disabled="entries.length === 1"
                >
                  删除
                </n-button>
              </div>
              <n-input
                v-model:value="entry.content"
                type="textarea"
                class="w-full h-full entry-input"
                :autosize="{ minRows: inputRows, maxRows: inputRows }"
                placeholder="输入字符串（支持换行，整体生成一个条形码）"
                @input="val => handleEntryInput(index, val)"
              />
            </div>
          </div>
        </div>
      </template>
      <template #right>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="success">结果</n-tag>
            <n-radio-group v-model:value="height" name="sizeRadioGroup">
              <n-radio-button v-for="(item, index) in sizeOptions" :key="index" :value="item.value" :label="item.label"/>
            </n-radio-group>
            <n-color-picker v-model:value="color" :style="{width: '80px'}"
              :swatches="['#18A058','#2080F0','#F0A020','rgba(208, 48, 80, 1)','#000000']"
            />
          </div>
          <div
            ref="rightScrollRef"
            class="w-full h-full text-lg transition overflow-auto space-y-3"
            @scroll="handleScroll('right', $event)"
          >
            <div v-for="entry in entries" :key="entry.id" class="w-full border border-gray-200 rounded p-2" :style="cardStyle">
              <div v-if="hasContent(entry)" class="h-full flex flex-col">
                <div class="flex-1 flex justify-center items-center overflow-hidden">
                  <vue-barcode :value="entry.content" :options="{ displayValue: false, lineColor: color, height: barcodeSize.height, width: barcodeSize.width }"></vue-barcode>
                </div>
                <div class="text-sm whitespace-pre-wrap break-all text-center max-h-20 overflow-auto w-full px-2">
                  {{ entry.content }}
                </div>
              </div>
              <div v-else class="h-full border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-sm">
                待输入
              </div>
            </div>
          </div>
        </div>
      </template>
    </SplitPanel>
  </div>
</template>

<style scoped>

.entry-delete-btn {
  position: absolute;
  right: 5px;
  bottom: 5px;
  z-index: 10;
}

.entry-input :deep(textarea) {
  padding-right: 60px;
  padding-bottom: 30px;
}

</style>
