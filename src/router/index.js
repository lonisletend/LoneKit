import { createRouter, createWebHistory } from "vue-router";

import Index from "/src/components/Index.vue";

const routes = [
  {
    path: '/',
    redirect: 'index',
    component: Index,
    children: [
      {
        path: '/index',
        name: 'Index',
        component: () => import('/src/components/tools/Home.vue')
      },
      {
        path: '/time',
        name: 'TimeTool',
        component: () => import('/src/components/tools/TimeTool.vue')
      },
      {
        path: '/json',
        name: 'JsonTool',
        component: () => import('/src/components/tools/JsonTool.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
