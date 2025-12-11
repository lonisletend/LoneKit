<script setup>
import SQLFormatTool from '../tools/SQLFormatTool.vue';
import { NTabs, NTab } from "naive-ui";
import { useTabManager } from '../../composables/useTabManager.js';

const {
  tabs,
  activeTabName,
  cachedComponents,
  currentComponent,
  addable,
  closable,
  handleAdd,
  handleClose
} = useTabManager({
  componentName: 'SQLFormatTool',
  component: SQLFormatTool,
  tabNamePrefix: 'SQL',
  maxTabs: 10
});

</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="flex-shrink-0">
      <n-tabs v-model:value="activeTabName"
              type="card" :addable="addable" :closable="closable"
              tab-style="min-width: 80px;" @close="handleClose" @add="handleAdd">
        <n-tab v-for="tab in tabs" :key="tab.id" :name="tab.name"></n-tab>
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

<style scoped>
</style>
