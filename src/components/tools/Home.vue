<template>
  <div class="w-full h-full">
    <n-tabs type="line" animated>
      <!--      <n-tab-pane name="about" tab="关于">-->
      <!--        <div class="w-full px-4">-->
      <!--          <n-h2>-->
      <!--            <n-text type="success">LoneKit</n-text>-->
      <!--          </n-h2>-->
      <!--&lt;!&ndash;          <n-text type="success" class="text-2xl">LoneKit</n-text>&ndash;&gt;-->
      <!--          <n-blockquote align-text>-->
      <!--            <n-p class="text-lg">-->
      <!--              是一个简单易用的开发测试工具集合。-->
      <!--            </n-p>-->
      <!--            <n-p class="text-lg">-->
      <!--              包含了常用的工具，如：时间戳转换、Json 格式化、Base64 编解码、MD5 加密、二维码生成、条形码生成等并在不断增加和完善中。-->
      <!--            </n-p>-->
      <!--            <n-p class="text-lg">-->
      <!--              开源，Github链接: <a href="https://github.com/lonisletend/LoneKit" target="_blank" class="text-green-500">LoneKit</a>-->
      <!--            </n-p>-->
      <!--          </n-blockquote>-->
      <!--          <n-h2>-->
      <!--            <n-text type="success">为什么又重复造轮子？</n-text>-->
      <!--          </n-h2>-->
      <!--&lt;!&ndash;          <n-text type="success" class="text-2xl">为什么又重复造轮子？</n-text>&ndash;&gt;-->
      <!--          <n-blockquote align-text>-->
      <!--            <n-p class="text-lg">-->
      <!--              自然是因为那些轮子破破烂烂参差不齐。(-->
      <!--            </n-p>-->
      <!--            <n-p class="text-lg">-->
      <!--              项目中使用一些新接触的技术和框架，保持写代码的感觉。-->
      <!--            </n-p>-->
      <!--          </n-blockquote>-->
      <!--          <n-h2>-->
      <!--            <n-text type="success">我的期望</n-text>-->
      <!--          </n-h2>-->
      <!--          <n-blockquote align-text>-->
      <!--            <n-p class="text-lg">-->
      <!--              希望每一个小工具都做到简洁、易用、高效。-->
      <!--            </n-p>-->
      <!--            <n-p class="text-lg">-->
      <!--              希望能替换你打开的无数个网页工具 tab。-->
      <!--            </n-p>-->
      <!--            <n-p class="text-lg">-->
      <!--              希望帮你每天节省10分钟。-->
      <!--            </n-p>-->
      <!--            <n-p class="text-lg">-->
      <!--              希望你能早点下班，多陪陪家人，多享受生活。-->
      <!--            </n-p>-->
      <!--          </n-blockquote>-->
      <!--        </div>-->
      <!--      </n-tab-pane>-->
      <n-tab-pane name="version" tab="更新日志">
        <div class="w-full px-4">
          <n-timeline>
            <n-timeline-item />
            <n-timeline-item type="success" content="2025.04.01 v0.1.0, 本次新增：XML格式化, 删除通用格式化(依赖太多, 性能太差)。" />
            <n-timeline-item type="success" content="2025.02.23 v0.0.9, 本次新增：通用格式化, 支持XML, Java 格式化。" />
            <n-timeline-item type="success" content="2024.10.10 v0.0.8, Json格式化(Wrap模式) 支持Tab, 终于不用打开多个浏览器Tab啦!" />
            <n-timeline-item type="success" content="2024.06.09 v0.0.7, 本次新增：字符串16进制转换。" />
            <n-timeline-item type="success" content="2024.02.20 v0.0.6, 本次新增：SQL格式化、文本对比。" />
            <n-timeline-item type="success"
              content="2024.01.04 v0.0.5, 本次新增：时间戳转换、Json 格式化、Base64 编解码、MD5 加密、二维码生成、条形码生成。" />
            <n-timeline-item content="2023.12.10" />
          </n-timeline>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>

import { NTabs, NTabPane, NTimeline, NTimelineItem } from "naive-ui";

</script>

<style></style>
