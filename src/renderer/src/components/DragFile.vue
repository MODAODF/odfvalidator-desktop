<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons'
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
    router.push({ name: 'Report', query: { detectResult: JSON.stringify(response) } })
  } catch (error) {
    console.error('An error occurred while detecting file:', error)
  }
}
</script>

<template>
  <div class="file-catcher-container">
    <div
      class="file-catcher"
      @click="selectFiles"
      @drop="drop"
      @dragleave.self.stop="dragLeave"
      @dragover.prevent.self="dragOver"
    >
      <FontAwesomeIcon class="m-5" :icon="faArrowUpFromBracket" size="6x"></FontAwesomeIcon>
      <h3>點擊選擇檔或拖曳置區域</h3>
    </div>
    <div v-if="uploaded" class="m-5">
      <div class="upload-filelist text-start">
        <p class="fs-5">已成功上傳的檔案：</p>
        <ol>
          <li v-for="(dragFile, key) in dragFileList" :key="key">
            {{ dragFile['name'] }}
          </li>
        </ol>
      </div>
      <button @click="detectFile" class="btn button-detect mt-3">開始檢測</button>
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
  border: 2px dashed rgb(211, 211, 211);
  border-radius: 20px;
  padding: 36px 48px;
  text-align: center;
  cursor: pointer;
  width: fit-content;
  position: relative;
  color: rgb(211, 211, 211);
  background-color: white;
}

.file-catcher,
.file-catcher:deep {
  cursor: pointer;
  transition: all 200ms;
}

.file-catcher:hover,
.file-catcher:deep(:hover) {
  color: rgb(255, 165, 0, 0.75);
  border-color: rgb(255, 166, 0, 0.75);
}

.upload-filelist {
  width: 500px;
  background-color:  rgba(255, 255, 255, 0.75);
  border-radius: 10px;
  padding: 30px 50px 15px 50px;
  box-shadow: 3px 4px 10px rgba(0, 0, 0, 0.05);
}

.button-detect {
  background-color: rgb(248, 234, 73);
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
  transition: all 200ms;
  letter-spacing: 2px;
}

.button-detect:hover {
  color: white;
  background-color: rgb(124, 134, 141);
}
</style>
