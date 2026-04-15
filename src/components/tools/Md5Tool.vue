<script setup>

import { computed, ref, watch } from "vue";
import { NButton, NInput, NSwitch, NTag } from "naive-ui";
import md5 from 'blueimp-md5';
import SplitPanel from '../common/SplitPanel.vue'
import { useCommon } from '../../composables/useCommon';
import { useSyncedScroll } from '../../composables/useSyncedScroll';
import { useAutoAppendEntries } from '../../composables/useAutoAppendEntries';

const { notify, copyToClipboard, readFromClipboard } = useCommon();

const cardHeight = 220;
const inputRows = 6;
const isBatchInput = ref(false);
const batchSourceText = ref('');
const batchTargetText = ref('');

const { leftScrollRef, rightScrollRef, handleScroll } = useSyncedScroll();

function createEntry(source = '') {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source,
    target: source ? md5(source) : '',
  };
}

function hasContent(entry) {
  return !!entry.source?.trim();
}

const { entries, ensureEntries, removeEntry, resetEntries } = useAutoAppendEntries(createEntry, hasContent);

const allResults = computed(() => entries.value
  .filter(hasContent)
  .map(item => item.target)
  .join('\n'));

function handleSourceInput(index, value) {
  const nextValue = value ?? '';
  entries.value[index].source = nextValue;
  entries.value[index].target = nextValue ? md5(nextValue) : '';
  ensureEntries();
}

function removeRow(index) {
  removeEntry(index);
}

function parseBatchLines(text) {
  return (text ?? '')
    .split(/\r\n|\r|\n/)
    .filter(line => line.trim() !== '');
}

function syncBatchTextsFromEntries() {
  const activeEntries = entries.value.filter(hasContent);
  batchSourceText.value = activeEntries.map(item => item.source).join('\n');
  batchTargetText.value = activeEntries.map(item => item.target).join('\n');
}

function applyBatchSource(text) {
  const lines = parseBatchLines(text);
  if (lines.length === 0) {
    resetEntries();
    batchTargetText.value = '';
    return;
  }
  resetEntries(lines.map(line => createEntry(line)));
  batchTargetText.value = lines.map(line => md5(line)).join('\n');
}

function onBatchSourceInput(value) {
  batchSourceText.value = value ?? '';
  applyBatchSource(batchSourceText.value);
}

watch(isBatchInput, enabled => {
  if (!enabled) {
    return;
  }
  syncBatchTextsFromEntries();
  applyBatchSource(batchSourceText.value);
});

async function readClipboard() {
  const text = await readFromClipboard();
  if (text) {
    if (isBatchInput.value) {
      batchSourceText.value = text;
      applyBatchSource(batchSourceText.value);
      return;
    }

    const lastIndex = entries.value.length - 1;
    if (!hasContent(entries.value[lastIndex])) {
      entries.value[lastIndex].source = text;
      entries.value[lastIndex].target = md5(text);
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
    batchSourceText.value = 'test\nLoneKit';
    applyBatchSource(batchSourceText.value);
    return;
  }

  resetEntries([
    createEntry('test'),
    createEntry(),
  ]);
}

function clear() {
  if (isBatchInput.value) {
    batchSourceText.value = '';
    applyBatchSource(batchSourceText.value);
    return;
  }

  resetEntries();
}

function copyValue(value) {
  if (!value) {
    notify('warning', '没有可复制内容');
    return;
  }
  copyToClipboard(value, '复制成功!');
}

</script>

<template>
  <div class="w-full h-full">
    <SplitPanel>
      <template #left>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="warning">加密</n-tag>
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
            <div
              v-for="(entry, index) in entries"
              :key="entry.id"
              class="relative rounded"
              :style="{ height: `${cardHeight}px` }"
            >
              <div class="entry-actions">
                <n-button
                  size="small"
                  @click="copyValue(entry.source)"
                >
                  复制
                </n-button>
                <n-button
                  size="small"
                  @click="removeRow(index)"
                  :disabled="entries.length === 1"
                >
                  删除
                </n-button>
              </div>
              <n-input
                v-model:value="entry.source"
                type="textarea"
                class="w-full h-full entry-input"
                :autosize="{ minRows: inputRows, maxRows: inputRows }"
                placeholder="输入字符串"
                @input="val => handleSourceInput(index, val)"
              />
            </div>
          </div>
          <div v-else class="w-full h-full">
            <n-input
              v-model:value="batchSourceText"
              type="textarea"
              class="w-full h-full batch-input"
              placeholder="每行一条内容，按换行分割批量加密"
              @input="onBatchSourceInput"
            />
          </div>
        </div>
      </template>
      <template #right>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="success">结果</n-tag>
            <n-button @click="copyValue(allResults)">复制全部</n-button>
          </div>
          <div
            v-if="!isBatchInput"
            ref="rightScrollRef"
            class="w-full h-full text-lg transition overflow-auto space-y-3"
            @scroll="handleScroll('right', $event)"
          >
            <div
              v-for="(entry, index) in entries"
              :key="entry.id"
              class="relative rounded"
              :style="{ height: `${cardHeight}px` }"
            >
              <div class="entry-actions">
                <n-button
                  size="small"
                  @click="copyValue(entry.target)"
                >
                  复制
                </n-button>
                <n-button
                  size="small"
                  @click="removeRow(index)"
                  :disabled="entries.length === 1"
                >
                  删除
                </n-button>
              </div>
              <n-input
                :value="entry.target"
                type="textarea"
                class="w-full h-full entry-input"
                :autosize="{ minRows: inputRows, maxRows: inputRows }"
                placeholder="加密结果"
                :readonly="true"
              />
            </div>
          </div>
          <div v-else class="w-full h-full">
            <n-input
              :value="batchTargetText"
              type="textarea"
              class="w-full h-full batch-input"
              placeholder="批量加密结果"
              :readonly="true"
            />
          </div>
        </div>
      </template>
    </SplitPanel>
  </div>
</template>

<style scoped>

.entry-actions {
  position: absolute;
  right: 5px;
  bottom: 5px;
  z-index: 10;
  display: flex;
  gap: 6px;
}

.entry-input :deep(textarea) {
  padding-right: 128px;
  padding-bottom: 30px;
}

.batch-input :deep(textarea) {
  height: 100%;
}

</style>
