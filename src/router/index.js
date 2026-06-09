import { createRouter, createWebHistory } from "vue-router";

import Index from "/src/components/Index.vue";

const routes = [
  {
    path: "/",
    redirect: "home",
    component: Index,
    children: [
      {
        path: "/home",
        alias: ["/index"],
        name: "Index",
        component: () => import("/src/components/tools/Home.vue"),
      },
      {
        path: "/time",
        name: "TimeTool",
        component: () => import("/src/components/wrapper/TimeToolWrapper.vue"),
      },
      {
        path: "/uuid",
        name: "UUIDTool",
        component: () => import("/src/components/tools/UUIDTool.vue"),
      },
      {
        path: "/count",
        alias: ["/textCount"],
        name: "TextCountTool",
        component: () => import("/src/components/wrapper/TextCountToolWrapper.vue"),
      },
      {
        path: "/text",
        alias: ["/text-process", "/textProcess"],
        name: "TextProcessToolWrapper",
        component: () => import("/src/components/wrapper/TextProcessToolWrapper.vue"),
      },
      {
        path: "/json",
        alias: ["/jsonFormatWrapper"],
        name: "JsonFormatWrapper",
        component: () => import("/src/components/wrapper/JsonFormatWrapper.vue"),
      },
      {
        path: "/xml",
        alias: ["/xmlFormatWrapper"],
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
        path: "/unicode",
        name: "UnicodeTool",
        component: () => import("/src/components/tools/UnicodeTool.vue"),
      },
      {
        path: "/hex",
        alias: ["/stringHex"],
        name: "StringHexTool",
        component: () => import("/src/components/tools/StringHexTool.vue"),
      },
      {
        path: "/qrcode",
        alias: ["/qr"],
        name: "QrCodeTool",
        component: () => import("/src/components/tools/QRCodeTool.vue"),
      },
      {
        path: "/qrcode-scan",
        alias: ["/qr-scan", "/qrcode-reader"],
        name: "QRCodeReaderTool",
        component: () => import("/src/components/tools/QRCodeReaderTool.vue"),
      },
      {
        path: "/barcode",
        name: "BarcodeTool",
        component: () => import("/src/components/tools/BarcodeTool.vue"),
      },
      {
        path: "/barcode-scan",
        alias: ["/barcode-reader"],
        name: "BarcodeReaderTool",
        component: () => import("/src/components/tools/BarcodeReaderTool.vue"),
      },
      {
        path: "/sql",
        alias: ["/sqlFormatWrapper"],
        name: "SQLFormatWrapper",
        component: () => import("/src/components/wrapper/SQLFormatWrapper.vue"),
      },
      {
        path: "/diff",
        name: "DiffTool",
        component: () => import("/src/components/tools/DiffTool.vue"),
      },
      {
        path: "/diffs",
        alias: ["/diffWrapper"],
        name: "DiffToolWrapper",
        component: () => import("/src/components/wrapper/DiffToolWrapper.vue"),
      },
      {
        path: "/folders",
        alias: ["/folderDiffWrapper"],
        name: "FolderDiffToolWrapper",
        component: () => import("/src/components/wrapper/FolderDiffToolWrapper.vue"),
      },
      {
        path: "/format",
        alias: ["/commonFormatWrapper"],
        name: "CommonFormatWrapper",
        component: () => import("/src/components/wrapper/CommonFormatWrapper.vue"),
      },
      {
        path: "/sendpay",
        name: "SendpayDisplayWrapper",
        component: () => import("/src/components/wrapper/SendpayDisplayWrapper.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
