<script setup>
import XmlFormatTool from '../tools/XmlFormatTool.vue';
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
  componentName: 'XmlFormatTool',
  component: XmlFormatTool,
  tabNamePrefix: 'XML',
  maxTabs: 10
});
</script>

<template>
  <div class="h-full flex flex-col">
    <n-tabs v-model:value="activeTabName" type="card" :addable="addable" :closable="closable"
      tab-style="min-width: 80px;" @close="handleClose" @add="handleAdd">
      <n-tab v-for="tab in tabs" :key="tab.id" :name="tab.name"></n-tab>
    </n-tabs>
    <div class="flex-grow">
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
