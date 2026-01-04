# 打包优化方案

## 已实施的优化

### 1. 代码分割（Code Splitting）
通过 `manualChunks` 将大型依赖库分离成独立的 chunk：

- **naive-ui**: UI 组件库独立打包
- **lone-format**: JSON/XML 格式化库独立打包（272 KB → 独立）
- **dayjs**: 时间处理库独立打包
- **v-code-diff**: 代码对比库独立打包
- **sql-formatter**: SQL 格式化库独立打包
- **jsonpath**: JSON 路径查询库独立打包
- **qr-bar-code**: 二维码和条形码相关库独立打包
- **vendor**: 其他第三方库打包到 vendor chunk

**优点**：
- 首次加载只需要基础框架和当前页面的代码
- 其他库按需加载，减少初始加载时间
- 浏览器可以并行下载多个小文件
- 更好的缓存策略，库代码变化不影响业务代码

### 2. 代码压缩优化
使用 terser 进行更激进的代码压缩：

- 移除所有 `console.log`
- 移除 `debugger` 语句
- 变量名混淆
- 死代码删除

### 3. 路由懒加载
所有路由组件已使用动态 import() 加载（已实现）

## 优化效果预期

优化前最大的文件：
- `index-09dcd97e.js` - 536 KB (gzip: 159 KB)
- `lone-format-ce64e570.js` - 272 KB (gzip: 80 KB)
- `TimeTool-e6de2476.js` - 181 KB (gzip: 44 KB)

优化后：
- 初始加载包会减小 40-50%
- 大型库独立加载，只在需要时下载
- 首屏加载时间减少 30-50%

## 进一步优化建议

### 1. 使用 CDN 加载大型库（可选）
对于一些大型但不常变化的库，可以使用 CDN 加载：

```javascript
// vite.config.js
build: {
  rollupOptions: {
    external: ['vue', 'vue-router', 'naive-ui'],
    output: {
      globals: {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        'naive-ui': 'naive'
      }
    }
  }
}
```

然后在 `index.html` 中添加：
```html
<script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></script>
<script src="https://cdn.jsdelivr.net/npm/naive-ui"></script>
```

### 2. 图片优化
- 使用 WebP 格式
- 使用 CDN 托管静态资源
- 懒加载图片

### 3. 启用 HTTP/2 或 HTTP/3
在服务器端启用 HTTP/2 可以更好地利用并行下载

### 4. 使用 Service Worker
实现离线缓存和预加载策略

### 5. 压缩算法优化
- 服务器端启用 Brotli 压缩（比 gzip 压缩率更高 15-20%）
- Nginx 配置示例：
```nginx
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/javascript application/json;
```

### 6. 分析工具
使用打包分析工具查看详细的包大小：

```bash
npm install -D rollup-plugin-visualizer
```

```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  vue(),
  visualizer({
    open: true,
    gzipSize: true,
    brotliSize: true
  })
]
```

## 测试打包结果

运行以下命令测试优化效果：

```bash
npm run build
```

查看输出的 chunk 大小和数量变化。

## 部署建议

1. **启用 gzip/brotli 压缩**
2. **设置合理的缓存策略**：
   - HTML 文件：no-cache
   - JS/CSS 文件：max-age=31536000（因为有 hash）
   - 图片等静态资源：max-age=31536000
3. **使用 CDN 分发静态资源**
4. **启用 HTTP/2**

## 监控指标

优化后关注以下指标：
- **FCP (First Contentful Paint)**: 首次内容绘制时间
- **LCP (Largest Contentful Paint)**: 最大内容绘制时间
- **TTI (Time to Interactive)**: 可交互时间
- **TBT (Total Blocking Time)**: 总阻塞时间
- **CLS (Cumulative Layout Shift)**: 累积布局偏移

推荐使用 Lighthouse 或 WebPageTest 进行性能测试。
