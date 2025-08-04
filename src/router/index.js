import { createRouter, createWebHistory } from "vue-router";

import Index from "/src/components/Index.vue";

const routes = [
  {
    path: "/",
    redirect: "index",
    component: Index,
    children: [
      {
        path: "/index",
        name: "Index",
        component: () => import("/src/components/tools/Home.vue"),
      },
      {
        path: "/time",
        name: "TimeTool",
        component: () => import("/src/components/tools/TimeTool.vue"),
      },
      {
        path: "/json",
        name: "JsonTool",
        component: () => import("/src/components/tools/JsonTool.vue"),
      },
      {
        path: "/xml",
        name: "XmlTool",
        component: () => import("/src/components/tools/XmlTool.vue"),
      },
      {
        path: "/jsonWrapper",
        name: "JsonToolWrapper",
        component: () => import("/src/components/wrapper/JsonToolWrapper.vue"),
      },
      {
        path: "/jsonFormatWrapper",
        name: "JsonFormatWrapper",
        component: () => import("/src/components/wrapper/JsonFormatWrapper.vue"),
      },
      {
        path: "/xmlWrapper",
        name: "XmlToolWrapper",
        component: () => import("/src/components/wrapper/XmlToolWrapper.vue"),
      },
      {
        path: "/md5",
        name: "Md5Tool",
        component: () => import("/src/components/tools/Md5Tool.vue"),
      },
      {
        path: "/base64",
        name: "Base64Tool",
        component: () => import("/src/components/tools/Base64Tool.vue"),
      },
      {
        path: "/stringHex",
        name: "StringHexTool",
        component: () => import("/src/components/tools/StringHexTool.vue"),
      },
      {
        path: "/qrcode",
        name: "QrCodeTool",
        component: () => import("/src/components/tools/QRCodeTool.vue"),
      },
      {
        path: "/barcode",
        name: "BarcodeTool",
        component: () => import("/src/components/tools/BarcodeTool.vue"),
      },
      {
        path: "/sql",
        name: "SQLTool",
        component: () => import("/src/components/tools/SQLTool.vue"),
      },
      {
        path: "/diff",
        name: "DiffTool",
        component: () => import("/src/components/tools/DiffTool.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
