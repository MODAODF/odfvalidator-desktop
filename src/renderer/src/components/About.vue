<script setup lang="ts">
import { version } from '../../../../package.json'
</script>

<template>
    <div class="about-container">
      <h2>關於 ODF 格式檢測工具</h2>
      <div class="content">
        <p>版本：{{ version }}</p>
        <p>本發行版由 Ministry of Digital Affairs 提供。</p>
        <p>著作權 © 2020-2024 LibreOffice 貢獻者。<br />
          ODF 格式檢測工具衍生自 <a href="https://odfvalidator.org/">ODF Validator</a>。
        </p>
      </div>
      <router-link to="/" class="back-link">返回</router-link>
    </div>
  </template>
    
  <style scoped>
  .about-container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .content {
    margin: 2rem 0;
  }
  </style>