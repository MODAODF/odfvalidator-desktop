<script setup lang="ts">
import FileSelector from './components/FileSelector.vue'
import { Ref, ref } from 'vue'
import { onMounted } from 'vue'

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
</script>

<template>
  <div v-if="!javaInstalled">
    <h1>Java is not installed, or the version is out of date</h1>
    <p>{{ javaDescription }}</p>
  </div>
  <div v-else>
    <h1>Java is already installed</h1>
    <p>{{ javaDescription }}</p>
  </div>
  <FileSelector />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
