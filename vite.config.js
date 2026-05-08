import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [vue()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  
  build: {
    // 增加 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // 手动分块，将大型依赖库分离
        manualChunks: (id) => {
          // Naive UI 打成单独 chunk，避免内部循环依赖在分包后触发初始化时序问题
          if (id.includes('node_modules/naive-ui/es')) {
            return 'naive-ui';
          }

          if (id.includes('node_modules/naive-ui')) {
            return 'naive-ui';
          }

          // lone-format 库单独打包
          if (id.includes('lone-format')) {
            return 'lone-format';
          }
          
          // dayjs 时间库单独打包
          if (id.includes('dayjs')) {
            return 'dayjs';
          }
          
          // 代码对比库单独打包
          if (id.includes('v-code-diff')) {
            return 'v-code-diff';
          }

          // Excel 导出库按需加载并独立打包
          if (id.includes('exceljs')) {
            return 'exceljs';
          }
          
          // jsonpath 库单独打包
          if (id.includes('jsonpath')) {
            return 'jsonpath';
          }
          
          // QRCode 和 Barcode 相关库单独打包
          if (id.includes('qrcode') || id.includes('barcode') || id.includes('jsbarcode')) {
            return 'qr-bar-code';
          }

          // Vue 运行时与路由拆分
          if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/')) {
            return 'vue-core';
          }

          if (id.includes('node_modules/vue-router/')) {
            return 'vue-router';
          }

          // Tauri 相关 API 拆分
          if (id.includes('node_modules/@tauri-apps/')) {
            return 'tauri';
          }

          // 图标库拆分
          if (id.includes('node_modules/@vicons/')) {
            return 'vicons';
          }
          
          // node_modules 中的其他库
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        
        // 用于从入口点创建的块的打包输出格式
        entryFileNames: 'assets/[name]-[hash].js',
        // 用于命名代码拆分时创建的共享块的输出命名
        chunkFileNames: 'assets/[name]-[hash].js',
        // 用于输出静态资源的命名
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境移除 console
        drop_console: true,
        drop_debugger: true
      }
    }
  }
}));
