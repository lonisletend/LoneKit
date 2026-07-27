<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { NInput, NInputNumber, NSelect, NTag } from "naive-ui";
import { CRON_FIELD_DEFINITIONS, parseCronField, stringifyCronField } from "../../../utils/cronUtil";

const props = defineProps({
  fieldKey: { type: String, required: true },
  modelValue: { type: Object, required: true },
});
const emit = defineEmits(["update:modelValue", "invalid"]);
const { t } = useI18n();

const definition = computed(() => CRON_FIELD_DEFINITIONS[props.fieldKey]);
const listText = ref("");

const typeOptions = computed(() => [
  { label: t("tool.cron.types.any"), value: "any" },
  { label: t("tool.cron.types.value"), value: "value" },
  { label: t("tool.cron.types.range"), value: "range" },
  { label: t("tool.cron.types.step"), value: "step" },
  { label: t("tool.cron.types.list"), value: "list" },
]);
const stepBaseOptions = computed(() => [
  { label: t("tool.cron.types.any"), value: "any" },
  { label: t("tool.cron.types.range"), value: "range" },
]);

watch(
  () => props.modelValue,
  (field) => {
    if (field?.type === "list") listText.value = stringifyCronField(field);
  },
  { immediate: true, deep: true }
);

function emitField(field) {
  emit("update:modelValue", field);
}

function changeType(type) {
  const { min, max } = definition.value;
  const factories = {
    any: () => ({ type: "any" }),
    value: () => ({ type: "value", value: min }),
    range: () => ({ type: "range", from: min, to: max }),
    step: () => ({ type: "step", base: { type: "any" }, step: 1 }),
    list: () => ({
      type: "list",
      items: [
        { type: "value", value: min },
        { type: "value", value: Math.min(min + 1, max) },
      ],
    }),
  };
  emitField(factories[type]());
}

function updateProperty(property, value) {
  if (value === null || value === undefined) return;
  emitField({ ...props.modelValue, [property]: value });
}

function changeStepBase(type) {
  const { min, max } = definition.value;
  updateProperty("base", type === "any" ? { type: "any" } : { type: "range", from: min, to: max });
}

function updateStepBase(property, value) {
  if (value === null || value === undefined) return;
  updateProperty("base", { ...props.modelValue.base, [property]: value });
}

function commitList() {
  try {
    const field = parseCronField(listText.value, props.fieldKey);
    if (field.type !== "list") throw new Error(t("tool.cron.listRequiresMultiple"));
    emitField(field);
  } catch (error) {
    emit("invalid", error.message);
    listText.value = stringifyCronField(props.modelValue);
  }
}
</script>

<template>
  <section class="cron-field-block">
    <div class="cron-field-heading">
      <n-tag size="large" type="info">{{ t(`tool.cron.fields.${fieldKey}`) }}</n-tag>
      <span class="cron-field-bounds">{{ definition.min }} - {{ definition.max }}</span>
      <code>{{ stringifyCronField(modelValue) }}</code>
    </div>

    <div class="cron-field-controls">
      <n-select
        class="cron-type-select"
        :value="modelValue.type"
        :options="typeOptions"
        @update:value="changeType"
      />

      <n-input-number
        v-if="modelValue.type === 'value'"
        class="cron-number-control"
        :value="modelValue.value"
        :min="definition.min"
        :max="definition.max"
        :precision="0"
        @update:value="(value) => updateProperty('value', value)"
      />

      <template v-else-if="modelValue.type === 'range'">
        <n-input-number class="cron-number-control" :value="modelValue.from" :min="definition.min" :max="definition.max" :precision="0"
          @update:value="(value) => updateProperty('from', value)" />
        <span>{{ t('tool.cron.to') }}</span>
        <n-input-number class="cron-number-control" :value="modelValue.to" :min="definition.min" :max="definition.max" :precision="0"
          @update:value="(value) => updateProperty('to', value)" />
      </template>

      <template v-else-if="modelValue.type === 'step'">
        <n-select class="cron-step-base-select" :value="modelValue.base.type" :options="stepBaseOptions" @update:value="changeStepBase" />
        <template v-if="modelValue.base.type === 'range'">
          <n-input-number class="cron-number-control" :value="modelValue.base.from" :min="definition.min" :max="definition.max" :precision="0"
            @update:value="(value) => updateStepBase('from', value)" />
          <span>{{ t('tool.cron.to') }}</span>
          <n-input-number class="cron-number-control" :value="modelValue.base.to" :min="definition.min" :max="definition.max" :precision="0"
            @update:value="(value) => updateStepBase('to', value)" />
        </template>
        <span>/</span>
        <n-input-number class="cron-number-control" :value="modelValue.step" :min="1" :precision="0"
          @update:value="(value) => updateProperty('step', value)" />
      </template>

      <n-input
        v-else-if="modelValue.type === 'list'"
        v-model:value="listText"
        class="cron-list-control"
        :placeholder="t('tool.cron.listPlaceholder')"
        @blur="commitList"
        @keyup.enter="commitList"
      />
    </div>
  </section>
</template>

<style scoped>
.cron-field-block {
  padding: 12px;
  border: 1px solid var(--lk-surface-border);
  border-radius: 6px;
}

.cron-field-heading,
.cron-field-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.cron-field-heading {
  margin-bottom: 10px;
}

.cron-field-heading code {
  margin-left: auto;
  font-size: 13px;
}

.cron-field-bounds {
  color: #64748b;
  font-size: 12px;
}

.cron-type-select,
.cron-step-base-select {
  width: 132px;
}

.cron-number-control {
  width: 116px;
}

.cron-list-control {
  flex: 1 1 260px;
  min-width: min(100%, 260px);
}
</style>
