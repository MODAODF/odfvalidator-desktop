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
    <p>Java is already installed</p>
    <p>Your Java version is: {{ javaDescription }}</p>
    <FileSelector />
  </div>
</template>

<style>
:root {
  background-color: #f7fafc;
  color: #282828;
  transition:
    background-color 0.3s,
    color 0.3s;
}
@media (prefers-color-scheme: dark) {
  :root {
    background-color: #282828;
    color: #e0e0e0;
    transition:
      background-color 0.3s,
      color 0.3s;
  }
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}
</style>
