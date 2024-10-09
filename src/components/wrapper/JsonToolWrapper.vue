<script setup>
import { ref, computed } from 'vue';
import JsonTool from '../tools/JsonTool.vue';
import {NTabs, NTabPane} from "naive-ui";


const tabs = ref([
  { id: 1, name: 'Tab 1' },
  { id: 2, name: 'Tab 2' }
]);

const activeTabName = ref('Tab 1');
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
    name: `Tab ${newId}`
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
  <n-tabs
      v-model:value="activeTabName"
      type="card"
      :addable="addable"
      :closable="closable"
      tab-style="min-width: 80px;"
      @close="handleClose"
      @add="handleAdd"
  >
    <n-tab-pane v-for="tab in tabs" :key="tab.id" :name="tab.name">
      <div class="w-full h-screen">
        <keep-alive>
          <component
              :is="JsonTool"
              :key="tab.id"
              :id="tab.id"
          ></component>
        </keep-alive>
      </div>
    </n-tab-pane>

  </n-tabs>
<!--  <keep-alive>-->
<!--    <component-->
<!--        :is="JsonTool"-->
<!--        v-if="activeTabName"-->
<!--        :key="tabs.map((tab) => tab.name === activeTabName)[0].id"-->
<!--        :id="tabs.map((tab) => tab.name === activeTabName)[0].id"-->
<!--    ></component>-->
<!--  </keep-alive>-->


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
