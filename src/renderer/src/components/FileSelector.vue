<script setup lang="ts">
import { Ref, ref } from 'vue'

const ipcHandle = async () => {
  const response: string = await window.api.ping()
  message.value = response
}

const message: Ref<string> = ref('')
</script>

<template>
  <h2>Hello world</h2>
  <button @click="ipcHandle">Send IPC</button>
  <p v-if="message.length > 0">{{ message }}</p>
</template>
