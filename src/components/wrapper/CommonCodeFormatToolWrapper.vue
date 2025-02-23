<script setup>
import { ref, computed } from 'vue';
import CommonCodeFormatTool from '../tools/CommonCodeFormatTool.vue';
import { NTabs, NTab } from "naive-ui";

const tabs = ref([
  { id: 1, name: 'Code 1' },
  // { id: 2, name: 'Code  2' }
]);

const activeTabName = ref('Code 1');
const addable = computed(() => {
  return {
    disabled: tabs.value.length >= 10
  };
});
const closable = computed(() => {
  return tabs.value.length > 1;
});

function handleAdd() {
  let ids = tabs.value.map((tab) => tab.id);
  let newId = Math.max(...ids) + 1;
  const newTab = {
    id: newId,
    name: `Code ${newId}`
  };
  tabs.value.push(newTab);
  activeTabName.value = newTab.name;
}

function handleClose(name) {
  const nameIndex = tabs.value.findIndex((tab) => tab.name === name);
  if (!~nameIndex)
    return;
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
      <keep-alive>
        <component :is="CommonCodeFormatTool" v-if="activeTabName"
          :key="tabs.filter((tab) => tab.name === activeTabName)[0].id"
          :id="tabs.filter((tab) => tab.name === activeTabName)[0].id"></component>
      </keep-alive>
    </div>
  </div>
</template>

<style scoped></style>
