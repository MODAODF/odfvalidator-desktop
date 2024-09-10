<script setup lang="ts">
import { useEnvironmentStore } from '@renderer/stores/environment'
import { Ref, ref, watch } from 'vue'
import { onMounted } from 'vue'

const environment = useEnvironmentStore()

const javaInstalled: Ref<string | null> = ref(null)
const javaDescription: Ref<string> = ref('')
const isWindows: Ref<boolean> = ref(false)

onMounted(async () => {
  // 檢查作業系統是否為 Windows
  isWindows.value = (navigator as any).userAgentData.platform.startsWith('Win')

  const response: string | null = await window.api.checkJava()
  console.log(response)
  javaInstalled.value = response
  if (!javaInstalled.value) {
    javaDescription.value = '尚未安裝可供執行 Java 環境的軟體，請安裝後繼續使用 ODF 格式驗證工具'
  } else {
    javaDescription.value = javaInstalled.value as string
    javaDescription.value =
      javaDescription.value.split(' ')[0] + ' ' + javaDescription.value.split(' ')[1]
  }
})

watch(javaInstalled, () => {
  if (javaInstalled.value) {
    environment.javaInstalled = true
  } else {
    environment.javaInstalled = false
  }
})
</script>

<template>
  <div v-if="!javaInstalled">
    <h3>尚未安裝 Java 執行環境，或版本已過時</h3>
    <div v-if="isWindows">
      <a href="https://learn.microsoft.com/zh-tw/java/openjdk/download" target="_blank">
        點擊此處下載執行 Java 環境的 OpenJDK 11 或更新版本
      </a>
    </div>
  </div>

  <div v-else>
    <p class="fs-4">Java 執行環境已安裝</p>
    <p class="fs-4">您執行 Java 環境的軟體及版本：{{ javaDescription }}</p>
  </div>
</template>
