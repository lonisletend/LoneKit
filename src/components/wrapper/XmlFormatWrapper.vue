<script setup>
import XmlFormatTool from '../tools/XmlFormatTool.vue';
import EditableTabLabel from '../common/EditableTabLabel.vue';
import { NTabs, NTab } from "naive-ui";
import { useTabManager } from '../../composables/useTabManager.js';

const {
  tabs,
  activeTabName,
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
  componentName: 'XmlFormatTool',
  component: XmlFormatTool,
  tabNamePrefix: 'XML',
  maxTabs: 10
});
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="flex-shrink-0">
      <n-tabs v-model:value="activeTabName" type="card" :addable="addable"
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
            :key="activeTabName"
        ></component>
      </keep-alive>
    </div>
  </div>
</template>

<style scoped></style>
