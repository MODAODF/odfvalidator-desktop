<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons'
import { ref, Ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const handleChangeLanguage = (e) => {
  locale.value = e.target.value
}

const dragFileList: Ref<File[]> = ref([])
const uploaded = ref<boolean>(false)
const router = useRouter()
const detectBtn = ref<HTMLElement | null>(null)

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
    scrollToDetectBtn()
  }
}

function drop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  console.log('Drop')
  if (!e.dataTransfer?.files) return
  dragFileList.value = Array.from(e.dataTransfer.files)
  if (dragFileList.value.length > 0) {
    uploaded.value = true
    scrollToDetectBtn()
  }
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
    window.scrollTo(0, 0)
  } catch (error) {
    console.error('An error occurred while detecting file:', error)
  }
}

async function scrollToDetectBtn() {
  await nextTick()
  detectBtn.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="file__catcher__container">
    <div>
      語言 / Languages：
      <select @change="handleChangeLanguage">
        <option value="zh-TW">中文</option>
        <option value="en-US">English</option>
      </select>
    </div>
    <div
      class="file__catcher"
      @click="selectFiles"
      @drop="drop"
      @dragleave.self.stop="dragLeave"
      @dragover.prevent.self="dragOver"
    >
      <FontAwesomeIcon class="m-5" :icon="faArrowUpFromBracket" size="6x"></FontAwesomeIcon>
      <h3>{{ $t('dragFile.selectOrDrop') }}</h3>
    </div>
    <div v-if="uploaded" class="m-5">
      <div class="upload__filelist text-start">
        <p class="fs-5"> {{$t('dragFile.selectedFiles')}}：</p>
        <ol>
          <li v-for="(dragFile, key) in dragFileList" :key="key">
            {{ dragFile['name'] }}
          </li>
        </ol>
      </div>
      <button @click="detectFile" class="btn btn__light mt-3" ref="detectBtn">
        {{ $t('dragFile.startDetection') }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.file__catcher__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.file__catcher {
  border: 2px dashed rgb(211, 211, 211);
  border-radius: 20px;
  padding: 36px 48px;
  text-align: center;
  cursor: pointer;
  width: fit-content;
  position: relative;
  color: rgb(211, 211, 211);
  background-color: white;
  transition: all 200ms;

  &:hover {
    color: rgb(255, 165, 0, 0.75);
    border-color: rgb(255, 166, 0, 0.75);
  }
}

.upload__filelist {
  width: 500px;
  background-color:  rgba(255, 255, 255, 0.75);
  border-radius: 10px;
  padding: 30px 50px 15px 50px;
  box-shadow: 3px 4px 10px rgba(0, 0, 0, 0.05);
}
</style>
