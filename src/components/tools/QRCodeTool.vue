<script setup>

import { computed, ref, watch } from "vue";
import { NButton, NInput, NSwitch, NTag, NRadioGroup, NRadioButton, NColorPicker } from "naive-ui";
import QrcodeVue from 'qrcode.vue'
import SplitPanel from '../common/SplitPanel.vue'
import { useCommon } from '../../composables/useCommon';
import { useSyncedScroll } from '../../composables/useSyncedScroll';
import { useAutoAppendEntries } from '../../composables/useAutoAppendEntries';

const { notify, readFromClipboard, copyCanvasImage, exportCanvasToExcel } = useCommon();

const size = ref(200);
const sizeOptions = ref([
  {label: '小', value: 100},
  {label: '中', value: 200},
  {label: '大', value: 300},
])
const color = ref('#18A058');
const isBatchInput = ref(false);
const batchInputText = ref('');

const cardHeight = computed(() => {
  const map = {
    100: 220,
    200: 320,
    300: 420,
  };
  return map[size.value] ?? 320;
});

const inputRows = computed(() => {
  const map = {
    100: 6,
    200: 10,
    300: 14,
  };
  return map[size.value] ?? 10;
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

function parseBatchLines(text) {
  return (text ?? '')
    .split(/\r\n|\r|\n/)
    .filter(line => line.trim() !== '');
}

function applyBatchInput(text) {
  const lines = parseBatchLines(text);
  if (lines.length === 0) {
    resetEntries();
    return;
  }
  resetEntries(lines.map(line => createEntry(line)));
}

function onBatchInputChange(val) {
  batchInputText.value = val ?? '';
  applyBatchInput(batchInputText.value);
}

function syncBatchInputFromEntries() {
  batchInputText.value = entries.value
    .filter(entry => hasContent(entry))
    .map(entry => entry.content)
    .join('\n');
}

watch(isBatchInput, (enabled) => {
  if (!enabled) {
    return;
  }
  syncBatchInputFromEntries();
  applyBatchInput(batchInputText.value);
});

async function readClipboard() {
  const text = await readFromClipboard();
  if (text) {
    if (isBatchInput.value) {
      batchInputText.value = text;
      applyBatchInput(batchInputText.value);
      return;
    }

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
  if (isBatchInput.value) {
    batchInputText.value = 'https://kit.lonestack.com\nLoneKit';
    applyBatchInput(batchInputText.value);
    return;
  }

  resetEntries([
    createEntry('https://kit.lonestack.com'),
    createEntry(),
  ]);
}

function clear() {
  if (isBatchInput.value) {
    batchInputText.value = '';
    applyBatchInput(batchInputText.value);
    return;
  }

  resetEntries();
}

function exportToExcel() {
  const activeEntries = entries.value.filter(hasContent);
  exportCanvasToExcel(activeEntries, 'qrcode-', {
    sheetName: '二维码',
    textHeader: '二维码文本',
    imageHeader: '二维码图片',
    filePrefix: '二维码',
  });
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
            <n-switch v-model:value="isBatchInput" size="large">
              <template #checked>批量输入</template>
              <template #unchecked>批量输入</template>
            </n-switch>
          </div>
          <div
            v-if="!isBatchInput"
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
                placeholder="输入字符串（支持换行，整体生成一个二维码）"
                @input="val => handleEntryInput(index, val)"
              />
            </div>
          </div>
          <div v-else class="w-full h-full">
            <n-input
              v-model:value="batchInputText"
              type="textarea"
              class="w-full h-full batch-input"
              placeholder="每行一条内容，按换行分割生成多个二维码"
              @input="onBatchInputChange"
            />
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
            <n-button @click="exportToExcel">导出 Excel</n-button>
          </div>
          <div
            ref="rightScrollRef"
            class="w-full h-full text-lg transition overflow-auto space-y-3"
            @scroll="handleScroll('right', $event)"
          >
            <div v-for="entry in entries" :key="entry.id" class="w-full border border-gray-200 rounded p-2 relative" :style="cardStyle">
              <div v-if="hasContent(entry)" class="h-full flex flex-col">
                <div class="entry-copy-btn">
                  <n-button size="small" @click="copyCanvasImage(`qrcode-${entry.id}`, '二维码图片已复制到剪贴板!')">复制</n-button>
                </div>
                <div class="flex-1 flex justify-center items-center overflow-hidden" :id="`qrcode-${entry.id}`">
                  <qrcode-vue :value="entry.content" :size="size" level="H" :foreground="color" />
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

.entry-copy-btn {
  position: absolute;
  right: 5px;
  bottom: 5px;
  z-index: 10;
}

.entry-input :deep(textarea) {
  padding-right: 60px;
  padding-bottom: 30px;
}

.batch-input :deep(textarea) {
  height: 100%;
}

</style>
