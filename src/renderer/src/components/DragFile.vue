<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faFile } from '@fortawesome/free-solid-svg-icons'
import { ref, Ref } from 'vue'
import { useRouter } from 'vue-router'

const dragFileList: Ref<File[]> = ref([])
const uploaded = ref<boolean>(false)
const router = useRouter()

function selectFiles() {
  const fileInput: HTMLInputElement = document.createElement('input')
  fileInput.type = 'file'
  fileInput.multiple = true
  fileInput.style.display = 'none'
  document.body.appendChild(fileInput)
  fileInput.click()
  fileInput.onchange = () => {
    if (fileInput.files) {
      dragFileList.value = Array.from(fileInput.files)
      if (dragFileList.value.length > 0) uploaded.value = true
    }
    document.body.removeChild(fileInput)
  }
}

function drop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  console.log('Drop')
  if (!e.dataTransfer?.files) return
  dragFileList.value = Array.from(e.dataTransfer.files)
  if (dragFileList.value.length > 0) uploaded.value = true
}

function dragOver(e: DragEvent) {
  console.log(e)
  // TODO: Implement dragOver
}

function dragLeave(e: DragEvent) {
  console.log(e)
  // TODO: Implement dragLeave
}

async function detectFile(e: MouseEvent) {
  ;(e.target as HTMLButtonElement).disabled = true
  const pathList: string[] = []
  for (const file of dragFileList.value) {
    pathList.push(file['path'])
  }
  try {
    const response: string | null = await window.api.detectFile(pathList)
    router.push({ name: 'DetectReport', query: { detectResult: JSON.stringify(response) } })
  } catch (error) {
    console.error('An error occurred while detecting file:', error)
  }
}
</script>

<template>
  <div class="file-catcher-container">
    <h2>Drag your ODF files here</h2>
    <div
      class="file-catcher"
      @click="selectFiles"
      @drop="drop"
      @dragleave.self.stop="dragLeave"
      @dragover.prevent.self="dragOver"
    >
      <FontAwesomeIcon :icon="faFile" size="6x"></FontAwesomeIcon>
    </div>
    <div v-if="uploaded">
      <p>已成功上傳檔案:</p>
      <ol>
        <li v-for="(dragFile, key) in dragFileList" :key="key" class="uploaded_filelist">
          {{ dragFile['name'] }}
        </li>
      </ol>
      <button @click="detectFile">開始檢測</button>
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
  width: fit-content;
  position: relative;
}

.file-catcher,
.file-catcher:deep {
  cursor: pointer;
  transition: all 200ms;
}

.file-catcher:hover,
.file-catcher:deep(:hover) {
  color: aquamarine;
  border-color: aquamarine;
}

.uploaded_filelist {
  text-align: left;
}
</style>
