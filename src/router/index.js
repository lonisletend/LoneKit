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
      },
      {
        path: '/md5',
        name: 'Md5Tool',
        component: () => import('/src/components/tools/Md5Tool.vue')
      },
      {
        path: '/base64',
        name: 'Base64Tool',
        component: () => import('/src/components/tools/Base64Tool.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
