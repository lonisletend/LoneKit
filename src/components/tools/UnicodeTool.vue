<script setup>

import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NInput, NSwitch, NTag } from "naive-ui";
import SplitPanel from "../common/SplitPanel.vue";
import { useCommon } from "../../composables/useCommon";
import { useSyncedScroll } from "../../composables/useSyncedScroll";
import { useAutoAppendEntries } from "../../composables/useAutoAppendEntries";
import { useEntryJump } from "../../composables/useEntryJump";

const { notify, copyToClipboard, readFromClipboard } = useCommon();
const { t, tm } = useI18n();

const cardHeight = 220;
const inputRows = 6;
const isBatchInput = ref(false);
const batchSourceText = ref("");
const batchTargetText = ref("");

const { leftScrollRef, rightScrollRef, handleScroll } = useSyncedScroll();

function toHex(value, width) {
  return value.toString(16).toUpperCase().padStart(width, "0");
}

function safeEncode(value) {
  try {
    return Array.from(value ?? "")
      .map((char) => {
        const code = char.codePointAt(0);
        if (code <= 0xffff) {
          return `\\u${toHex(code, 4)}`;
        }
        const high = Math.floor((code - 0x10000) / 0x400) + 0xd800;
        const low = ((code - 0x10000) % 0x400) + 0xdc00;
        return `\\u${toHex(high, 4)}\\u${toHex(low, 4)}`;
      })
      .join("");
  } catch {
    return "";
  }
}

function decodeCodePoint(hex, fallback) {
  const codePoint = Number.parseInt(hex, 16);
  if (Number.isNaN(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
    return fallback;
  }
  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return fallback;
  }
}

function safeDecode(value) {
  try {
    return (value ?? "")
      .replace(/\\u\{([0-9a-fA-F]+)\}/g, (match, hex) => decodeCodePoint(hex, match))
      .replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => decodeCodePoint(hex, match))
      .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => decodeCodePoint(hex, match));
  } catch {
    return "";
  }
}

function createEntry(source = "", target = "") {
  const normalizedSource = source ?? "";
  const normalizedTarget = target ?? "";
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
    source: "",
    target: "",
  };
}

function hasContent(entry) {
  return !!entry.source?.trim() || !!entry.target?.trim();
}

const { entries, ensureEntries, removeEntry, resetEntries } = useAutoAppendEntries(createEntry, hasContent);
const { setInputRef, handleJumpKeydown } = useEntryJump(ensureEntries);

const allSource = computed(() => entries.value.filter(hasContent).map((item) => item.source).join("\n"));
const allTarget = computed(() => entries.value.filter(hasContent).map((item) => item.target).join("\n"));

function handleSourceInput(index, value) {
  const nextSource = value ?? "";
  entries.value[index].source = nextSource;
  entries.value[index].target = nextSource ? safeEncode(nextSource) : "";
  ensureEntries();
}

function handleTargetInput(index, value) {
  const nextTarget = value ?? "";
  entries.value[index].target = nextTarget;
  entries.value[index].source = nextTarget ? safeDecode(nextTarget) : "";
  ensureEntries();
}

function removeRow(index) {
  removeEntry(index);
}

function parseBatchLines(text) {
  return (text ?? "")
    .split(/\r\n|\r|\n/)
    .filter((line) => line.trim() !== "");
}

function syncBatchTextsFromEntries() {
  const activeEntries = entries.value.filter(hasContent);
  batchSourceText.value = activeEntries.map((item) => item.source).join("\n");
  batchTargetText.value = activeEntries.map((item) => item.target).join("\n");
}

function applyBatchSource(text) {
  const lines = parseBatchLines(text);
  if (lines.length === 0) {
    resetEntries();
    batchTargetText.value = "";
    return;
  }
  resetEntries(lines.map((line) => createEntry(line, "")));
  batchTargetText.value = lines.map((line) => safeEncode(line)).join("\n");
}

function applyBatchTarget(text) {
  const lines = parseBatchLines(text);
  if (lines.length === 0) {
    resetEntries();
    batchSourceText.value = "";
    return;
  }
  resetEntries(lines.map((line) => createEntry("", line)));
  batchSourceText.value = lines.map((line) => safeDecode(line)).join("\n");
}

function onBatchSourceInput(value) {
  batchSourceText.value = value ?? "";
  applyBatchSource(batchSourceText.value);
}

function onBatchTargetInput(value) {
  batchTargetText.value = value ?? "";
  applyBatchTarget(batchTargetText.value);
}

