<script setup lang="ts">
import { useEnvironmentStore } from '@renderer/stores/environment'
import { Ref, ref, watch } from 'vue'
import { onMounted } from 'vue'

const environment = useEnvironmentStore()

const javaInstalled: Ref<string | null> = ref(null)
const javaDescription: Ref<string> = ref('')

onMounted(async () => {
  const response: string | null = await window.api.checkJava()
  console.log(response)
  javaInstalled.value = response
  if (!javaInstalled.value) {
    javaDescription.value = '執行 Java 環境的套件尚未安裝，請安裝套件後繼續使用 ODF 格式驗證工具'
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
    <h1>Java 執行環境尚未安裝，或版本已過時</h1>
    <p>{{ javaDescription }}</p>
  </div>

  <div v-else>
    <p class="fs-4">Java 執行環境已安裝</p>
    <p class="fs-4">您執行 Java 環境的套件及版本：{{ javaDescription }}</p>
  </div>
</template>
