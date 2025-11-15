<script setup>
import { ref, computed, defineComponent, h } from 'vue';
import XmlFormatTool from '../tools/XmlFormatTool.vue';
import { NTabs, NTab } from "naive-ui";

const tabs = ref([
  { id: 1, name: 'XML 1' }
]);

const activeTabName = ref('XML 1');

// 跟踪需要被 keep-alive 缓存的组件名称
const cachedComponents = ref(['XmlFormatTool-1']);

// 为每个 tab 创建动态组件的缓存（不需要响应式）
const componentCache = {};

const addable = computed(() => {
  return {
    disabled: tabs.value.length >= 10
  };
});
const closable = computed(() => {
  return tabs.value.length > 1;
});

// 获取当前活动 tab 的组件
const currentComponent = computed(() => {
  const currentTab = tabs.value.find((tab) => tab.name === activeTabName.value);
  if (!currentTab) return null;
  
  const componentName = `XmlFormatTool-${currentTab.id}`;
  
  // 如果组件还没有创建，创建它
  if (!componentCache[componentName]) {
    componentCache[componentName] = defineComponent({
      name: componentName,
      setup() {
        return () => h(XmlFormatTool, { id: currentTab.id });
      }
    });
  }
  
  return componentCache[componentName];
});

function handleAdd() {
  // 获取当前所有 tab 的最大 ID，然后 +1
  const ids = tabs.value.map((tab) => tab.id);
  const newId = Math.max(...ids) + 1;
  
  const newTab = {
    id: newId,
    name: `XML ${newId}`
  };
  tabs.value.push(newTab);
  
  // 将新组件添加到缓存列表
  const componentName = `XmlFormatTool-${newId}`;
  cachedComponents.value.push(componentName);
  
  activeTabName.value = newTab.name;
}

function handleClose(name) {
  const nameIndex = tabs.value.findIndex((tab) => tab.name === name);
  if (!~nameIndex)
    return;
  
  const closedTab = tabs.value[nameIndex];
  const componentName = `XmlFormatTool-${closedTab.id}`;
  
  // 从缓存列表中移除，这将导致组件被销毁
  const cacheIndex = cachedComponents.value.indexOf(componentName);
  if (cacheIndex > -1) {
    cachedComponents.value.splice(cacheIndex, 1);
  }
  
  // 从组件缓存中删除
  delete componentCache[componentName];
  
  tabs.value.splice(nameIndex, 1);
  if (name === activeTabName.value) {
    activeTabName.value = tabs.value[Math.min(nameIndex, tabs.value.length - 1)].name;
  }
}
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
