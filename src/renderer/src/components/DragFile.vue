<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faFile } from '@fortawesome/free-solid-svg-icons'

function selectFiles() {
  // TODO: Implement the selectFiles function
  console.log('Selecting files')
}

function dragEnter(e: DragEvent) {
  // TODO: Implement the dragEnter function
  console.log('Drag enter')
  if (!e.dataTransfer) return
  for (const file of e.dataTransfer.files) {
    console.log(file)
  }
}

function drop(e: DragEvent) {
  // TODO: Implement the drop function
  e.preventDefault()
  e.stopPropagation()
  console.log('Drop')
}

function dragLeave() {
  // TODO: Implement the dragLeave function
  console.log('Drag leave')
}
</script>

<template>
  <div class="file-catcher-container">
    <h2>Drag your ODF files here</h2>
    <div
      class="file-catcher"
      @click="selectFiles"
      @dragenter="dragEnter"
      @drop="drop"
      @dragleave="dragLeave"
    >
      <FontAwesomeIcon :icon="faFile" size="6x"></FontAwesomeIcon>
    </div>
  </div>
</template>

<style scoped>
.file-catcher-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.file-catcher {
  border: 2px dashed #ccc;
  border-radius: 5px;
  padding: 36px 48px;
  text-align: center;
  cursor: pointer;
  transition: all 200ms;
  width: fit-content;
}
</style>
