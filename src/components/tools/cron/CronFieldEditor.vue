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
const stepText = ref("");

const typeOptions = computed(() => {
  const options = [
    { label: t("tool.cron.types.any"), value: "any" },
    { label: t("tool.cron.types.value"), value: "value" },
    { label: t("tool.cron.types.range"), value: "range" },
    { label: t("tool.cron.types.step"), value: "step" },
    { label: t("tool.cron.types.list"), value: "list" },
  ];
  if (props.fieldKey === "dayOfMonth") {
    options.splice(1, 0, { label: t("tool.cron.types.noSpecific"), value: "noSpecific" });
    options.push(
      { label: t("tool.cron.types.lastDay"), value: "lastDay" },
      { label: t("tool.cron.types.nearestWeekday"), value: "nearestWeekday" },
      { label: t("tool.cron.types.lastWeekday"), value: "lastWeekday" }
    );
  }
  if (props.fieldKey === "dayOfWeek") {
    options.splice(1, 0, { label: t("tool.cron.types.noSpecific"), value: "noSpecific" });
    options.push(
      { label: t("tool.cron.types.lastWeekdayOfMonth"), value: "lastWeekdayOfMonth" },
      { label: t("tool.cron.types.nthWeekdayOfMonth"), value: "nthWeekdayOfMonth" }
    );
  }
  return options;
});
watch(
  () => props.modelValue,
  (field) => {
    if (field?.type === "list") listText.value = stringifyCronField(field);
    if (field?.type === "step") stepText.value = stringifyCronField(field);
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
    noSpecific: () => ({ type: "noSpecific" }),
    lastDay: () => ({ type: "lastDay" }),
    nearestWeekday: () => ({ type: "nearestWeekday", day: min }),
    lastWeekday: () => ({ type: "lastWeekday" }),
    lastWeekdayOfMonth: () => ({ type: "lastWeekdayOfMonth", weekday: 1 }),
    nthWeekdayOfMonth: () => ({ type: "nthWeekdayOfMonth", weekday: 1, nth: 1 }),
  };
  emitField(factories[type]());
}

function updateProperty(property, value) {
  if (value === null || value === undefined) return;
  emitField({ ...props.modelValue, [property]: value });
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

function commitStep() {
  try {
    const field = parseCronField(stepText.value, props.fieldKey);
    if (field.type !== "step") throw new Error(t("tool.cron.stepRequiresStep"));
    emitField(field);
  } catch (error) {
    emit("invalid", error.message);
    stepText.value = stringifyCronField(props.modelValue);
  }
}
</script>

<template>
  <section class="cron-field-block">
    <n-tag class="cron-field-tag" size="medium" type="info">
      {{ t(`tool.cron.fields.${fieldKey}`) }} ({{ definition.min }}-{{ definition.max }})
    </n-tag>

    <div class="cron-field-controls">
      <n-select
        class="cron-type-select"
        size="medium"
        :value="modelValue.type"
        :options="typeOptions"
        @update:value="changeType"
      />

      <n-input-number
        v-if="modelValue.type === 'value'"
        class="cron-number-control"
        size="medium"
        :value="modelValue.value"
        :min="definition.min"
        :max="definition.max"
        :precision="0"
        @update:value="(value) => updateProperty('value', value)"
      />

      <template v-else-if="modelValue.type === 'range'">
        <n-input-number class="cron-number-control cron-range-control" size="medium" :value="modelValue.from" :min="definition.min" :max="definition.max" :precision="0"
          @update:value="(value) => updateProperty('from', value)" />
        <span>{{ t('tool.cron.to') }}</span>
        <n-input-number class="cron-number-control cron-range-control" size="medium" :value="modelValue.to" :min="definition.min" :max="definition.max" :precision="0"
          @update:value="(value) => updateProperty('to', value)" />
      </template>

      <template v-else-if="modelValue.type === 'step'">
        <n-input
          v-model:value="stepText"
          class="cron-expression-control"
          size="medium"
          :placeholder="t('tool.cron.stepPlaceholder')"
          @blur="commitStep"
          @keyup.enter="commitStep"
        />
      </template>

      <n-input
        v-else-if="modelValue.type === 'list'"
        v-model:value="listText"
        class="cron-list-control"
        size="medium"
        :placeholder="t('tool.cron.listPlaceholder')"
        @blur="commitList"
        @keyup.enter="commitList"
      />

      <n-input-number
        v-else-if="modelValue.type === 'nearestWeekday'"
        class="cron-number-control"
        size="medium"
        :value="modelValue.day"
        :min="definition.min"
        :max="definition.max"
        :precision="0"
        @update:value="(value) => updateProperty('day', value)"
      />

      <n-input-number
        v-else-if="modelValue.type === 'lastWeekdayOfMonth'"
        class="cron-number-control"
        size="medium"
        :value="modelValue.weekday"
        :min="definition.min"
        :max="definition.max"
        :precision="0"
        @update:value="(value) => updateProperty('weekday', value)"
      />

      <template v-else-if="modelValue.type === 'nthWeekdayOfMonth'">
        <n-input-number class="cron-number-control" size="medium" :value="modelValue.weekday" :min="definition.min" :max="definition.max" :precision="0"
          @update:value="(value) => updateProperty('weekday', value)" />
        <span>#</span>
        <n-input-number class="cron-number-control" size="medium" :value="modelValue.nth" :min="1" :max="5" :precision="0"
          @update:value="(value) => updateProperty('nth', value)" />
      </template>
    </div>
    <code class="cron-field-result">{{ stringifyCronField(modelValue) }}</code>
  </section>
</template>

<style scoped>
.cron-field-block {
  min-height: 44px;
  padding: 5px 0;
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr) minmax(36px, auto);
  align-items: center;
  gap: 6px;
}

.cron-field-controls {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px;
}

.cron-field-tag {
  width: 100px;
  height: 34px;
  justify-content: center;
  /*font-size: 14px;*/
  white-space: nowrap;
}

.cron-field-controls {
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.cron-type-select {
  width: 132px;
  min-width: 132px;
}

.cron-number-control {
  width: 80px;
  min-width: 80px;
}

.cron-range-control {
  width: 90px;
  min-width: 90px;
}

.cron-list-control,
.cron-expression-control {
  flex: 1 1 180px;
  min-width: 150px;
}

.cron-field-result {
  justify-self: end;
  max-width: 110px;
  overflow: hidden;
  color: #475569;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
