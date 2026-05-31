<script setup>
import DiffTool from '../tools/DiffTool.vue';
import EditableTabLabel from '../common/EditableTabLabel.vue';
import { NTabs, NTab } from "naive-ui";
import { useTabManager } from '../../composables/useTabManager.js';
import { useQueueConsumer } from '../../composables/useQueueConsumer.js';

const {
  tabs,
  activeTabName,
  activeTabId,
  cachedComponents,
  currentComponent,
  addable,
  closable,
  editingTabId,
  handleAdd,
  handleClose,
  handleUpdateTab,
  handleEditingChange
} = useTabManager({
  componentName: 'DiffTool',
  component: DiffTool,
  tabNamePrefix: 'Diff',
  maxTabs: 10
});

// 每次进入（首次或 KeepAlive 激活）自动消费队列：每两条数据创建一个 Tab
useQueueConsumer({
  targetName: 'DiffTool',
  batchSize: 2,
  onCreate: (batch) => handleAdd({ left: batch[0] ?? '', right: batch[1] ?? '' })
});

</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="flex-shrink-0">
      <n-tabs v-model:value="activeTabName"
              type="card" :addable="addable"
              tab-style="min-width: 80px;" @close="handleClose" @add="handleAdd" size="small">
        <n-tab v-for="tab in tabs" :key="tab.id" :name="tab.name" :closable="closable && editingTabId !== tab.id">
          <template #default>
            <EditableTabLabel 
              :tab-name="tab.name" 
              :tab-id="tab.id"
              :all-tabs="tabs"
              @update="handleUpdateTab"
              @editing-change="handleEditingChange"
            />
          </template>
        </n-tab>
      </n-tabs>
    </div>
    <div class="flex-1 overflow-hidden">
      <keep-alive :include="cachedComponents">
        <component
            :is="currentComponent"
            v-if="currentComponent"
            :key="activeTabId"
        ></component>
      </keep-alive>
    </div>
  </div>
</template>

<style scoped>
</style>
