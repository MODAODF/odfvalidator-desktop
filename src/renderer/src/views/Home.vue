<script setup lang="ts">
import JavaChecker from '../components/JavaChecker.vue'
// import FileSelector from '../components/FileSelector.vue'
import DragFile from '../components/DragFile.vue'
import { useEnvironmentStore } from '@renderer/stores/environment'

const environment = useEnvironmentStore()
</script>

<template>
  <JavaChecker />
  <!-- <FileSelector v-if="environment.javaInstalled" /> -->
  <DragFile v-if="environment.javaInstalled" class="mt-5"/>
</template>

<style lang="scss">
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
