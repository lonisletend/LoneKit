<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NInput, NTag } from "naive-ui";
import SplitPanel from "../common/SplitPanel.vue";
import { useCommon } from "../../composables/useCommon";

const { readFromClipboard, copyToClipboard } = useCommon();
const { t } = useI18n();

const source = ref("");

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "0 B";
  }

  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const base = 1024;
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(base)), units.length - 1);
  const value = bytes / Math.pow(base, unitIndex);
  const display = value >= 10 || unitIndex === 0 ? value.toFixed(1) : value.toFixed(2);

  return `${display.replace(/\.0$/, "")} ${units[unitIndex]}`;
}

function formatReadingTime(wordCount) {
  if (!Number.isFinite(wordCount) || wordCount <= 0) {
    return t("tool.textCount.zeroSeconds");
  }

  // Mixed Chinese/English reading speed baseline.
  const wordsPerMinute = 300;
  const totalSeconds = Math.max(1, Math.round((wordCount / wordsPerMinute) * 60));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return t("tool.textCount.seconds", { seconds });
  }

  if (seconds === 0) {
    return t("tool.textCount.minutes", { minutes });
  }

  return t("tool.textCount.minutesSeconds", { minutes, seconds });
}

const stats = computed(() => {
  const text = source.value || "";
  const trimmed = text.trim();
  const noWhitespace = text.replace(/\s/g, "");
  const words = text.match(/[A-Za-z0-9_]+|[\u4E00-\u9FFF]/g) || [];
  const lines = text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((item) => item.trim().length > 0).length : 0;
  const bytes = new TextEncoder().encode(text).length;
  const readingTime = formatReadingTime(words.length);

  return {
    chars: text.length,
    charsNoWhitespace: noWhitespace.length,
    words: words.length,
    lines,
    paragraphs,
    bytes,
    bytesHuman: formatBytes(bytes),
    readingTime,
  };
});

async function readClipboard() {
  const text = await readFromClipboard();
  if (text !== null && text !== undefined) {
    source.value = text;
  }
}

function showExample() {
  source.value = `Here’s to the crazy ones. \nThe misfits. \nThe rebels. \nThe troublemakers. \nThe round pegs in the square holes. \nThe ones who see things differently. \nThey’re not fond of rules. \nAnd they have no respect for the status quo. \nYou can quote them, disagree with them, glorify or vilify them. \nAbout the only thing you can’t do is ignore them. \nBecause they change things. \nThey push the human race forward. \nAnd while some may see them as the crazy ones, we see genius. \nBecause the people who are crazy enough to think they can change the world, are the ones who do.`;
}

function clearAll() {
  source.value = "";
}

function copySource() {
  copyToClipboard(source.value);
}
</script>

<template>
  <div class="w-full h-full">
    <SplitPanel :default-size="0.75">
      <template #left>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="warning">{{ t('common.input') }}</n-tag>
            <n-button @click="readClipboard">{{ t('common.clipboard') }}</n-button>
            <n-button @click="showExample">{{ t('common.example') }}</n-button>
            <n-button @click="clearAll">{{ t('common.clear') }}</n-button>
            <n-button @click="copySource">{{ t('common.copy') }}</n-button>
          </div>
          <div class="w-full h-full text-xl">
            <n-input
              v-model:value="source"
              type="textarea"
              class="w-full h-full"
              :placeholder="t('tool.textCount.inputPlaceholder')"
            />
          </div>
        </div>
      </template>

      <template #right>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="success">{{ t('tool.textCount.stats') }}</n-tag>
          </div>
          <div class="flex-1 overflow-auto space-y-2 pr-1">
            <div class="stat-row">
              <span class="text-slate-600 dark:text-slate-300">{{ t('tool.textCount.chars') }}</span>
              <span class="stat-value">{{ stats.chars }}</span>
            </div>
            <div class="stat-row">
              <span class="text-slate-600 dark:text-slate-300">{{ t('tool.textCount.charsNoWhitespace') }}</span>
              <span class="stat-value">{{ stats.charsNoWhitespace }}</span>
            </div>
            <div class="stat-row">
              <span class="text-slate-600 dark:text-slate-300">{{ t('tool.textCount.words') }}</span>
              <span class="stat-value">{{ stats.words }}</span>
            </div>
            <div class="stat-row">
              <span class="text-slate-600 dark:text-slate-300">{{ t('tool.textCount.lines') }}</span>
              <span class="stat-value">{{ stats.lines }}</span>
            </div>
            <div class="stat-row">
              <span class="text-slate-600 dark:text-slate-300">{{ t('tool.textCount.paragraphs') }}</span>
              <span class="stat-value">{{ stats.paragraphs }}</span>
            </div>
            <div class="stat-row">
              <span class="text-slate-600 dark:text-slate-300">{{ t('tool.textCount.bytesUtf8') }}</span>
              <span class="stat-value">{{ stats.bytes === 0 ? stats.bytes : `${stats.bytes} (${stats.bytesHuman})` }}</span>
            </div>
            <div class="stat-row">
              <span class="text-slate-600 dark:text-slate-300">{{ t('tool.textCount.readingTime') }}</span>
              <span class="stat-value">{{ stats.readingTime }}</span>
            </div>
          </div>
        </div>
      </template>
    </SplitPanel>
  </div>
</template>

<style scoped>
.stat-row {
  @apply w-full flex items-center justify-between px-3 py-2;
  border: 1px solid var(--lk-surface-border);
  border-radius: var(--lk-surface-radius);
  background: var(--lk-surface-bg);
}

.stat-value {
  @apply text-base font-semibold text-green-600 dark:text-green-400 tabular-nums;
}
</style>
