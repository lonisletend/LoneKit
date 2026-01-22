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
        path: "/jsonFormatWrapper",
        name: "JsonFormatWrapper",
        component: () => import("/src/components/wrapper/JsonFormatWrapper.vue"),
      },
      {
        path: "/xmlFormatWrapper",
        name: "XmlFormatWrapper",
        component: () => import("/src/components/wrapper/XmlFormatWrapper.vue"),
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
        path: "/qrcode-reader",
        name: "QRCodeReaderTool",
        component: () => import("/src/components/tools/QRCodeReaderTool.vue"),
      },
      {
        path: "/barcode",
        name: "BarcodeTool",
        component: () => import("/src/components/tools/BarcodeTool.vue"),
      },
      {
        path: "/sqlFormatWrapper",
        name: "SQLFormatWrapper",
        component: () => import("/src/components/wrapper/SQLFormatWrapper.vue"),
      },
      {
        path: "/diff",
        name: "DiffTool",
        component: () => import("/src/components/tools/DiffTool.vue"),
      },
      {
        path: "/diffWrapper",
        name: "DiffToolWrapper",
        component: () => import("/src/components/wrapper/DiffToolWrapper.vue"),
      },
      {
        path: "/commonFormatWrapper",
        name: "CommonFormatWrapper",
        component: () => import("/src/components/wrapper/CommonFormatWrapper.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
