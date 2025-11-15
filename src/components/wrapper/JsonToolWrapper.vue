<script setup>
import JsonTool from '../tools/JsonTool.vue';
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
  componentName: 'JsonTool',
  component: JsonTool,
  tabNamePrefix: 'Json',
  maxTabs: 10
});

</script>

<template>
  <div class="h-full flex flex-col">
    <n-tabs v-model:value="activeTabName"
            type="card" :addable="addable" :closable="closable"
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
<!--  <div>-->
<!--    &lt;!&ndash; Tab Headers &ndash;&gt;-->
<!--    <div class="tabs">-->
<!--      <button-->
<!--          v-for="(tab, index) in tabs"-->
<!--          :key="tab.id"-->
<!--          @click="activeTab = index"-->
<!--          :class="{ active: activeTab === index }"-->
<!--      >-->
<!--        {{ tab.name }}-->
<!--      </button>-->
<!--      <button @click="addTab">Add Tab</button>-->
<!--    </div>-->

<!--    &lt;!&ndash; Tab Content &ndash;&gt;-->
<!--    <keep-alive>-->
<!--      <component-->
<!--          :is="JsonTool"-->
<!--          v-if="activeTab !== null"-->
<!--          :key="tabs[activeTab].id"-->
<!--          :id="tabs[activeTab].id"-->
<!--      ></component>-->
<!--    </keep-alive>-->
<!--  </div>-->
</template>

<style scoped>
</style>
