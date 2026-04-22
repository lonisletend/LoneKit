<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
    <!-- 扫描框四角 -->
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
      <path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
    </g>
    <!-- 二维码方块图案（实心填充） -->
    <g fill="currentColor">
      <rect x="6" y="6" width="4" height="4" rx="0.5"/>
      <rect x="14" y="6" width="4" height="4" rx="0.5"/>
      <rect x="6" y="14" width="4" height="4" rx="0.5"/>
      <rect x="15" y="14" width="1.5" height="1.5"/>
      <rect x="18" y="14" width="1.5" height="1.5"/>
      <rect x="15" y="17" width="1.5" height="1.5"/>
      <rect x="17" y="16" width="1.5" height="1.5"/>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'QRCodeReaderIcon'
}
</script>
