<template>
  <div class="w-full h-full">
    <n-tabs type="line" animated>
      <n-tab-pane name="version" :tab="t('home.changelog')">
        <div class="w-full px-4 py-2">
          <n-timeline>
            <n-timeline-item 
              v-for="(log, index) in changeLogs" 
              :key="index"
              :type="log.type || 'success'"
            >
              <template #header>
                <div class="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>{{ log.date }}</span>
                  <span class="text-green-600">{{ log.version }}</span>
                  <a v-if="log.releaseLink" :href="log.releaseLink" target="_blank" rel="noopener noreferrer" class="inline-flex items-center hover:opacity-70 transition-opacity">
                    <component :is="GithubIcon" class="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </a>
                </div>
              </template>
              
              <div class="mt-2 space-y-3">
                <div v-if="log.added && log.added.length > 0" class="changelog-section">
                  <div class="changelog-title">
                    <n-tag type="success" size="small">{{ t('home.added') }}</n-tag>
                  </div>
                  <ul class="changelog-list">
                    <li v-for="(item, i) in log.added" :key="i">{{ rt(item) }}</li>
                  </ul>
                </div>

                <div v-if="log.optimized && log.optimized.length > 0" class="changelog-section">
                  <div class="changelog-title">
                    <n-tag type="info" size="small">{{ t('home.optimized') }}</n-tag>
                  </div>
                  <ul class="changelog-list">
                    <li v-for="(item, i) in log.optimized" :key="i">{{ rt(item) }}</li>
                  </ul>
                </div>

                <div v-if="log.fixed && log.fixed.length > 0" class="changelog-section">
                  <div class="changelog-title">
                    <n-tag type="warning" size="small">{{ t('home.fixed') }}</n-tag>
                  </div>
                  <ul class="changelog-list">
                    <li v-for="(item, i) in log.fixed" :key="i">{{ rt(item) }}</li>
                  </ul>
                </div>

                <div v-if="log.removed && log.removed.length > 0" class="changelog-section">
                  <div class="changelog-title">
                    <n-tag type="error" size="small">{{ t('home.removed') }}</n-tag>
                  </div>
                  <ul class="changelog-list">
                    <li v-for="(item, i) in log.removed" :key="i">{{ rt(item) }}</li>
                  </ul>
                </div>
              </div>
            </n-timeline-item>
          </n-timeline>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>

import { NTabs, NTabPane, NTimeline, NTimelineItem, NTag } from "naive-ui";
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { LogoGithub as GithubIcon } from '@vicons/ionicons5';
import { preloadToolsAfterHomeReady } from '../../utils/preloadTools';

const { t, tm, rt } = useI18n();
const changeLogs = computed(() => tm('home.changeLogs'));

onMounted(() => {
  preloadToolsAfterHomeReady();
});

</script>

<style scoped>
.changelog-section {
  margin-bottom: 12px;
}

.changelog-title {
  margin-bottom: 8px;
}

.changelog-list {
  margin-left: 24px;
  list-style-type: disc;
  color: #64748b;
}

:global(html.dark .changelog-list),
:global(html[data-theme='dark'] .changelog-list) {
  color: #94a3b8;
}

.changelog-list li {
  margin-bottom: 4px;
  line-height: 1.6;
}
</style>
