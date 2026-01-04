import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";;

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
          // Naive UI 组件库单独打包
          if (id.includes('naive-ui')) {
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
          
          // SQL 格式化库单独打包
          if (id.includes('sql-formatter')) {
            return 'sql-formatter';
          }
          
          // jsonpath 库单独打包
          if (id.includes('jsonpath')) {
            return 'jsonpath';
          }
          
          // QRCode 和 Barcode 相关库单独打包
          if (id.includes('qrcode') || id.includes('barcode') || id.includes('jsbarcode')) {
            return 'qr-bar-code';
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
