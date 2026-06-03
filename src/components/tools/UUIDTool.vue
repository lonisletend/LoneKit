<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NInput, NInputNumber, NSelect, NTag } from "naive-ui";
import SplitPanel from "../common/SplitPanel.vue";
import { useCommon } from "../../composables/useCommon";

const { notify, copyToClipboard } = useCommon();
const { t } = useI18n();

const version = ref("v4");
const count = ref(20);
const uuidList = ref([]);
const parseInput = ref("");
const useHyphen = ref(true);
const isUpperCase = ref(true);

const versionOptions = [{ label: "v4", value: "v4" }];

const caseLabel = computed(() => (isUpperCase.value ? "A" : "a"));

const uuidText = computed(() => uuidList.value.map((item) => formatUuidValue(item)).join("\n"));

const parseResult = computed(() => parseUuid(parseInput.value));

function generateUuidV4() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback when randomUUID is unavailable.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateUuids() {
  const size = Number(count.value) || 0;
  if (size <= 0) {
    notify("warning", t("tool.uuid.countMustPositive"));
    return;
  }

  if (size > 1000) {
    notify("warning", t("tool.uuid.countMax"));
    return;
  }

  if (version.value !== "v4") {
    notify("warning", t("tool.uuid.onlyV4"));
    return;
  }

  const values = Array.from({ length: size }, () => generateUuidV4());
  uuidList.value = values;
}

function formatUuidValue(value) {
  if (!value) {
    return "";
  }
  const hyphenValue = useHyphen.value ? value : value.replace(/-/g, "");
  return isUpperCase.value ? hyphenValue.toUpperCase() : hyphenValue.toLowerCase();
}

function toggleHyphen() {
  useHyphen.value = !useHyphen.value;
}

function toggleCase() {
  isUpperCase.value = !isUpperCase.value;
}

function clearGenerated() {
  uuidList.value = [];
}

function copyAll() {
  if (!uuidList.value.length) {
    notify("warning", t("tool.uuid.noCopyableUuid"));
    return;
  }
  copyToClipboard(uuidText.value);
}

function takeOne() {
  if (!uuidList.value.length) {
    notify("warning", t("tool.uuid.noUuidToTake"));
    return;
  }

  const [picked] = uuidList.value.splice(0, 1);
  copyToClipboard(formatUuidValue(picked), t("tool.uuid.copiedOne"));
}

function parseVariant(nibble) {
  const value = parseInt(nibble, 16);
  if (Number.isNaN(value)) {
    return t("tool.uuid.unknown");
  }

  if ((value & 0x8) === 0x0) {
    return t("tool.uuid.ncsVariant");
  }
  if ((value & 0xc) === 0x8) {
    return "RFC 4122 / RFC 9562 (10xx)";
  }
  if ((value & 0xe) === 0xc) {
    return t("tool.uuid.microsoftVariant");
  }
  return t("tool.uuid.reservedVariant");
}

function versionDescription(versionNumber) {
  const key = `tool.uuid.versions.${versionNumber}`;
  const translated = t(key);
  return translated === key ? t("tool.uuid.nonStandardVersion", { version: versionNumber }) : translated;
}

function parseUuid(value) {
  const raw = (value || "").trim();
  if (!raw) {
    return null;
  }

  const input = raw.toLowerCase();
  const dashedPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const compactPattern = /^[0-9a-f]{32}$/;
  const isDashed = dashedPattern.test(input);
  const isCompact = compactPattern.test(input);

  if (!isDashed && !isCompact) {
    return {
      valid: false,
      raw,
      normalized: input,
      message: t("tool.uuid.invalidFormat"),
    };
  }

  const compact = input.replace(/-/g, "");
  const normalized = `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`;
  const versionNumber = parseInt(compact[12], 16);
  const variantNibble = compact[16];

  return {
    valid: true,
    raw,
    normalized,
    versionNumber,
    versionInfo: versionDescription(versionNumber),
    variant: parseVariant(variantNibble),
    variantNibble: variantNibble.toUpperCase(),
  };
}

onMounted(() => {
  generateUuids();
});
</script>

<template>
  <div class="w-full h-full">
    <SplitPanel>
      <template #left>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-3">
            <n-tag size="large" type="warning">{{ t('tool.uuid.generate') }}</n-tag>
            <n-select
              v-model:value="version"
              :options="versionOptions"
              :style="{ width: '80px' }"
            />
            <n-input-number
              v-model:value="count"
              :show-button="false"
              :min="1"
              :max="1000"
              :style="{ width: '80px' }"
              :placeholder="t('tool.uuid.generateCountPlaceholder')"
            />
            <n-button :type="useHyphen ? 'success' : 'default'" @click="toggleHyphen">-</n-button>
            <n-button @click="toggleCase">{{ caseLabel }}</n-button>
            <n-button @click="generateUuids">{{ t('tool.uuid.generateButton') }}</n-button>
            <n-button @click="clearGenerated">{{ t('common.clear') }}</n-button>
            <n-button @click="copyAll">{{ t('common.copy') }}</n-button>
            <n-button @click="takeOne">{{ t('tool.uuid.takeOne') }}</n-button>
          </div>
          <div class="flex-1 w-full overflow-hidden">
            <n-input
              :value="uuidText"
              type="textarea"
              class="w-full h-full text-lg"
              :placeholder="t('tool.uuid.generateResultPlaceholder')"
              readonly
            />
          </div>
        </div>
      </template>

      <template #right>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-3">
            <n-tag size="large" type="success">{{ t('tool.uuid.parse') }}</n-tag>
            <n-input
              v-model:value="parseInput"
              :placeholder="t('tool.uuid.parsePlaceholder')"
              clearable
            />
          </div>
          <div class="flex-1 w-full overflow-auto text-sm lk-result-surface lk-result-surface-padded">
            <div v-if="!parseResult" class="text-gray-500">{{ t('tool.uuid.emptyParse') }}</div>
            <div v-else-if="!parseResult.valid" class="space-y-2">
              <div class="text-red-500">{{ parseResult.message }}</div>
              <div><strong>{{ t('tool.uuid.fields.input') }}:</strong> {{ parseResult.raw }}</div>
            </div>
            <div v-else class="space-y-2">
              <div><strong>{{ t('tool.uuid.fields.valid') }}:</strong> {{ t('tool.uuid.fields.yes') }}</div>
              <div><strong>{{ t('tool.uuid.fields.normalized') }}:</strong> {{ parseResult.normalized }}</div>
              <div><strong>{{ t('tool.uuid.fields.version') }}:</strong> {{ parseResult.versionInfo }}</div>
              <div><strong>{{ t('tool.uuid.fields.versionNumber') }}:</strong> {{ parseResult.versionNumber }}</div>
              <div><strong>{{ t('tool.uuid.fields.variant') }}:</strong> {{ parseResult.variant }}</div>
              <div><strong>{{ t('tool.uuid.fields.variantBits') }}:</strong> {{ parseResult.variantNibble }}</div>
            </div>
          </div>
        </div>
      </template>
    </SplitPanel>
  </div>
</template>

<style scoped></style>