watch(isBatchInput, (enabled) => {
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
        entries.value.push(createEntry(text, ""));
      }
    } else {
      const lastIndex = entries.value.length - 1;
      if (!hasContent(entries.value[lastIndex])) {
        entries.value[lastIndex].target = text;
        entries.value[lastIndex].source = safeDecode(text);
      } else {
        entries.value.push(createEntry("", text));
      }
    }
    ensureEntries();
  } else {
    notify('warning', t('tool.codec.noClipboardText'));
  }
}

function showExampleByType(type) {
  if (isBatchInput.value) {
    if (type === 1) {
      batchSourceText.value = tm('examples.codec.plainBatch');
      applyBatchSource(batchSourceText.value);
    } else {
      batchTargetText.value = tm('examples.codec.unicodeBatch');
      applyBatchTarget(batchTargetText.value);
    }
    return;
  }

  if (type === 1) {
    resetEntries([createEntry(tm('examples.codec.plain'), ''), createEntry()]);
  } else {
    resetEntries([createEntry('', tm('examples.codec.unicode')), createEntry()]);
  }
}

function clear() {
  if (isBatchInput.value) {
    batchSourceText.value = "";
    batchTargetText.value = "";
    resetEntries();
    return;
  }

  resetEntries();
}

function copyValue(type) {
  const value = type === 1 ? allSource.value : allTarget.value;
  if (!value) {
    notify('warning', t('tool.codec.noCopyableContent'));
    return;
  }
  copyToClipboard(value);
}

function copyEntryValue(value) {
  if (!value) {
    notify('warning', t('tool.codec.noCopyableContent'));
    return;
  }
  copyToClipboard(value);
}

</script>

<template>
  <div class="w-full h-full">
    <SplitPanel>
      <template #left>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="warning">{{ t('tool.codec.encode') }}</n-tag>
            <n-button @click="readClipboardByType(1)">{{ t('common.clipboard') }}</n-button>
            <n-button @click="showExampleByType(1)">{{ t('common.example') }}</n-button>
            <n-button @click="clear">{{ t('tool.codec.deleteAll') }}</n-button>
            <n-button @click="copyValue(1)">{{ t('tool.codec.copyAll') }}</n-button>
            <n-switch v-model:value="isBatchInput" size="large">
              <template #checked>{{ t('tool.codec.batchInput') }}</template>
              <template #unchecked>{{ t('tool.codec.batchInput') }}</template>
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
                <n-button size="small" @click="copyEntryValue(entry.source)">{{ t('common.copy') }}</n-button>
                <n-button size="small" @click="removeRow(index)" :disabled="entries.length === 1">{{ t('tool.codec.delete') }}</n-button>
              </div>
              <n-input
                v-model:value="entry.source"
                :ref="(el) => setInputRef('left', index, el)"
                type="textarea"
                class="w-full h-full entry-input"
                :autosize="{ minRows: inputRows, maxRows: inputRows }"
                :placeholder="t('tool.codec.plainInputPlaceholder')"
                @input="(val) => handleSourceInput(index, val)"
                @keydown="(event) => handleJumpKeydown(event, 'left', index)"
              />
            </div>
          </div>
          <div v-else class="w-full h-full">
            <n-input
              v-model:value="batchSourceText"
              type="textarea"
              class="w-full h-full batch-input"
              :placeholder="t('tool.codec.batchPlainEncodePlaceholder')"
              @input="onBatchSourceInput"
            />
          </div>
        </div>
      </template>
      <template #right>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="success">{{ t('tool.codec.decode') }}</n-tag>
            <n-button @click="readClipboardByType(2)">{{ t('common.clipboard') }}</n-button>
            <n-button @click="showExampleByType(2)">{{ t('common.example') }}</n-button>
            <n-button @click="copyValue(2)">{{ t('tool.codec.copyAll') }}</n-button>
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
                <n-button size="small" @click="copyEntryValue(entry.target)">{{ t('common.copy') }}</n-button>
                <n-button size="small" @click="removeRow(index)" :disabled="entries.length === 1">{{ t('tool.codec.delete') }}</n-button>
              </div>
              <n-input
                v-model:value="entry.target"
                :ref="(el) => setInputRef('right', index, el)"
                type="textarea"
                class="w-full h-full entry-input"
                :autosize="{ minRows: inputRows, maxRows: inputRows }"
                :placeholder="t('tool.codec.unicodeInputPlaceholder')"
                @input="(val) => handleTargetInput(index, val)"
                @keydown="(event) => handleJumpKeydown(event, 'right', index)"
              />
            </div>
          </div>
          <div v-else class="w-full h-full">
            <n-input
              v-model:value="batchTargetText"
              type="textarea"
              class="w-full h-full batch-input"
              :placeholder="t('tool.codec.batchUnicodeDecodePlaceholder')"
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
