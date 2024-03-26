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
    javaDescription.value = 'Java is not installed. Please install Java to use this application.'
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
    <h1>Java is not installed, or the version is out of date</h1>
    <p>{{ javaDescription }}</p>
  </div>

  <div v-else>
    <p>Java is already installed</p>
    <p>Your Java version is: {{ javaDescription }}</p>
  </div>
</template>
