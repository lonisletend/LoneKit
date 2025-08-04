<script setup>
import { ref, computed } from 'vue';
import JsonFormatTool from '../tools/JsonFormatTool.vue';
import {NTabs, NTab} from "naive-ui";


const tabs = ref([
  { id: 1, name: 'Json 1' },
  // { id: 2, name: 'Json 2' }
]);

const activeTabName = ref('Json 1');
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
    name: `Json ${newId}`
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
    <n-tabs v-model:value="activeTabName"
            type="card" :addable="addable" :closable="closable"
            tab-style="min-width: 80px;" @close="handleClose" @add="handleAdd">
      <n-tab v-for="tab in tabs" :key="tab.id" :name="tab.name"></n-tab>
    </n-tabs>
    <div class="flex-grow">
      <keep-alive>
        <component
            :is="JsonFormatTool"
            v-if="activeTabName"
            :key="tabs.filter((tab) => tab.name === activeTabName)[0].id"
            :id="tabs.filter((tab) => tab.name === activeTabName)[0].id"
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
