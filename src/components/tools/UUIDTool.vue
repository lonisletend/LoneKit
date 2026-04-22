<script setup>
import { computed, ref } from "vue";
import { NButton, NInput, NInputNumber, NSelect, NTag } from "naive-ui";
import SplitPanel from "../common/SplitPanel.vue";
import { useCommon } from "../../composables/useCommon";

const { notify, copyToClipboard } = useCommon();

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
    notify("warning", "生成个数必须大于 0");
    return;
  }

  if (size > 1000) {
    notify("warning", "单次最多生成 1000 个");
    return;
  }

  if (version.value !== "v4") {
    notify("warning", "当前仅支持 v4");
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
    notify("warning", "没有可复制的 UUID");
    return;
  }
  copyToClipboard(uuidText.value, "复制成功!");
}

function takeOne() {
  if (!uuidList.value.length) {
    notify("warning", "没有可取的 UUID");
    return;
  }

  const [picked] = uuidList.value.splice(0, 1);
  copyToClipboard(formatUuidValue(picked), "已复制 1 个 UUID");
}

function parseVariant(nibble) {
  const value = parseInt(nibble, 16);
  if (Number.isNaN(value)) {
    return "未知";
  }

  if ((value & 0x8) === 0x0) {
    return "NCS 兼容 (0xxx)";
  }
  if ((value & 0xc) === 0x8) {
    return "RFC 4122 / RFC 9562 (10xx)";
  }
  if ((value & 0xe) === 0xc) {
    return "Microsoft 兼容 (110x)";
  }
  return "保留 (111x)";
}

function versionDescription(versionNumber) {
  const map = {
    1: "v1: 基于时间与节点",
    2: "v2: DCE 安全 UUID",
    3: "v3: 基于 MD5 的命名空间 UUID",
    4: "v4: 随机 UUID",
    5: "v5: 基于 SHA-1 的命名空间 UUID",
    6: "v6: 可排序的时间 UUID",
    7: "v7: Unix 时间戳 + 随机",
    8: "v8: 自定义格式 UUID",
  };
  return map[versionNumber] || `v${versionNumber}: 未知或非标准版本`;
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
      message: "不是合法的 UUID 格式",
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
</script>

<template>
  <div class="w-full h-full">
    <SplitPanel>
      <template #left>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-3">
            <n-tag size="large" type="warning">生成</n-tag>
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
              placeholder="生成个数"
            />
            <n-button :type="useHyphen ? 'success' : 'default'" @click="toggleHyphen">-</n-button>
            <n-button @click="toggleCase">{{ caseLabel }}</n-button>
            <n-button @click="generateUuids">生成</n-button>
            <n-button @click="clearGenerated">清空</n-button>
            <n-button @click="copyAll">复制</n-button>
            <n-button @click="takeOne">取一个</n-button>
          </div>
          <div class="flex-1 w-full overflow-hidden">
            <n-input
              :value="uuidText"
              type="textarea"
              class="w-full h-full text-lg"
              placeholder="生成结果"
              readonly
            />
          </div>
        </div>
      </template>

      <template #right>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-3">
            <n-tag size="large" type="success">解析</n-tag>
            <n-input
              v-model:value="parseInput"
              placeholder="输入任意版本 UUID，如：550e8400-e29b-41d4-a716-446655440000"
              clearable
            />
          </div>
          <div class="flex-1 w-full overflow-auto border border-gray-300 rounded p-3 text-sm">
            <div v-if="!parseResult" class="text-gray-500">请输入 UUID</div>
            <div v-else-if="!parseResult.valid" class="space-y-2">
              <div class="text-red-500">{{ parseResult.message }}</div>
              <div><strong>输入值:</strong> {{ parseResult.raw }}</div>
            </div>
            <div v-else class="space-y-2">
              <div><strong>合法性:</strong> 是</div>
              <div><strong>标准化:</strong> {{ parseResult.normalized }}</div>
              <div><strong>版本:</strong> {{ parseResult.versionInfo }}</div>
              <div><strong>版本号:</strong> {{ parseResult.versionNumber }}</div>
              <div><strong>变体:</strong> {{ parseResult.variant }}</div>
              <div><strong>变体位:</strong> {{ parseResult.variantNibble }}</div>
            </div>
          </div>
        </div>
      </template>
    </SplitPanel>
  </div>
</template>

<style scoped></style>
