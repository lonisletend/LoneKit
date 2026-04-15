<script setup>

import { computed, ref, watch } from "vue";
import { NButton, NInput, NSwitch, NTag } from "naive-ui";
import { encode, decode } from 'js-base64';
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

function safeEncode(value) {
  try {
    return encode(value);
  } catch {
    return '';
  }
}

function safeDecode(value) {
  try {
    return decode(value);
  } catch {
    return '';
  }
}

function createEntry(source = '', target = '') {
  const normalizedSource = source ?? '';
  const normalizedTarget = target ?? '';
  if (normalizedSource) {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source: normalizedSource,
      target: safeEncode(normalizedSource),
    };
  }
  if (normalizedTarget) {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source: safeDecode(normalizedTarget),
      target: normalizedTarget,
    };
  }
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source: '',
    target: '',
  };
}

function hasContent(entry) {
  return !!entry.source?.trim() || !!entry.target?.trim();
}

const { entries, ensureEntries, removeEntry, resetEntries } = useAutoAppendEntries(createEntry, hasContent);

const allSource = computed(() => entries.value.filter(hasContent).map(item => item.source).join('\n'));
const allTarget = computed(() => entries.value.filter(hasContent).map(item => item.target).join('\n'));

function handleSourceInput(index, value) {
  const nextSource = value ?? '';
  entries.value[index].source = nextSource;
  entries.value[index].target = nextSource ? safeEncode(nextSource) : '';
  ensureEntries();
}

function handleTargetInput(index, value) {
  const nextTarget = value ?? '';
  entries.value[index].target = nextTarget;
  entries.value[index].source = nextTarget ? safeDecode(nextTarget) : '';
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
  resetEntries(lines.map(line => createEntry(line, '')));
  batchTargetText.value = lines.map(line => safeEncode(line)).join('\n');
}

function applyBatchTarget(text) {
  const lines = parseBatchLines(text);
  if (lines.length === 0) {
    resetEntries();
    batchSourceText.value = '';
    return;
  }
  resetEntries(lines.map(line => createEntry('', line)));
  batchSourceText.value = lines.map(line => safeDecode(line)).join('\n');
}

function onBatchSourceInput(value) {
  batchSourceText.value = value ?? '';
  applyBatchSource(batchSourceText.value);
}

function onBatchTargetInput(value) {
  batchTargetText.value = value ?? '';
  applyBatchTarget(batchTargetText.value);
}

watch(isBatchInput, enabled => {
  if (!enabled) {
    return;
  }
  syncBatchTextsFromEntries();
  applyBatchSource(batchSourceText.value);
});

async function readClipboardByType(type) {
  const text = await readFromClipboard();
  if (text) {
    if (isBatchInput.value) {
      if (type === 1) {
        batchSourceText.value = text;
        applyBatchSource(batchSourceText.value);
      } else {
        batchTargetText.value = text;
        applyBatchTarget(batchTargetText.value);
      }
      return;
    }

    if (type === 1) {
      const lastIndex = entries.value.length - 1;
      if (!hasContent(entries.value[lastIndex])) {
        entries.value[lastIndex].source = text;
        entries.value[lastIndex].target = safeEncode(text);
      } else {
        entries.value.push(createEntry(text, ''));
      }
    } else {
      const lastIndex = entries.value.length - 1;
      if (!hasContent(entries.value[lastIndex])) {
        entries.value[lastIndex].target = text;
        entries.value[lastIndex].source = safeDecode(text);
      } else {
        entries.value.push(createEntry('', text));
      }
    }
    ensureEntries();
  } else {
    notify('warning', '剪贴板中没有可用文本');
  }
}

function showExampleByType(type) {
  if (isBatchInput.value) {
    if (type === 1) {
      batchSourceText.value = 'test\nLoneKit';
      applyBatchSource(batchSourceText.value);
    } else {
      batchTargetText.value = 'dGVzdA==\nTG9uZUtpdA==';
      applyBatchTarget(batchTargetText.value);
    }
    return;
  }

  if (type === 1) {
    resetEntries([
      createEntry('test', ''),
      createEntry(),
    ]);
  } else {
    resetEntries([
      createEntry('', 'dGVzdA=='),
      createEntry(),
    ]);
  }
}

function clear() {
  if (isBatchInput.value) {
    batchSourceText.value = '';
    batchTargetText.value = '';
    resetEntries();
    return;
  }

  resetEntries();
}

function copyValue(type) {
  const value = type === 1 ? allSource.value : allTarget.value;
  if (!value) {
    notify('warning', '没有可复制内容');
    return;
  }
  copyToClipboard(value, '复制成功!');
}

function copyEntryValue(value) {
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
            <n-tag size="large" type="warning">编码</n-tag>
            <n-button @click="readClipboardByType(1)">剪贴板</n-button>
            <n-button @click="showExampleByType(1)">示例</n-button>
            <n-button @click="clear">删除全部</n-button>
            <n-button @click="copyValue(1)">复制全部</n-button>
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
                <n-button size="small" @click="copyEntryValue(entry.source)">复制</n-button>
                <n-button size="small" @click="removeRow(index)" :disabled="entries.length === 1">删除</n-button>
              </div>
              <n-input
                v-model:value="entry.source"
                type="textarea"
                class="w-full h-full entry-input"
                :autosize="{ minRows: inputRows, maxRows: inputRows }"
                placeholder="输入原文字符串"
                @input="val => handleSourceInput(index, val)"
              />
            </div>
          </div>
          <div v-else class="w-full h-full">
            <n-input
              v-model:value="batchSourceText"
              type="textarea"
              class="w-full h-full batch-input"
              placeholder="每行一条原文，按换行分割批量编码"
              @input="onBatchSourceInput"
            />
          </div>
        </div>
      </template>
      <template #right>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="success">解码</n-tag>
            <n-button @click="readClipboardByType(2)">剪贴板</n-button>
            <n-button @click="showExampleByType(2)">示例</n-button>
            <n-button @click="copyValue(2)">复制全部</n-button>
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
                <n-button size="small" @click="copyEntryValue(entry.target)">复制</n-button>
                <n-button size="small" @click="removeRow(index)" :disabled="entries.length === 1">删除</n-button>
              </div>
              <n-input
                v-model:value="entry.target"
                type="textarea"
                class="w-full h-full entry-input"
                :autosize="{ minRows: inputRows, maxRows: inputRows }"
                placeholder="输入 Base64 字符串"
                @input="val => handleTargetInput(index, val)"
              />
            </div>
          </div>
          <div v-else class="w-full h-full">
            <n-input
              v-model:value="batchTargetText"
              type="textarea"
              class="w-full h-full batch-input"
              placeholder="每行一条 Base64，按换行分割批量解码"
              @input="onBatchTargetInput"
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