<script setup>

import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NInput, NSwitch, NTag, NRadioGroup, NRadioButton, NColorPicker, NSelect } from "naive-ui";
import SplitPanel from '../common/SplitPanel.vue'
import { useCommon } from '../../composables/useCommon';
import { useSyncedScroll } from '../../composables/useSyncedScroll';
import { useAutoAppendEntries } from '../../composables/useAutoAppendEntries';
import JsBarcode from 'jsbarcode';

const { notify, readFromClipboard, copyCanvasImage, exportCanvasToExcel } = useCommon();
const { t, tm } = useI18n();

const height = ref(150);
const sizeOptions = computed(() => [
  { label: t('tool.generator.small'), value: 100 },
  { label: t('tool.generator.medium'), value: 150 },
  { label: t('tool.generator.large'), value: 200 },
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
const barcodeFormat = ref('CODE128');
const formatOptions = [
  { label: 'CODE128', value: 'CODE128' },
  { label: 'CODE39', value: 'CODE39' },
  { label: 'EAN13', value: 'EAN13' },
  { label: 'EAN8', value: 'EAN8' },
  { label: 'UPC', value: 'UPC' },
  { label: 'ITF14', value: 'ITF14' },
  { label: 'MSI', value: 'MSI' },
  { label: 'Pharmacode', value: 'pharmacode' },
  { label: 'Codabar', value: 'codabar' },
];
const formatHints = computed(() => ({
  CODE128: t('tool.generator.barcodeHints.CODE128'),
  CODE39: t('tool.generator.barcodeHints.CODE39'),
  EAN13: t('tool.generator.barcodeHints.EAN13'),
  EAN8: t('tool.generator.barcodeHints.EAN8'),
  UPC: t('tool.generator.barcodeHints.UPC'),
  ITF14: t('tool.generator.barcodeHints.ITF14'),
  MSI: t('tool.generator.barcodeHints.MSI'),
  pharmacode: t('tool.generator.barcodeHints.pharmacode'),
  codabar: t('tool.generator.barcodeHints.codabar'),
}));
const formatExamples = computed(() => tm('examples.generator.barcode'));
const isBatchInput = ref(false);
const batchInputText = ref('');

function isValidBarcode(text) {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, { format: barcodeFormat.value });
    return true;
  } catch {
    return false;
  }
}

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
    notify('warning', t('tool.generator.clipboardNoText'));
  }
}

function showExample() {
  const examples = formatExamples.value[barcodeFormat.value] || formatExamples.value.CODE128;
  if (isBatchInput.value) {
    batchInputText.value = examples.join('\n');
    applyBatchInput(batchInputText.value);
    return;
  }

  const example = examples[0] ?? '';
  resetEntries([
    createEntry(example),
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
  const activeEntries = entries.value.filter(e => hasContent(e) && isValidBarcode(e.content));
  exportCanvasToExcel(activeEntries, 'barcode-', {
    sheetName: t('tool.generator.barcodeSheetName'),
    textHeader: t('tool.generator.barcodeTextHeader'),
    imageHeader: t('tool.generator.barcodeImageHeader'),
    filePrefix: t('tool.generator.barcodeFilePrefix'),
  });
}

</script>

<template>
  <div class="w-full h-full">
    <SplitPanel>
      <template #left>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="warning">{{ t('common.input') }}</n-tag>
            <n-button @click="readClipboard">{{ t('common.clipboard') }}</n-button>
            <n-button @click="showExample">{{ t('common.example') }}</n-button>
            <n-button @click="clear">{{ t('tool.generator.deleteAll') }}</n-button>
            <n-switch v-model:value="isBatchInput" size="large">
              <template #checked>{{ t('tool.generator.batchInput') }}</template>
              <template #unchecked>{{ t('tool.generator.batchInput') }}</template>
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
                  {{ t('tool.generator.delete') }}
                </n-button>
              </div>
              <n-input
                v-model:value="entry.content"
                type="textarea"
                class="w-full h-full entry-input"
                :autosize="{ minRows: inputRows, maxRows: inputRows }"
                :placeholder="t('tool.generator.barcodeInputPlaceholder')"
                @input="val => handleEntryInput(index, val)"
              />
            </div>
          </div>
          <div v-else class="w-full h-full">
            <n-input
              v-model:value="batchInputText"
              type="textarea"
              class="w-full h-full batch-input"
              :placeholder="t('tool.generator.barcodeBatchPlaceholder')"
              @input="onBatchInputChange"
            />
          </div>
        </div>
      </template>
      <template #right>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="success">{{ t('tool.generator.result') }}</n-tag>
            <n-radio-group v-model:value="height" name="sizeRadioGroup">
              <n-radio-button v-for="(item, index) in sizeOptions" :key="index" :value="item.value" :label="item.label"/>
            </n-radio-group>
            <n-color-picker v-model:value="color" :style="{width: '80px'}"
              :swatches="['#18A058','#2080F0','#F0A020','rgba(208, 48, 80, 1)','#000000']"
            />
            <n-select v-model:value="barcodeFormat" :options="formatOptions" :style="{width: '130px'}" />
            <n-button @click="exportToExcel">{{ t('tool.generator.exportExcel') }}</n-button>
          </div>
          <div
            ref="rightScrollRef"
            class="w-full h-full text-lg transition overflow-auto space-y-3"
            @scroll="handleScroll('right', $event)"
          >
            <div v-for="entry in entries" :key="entry.id" class="w-full lk-result-surface p-2 relative" :style="cardStyle">
              <div v-if="hasContent(entry)" class="h-full flex flex-col">
                <template v-if="isValidBarcode(entry.content)">
                  <div class="entry-copy-btn">
                    <n-button size="small" @click="copyCanvasImage(`barcode-${entry.id}`, t('tool.generator.barcodeImageCopied'))">{{ t('common.copy') }}</n-button>
                  </div>
                  <div class="flex-1 flex justify-center items-center overflow-hidden" :id="`barcode-${entry.id}`">
                    <vue-barcode :key="`${entry.id}-${barcodeFormat}`" :value="entry.content" :options="{ format: barcodeFormat, displayValue: false, lineColor: color, height: barcodeSize.height, width: barcodeSize.width }"></vue-barcode>
                  </div>
                </template>
                <div v-else class="flex-1 flex flex-col justify-center items-center text-red-400 text-sm">
                  <div>{{ t('tool.generator.barcodeUnsupported', { format: barcodeFormat }) }}</div>
                  <div class="mt-1 text-gray-400 text-xs">{{ formatHints[barcodeFormat] }}</div>
                </div>
                <div class="text-sm whitespace-pre-wrap break-all text-center max-h-20 overflow-auto w-full px-2">
                {{ entry.content }}
                </div>
              </div>
              <div v-else class="h-full border border-dashed flex items-center justify-center text-gray-400 text-sm empty-result-surface">
                {{ t('tool.generator.pendingInput') }}
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
