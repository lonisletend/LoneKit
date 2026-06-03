<script setup>

import { computed, defineAsyncComponent, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {NButton, NInput, NSelect, NTag, useNotification} from "naive-ui";
import { 
  ArrowMaximizeVertical24Regular as ExpandIcon,
  ArrowMinimizeVertical24Regular as CollapseIcon
} from '@vicons/fluent';

import SplitPanel from '../common/SplitPanel.vue'
import { useCommon } from '../../composables/useCommon'
import { useThemeMode } from "../../composables/useThemeMode";
import { SqlFormat } from 'lone-format'

const { notify, copyToClipboard, readFromClipboard } = useCommon();
const { t } = useI18n();

defineOptions({
  name: 'SQLFormatTool'
});

const source = ref();
const customSqlFormatRef = ref(null)
const hasSourceContent = computed(() => !!source.value?.trim());
const { resolvedTheme } = useThemeMode();
const formatTheme = computed(() => (resolvedTheme.value === "dark" ? "min-dark" : "min-light"));
const DIALECT_STORAGE_KEY = 'sql-format-dialect';
const dialectOptions = [
  { label: 'SQL(generic)', value: 'sql' },
  { label: 'BigQuery', value: 'bigquery' },
  { label: 'ClickHouse', value: 'clickhouse' },
  { label: 'DB2', value: 'db2' },
  { label: 'DB2i', value: 'db2i' },
  { label: 'DuckDB', value: 'duckdb' },
  { label: 'Hive', value: 'hive' },
  { label: 'MariaDB', value: 'mariadb' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'N1QL', value: 'n1ql' },
  { label: 'PL/SQL', value: 'plsql' },
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'Redshift', value: 'redshift' },
  { label: 'Spark', value: 'spark' },
  { label: 'SQLite', value: 'sqlite' },
  { label: 'TiDB', value: 'tidb' },
  { label: 'Trino', value: 'trino' },
  { label: 'Transact-SQL', value: 'transactsql' },
  { label: 'T-SQL', value: 'tsql' },
  { label: 'SingleStoreDB', value: 'singlestoredb' },
  { label: 'Snowflake', value: 'snowflake' }
];
const dialectValues = new Set(dialectOptions.map((option) => option.value));
const savedDialect = localStorage.getItem(DIALECT_STORAGE_KEY);
const dialect = ref(dialectValues.has(savedDialect) ? savedDialect : 'sql');

watch(dialect, (value) => {
  localStorage.setItem(DIALECT_STORAGE_KEY, value);
});

async function readClipboard() {
  const text = await readFromClipboard();
  if (text) {
    source.value = text;
  }
}

function showExample() {
  source.value = 'select supplier_name,city from\n' +
      '(select * from suppliers join addresses on suppliers.address_id=addresses.id)\n' +
      'as suppliers\n' +
      'where supplier_id > 500\n' +
      'order by supplier_name asc,city desc;';
}

function clear() {
  source.value = '';
}

async function copyValue() {
  await customSqlFormatRef.value?.copySql()
  notify('success', t('common.copied'));
}

function compressive() {
  customSqlFormatRef.value?.compressSource();
}

function copySource() {
  copyToClipboard(source.value);
}

function expandAll() {
  customSqlFormatRef.value?.expandAll();
}

function collapseAll() {
  customSqlFormatRef.value?.collapseAll();
}


</script>

<template>
  <div class="w-full h-full">
    <SplitPanel>
      <template #left>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="warning">SQL</n-tag>
            <n-button @click="readClipboard">{{ t('common.clipboard') }}</n-button>
            <n-button @click="showExample">{{ t('common.example') }}</n-button>
            <n-button @click="clear">{{ t('common.clear') }}</n-button>
            <n-button @click="compressive">{{ t('common.compress') }}</n-button>
            <n-button @click="copySource">{{ t('common.copy') }}</n-button>
          </div>
          <div class="w-full h-full text-xl">
            <n-input v-model:value="source" type="textarea" class="w-full h-full"
                     :placeholder="t('tool.format.sqlInputPlaceholder')"/>
          </div>
        </div>
      </template>
      <template #right>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="success">{{ t('tool.codec.result') }}</n-tag>
            <n-button @click="copyValue">{{ t('common.copy') }}</n-button>
            <n-select
              v-model:value="dialect"
              :options="dialectOptions"
              :style="{ width: '170px' }"
            />
            <n-button @click="collapseAll">
              <template #icon> <component :is="CollapseIcon" /> </template>
            </n-button>
            <n-button @click="expandAll">
              <template #icon> <component :is="ExpandIcon" /> </template>
            </n-button>
          </div>
          <div class="flex-1 w-full overflow-hidden text-lg lk-result-surface">
            <SqlFormat
              v-if="hasSourceContent"
              class="w-full h-full"
              ref="customSqlFormatRef"
              v-model="source"
              :theme="formatTheme"
              :dialect="dialect"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <!-- 输入内容后加载格式化视图 -->
            </div>
          </div>
        </div>
      </template>
    </SplitPanel>
  </div>
</template>

<style scoped>

</style>
