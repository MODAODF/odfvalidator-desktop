<script setup lang="ts">
import { onBeforeMount, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResultTable from '../components/reports/ResultTable.vue'
import ShowFile from '../components/reports/ShowFile.vue'
import '../styles/tableStyles.css'

let passed: Record<string, any[]> = {
    '1.1': [],
    '1.2': [],
    '1.3': [],
}
let failed: Record<string, any[]> = {
    '1.1': [],
    '1.2': [],
    '1.3': [],
    'undefined': []
}
let passedCount: Record<string, number> = {
    '1.1': 0,
    '1.2': 0,
    '1.3': 0,
}
let failedCount: Record<string, number> = {
    '1.1': 0,
    '1.2': 0,
    '1.3': 0,
    'undefined': 0
}

const route = useRoute()
const router = useRouter()
const detectResult: Array<{ [key: string]: any[]}> = JSON.parse(route.query.detectResult as string)
const filelistData = ref({})
const filelistDataLength = computed(() => Object.keys(filelistData.value).length)
const showAll = ref(false)

function handleShowFile(data: { version: string, ispassed: boolean }) {
    const { version, ispassed } = data
    const newData = ispassed ? passed[version] : failed[version]
    filelistData.value = {
        [version]: newData,
        'ispassed': ispassed
    }
}

function goHome() {
    router.push('/')
}

function toggleShowAll() {
    showAll.value = !showAll.value
}

onBeforeMount(async () => {
    detectResult.forEach(detectInfo => {
        const fileName = Object.keys(detectInfo)[0].split('/').pop()
        const info = Object.values(detectInfo)[0]
        const { generator } = info[3]
        const { rootDocVersion } = info[2]
        const fileData = {
            fileName,
            generator,
            ...(info[4]?.canFix && { canFix: info[4].canFix })
        }
        info[0].standard ? passed[rootDocVersion].push(fileData) : failed[rootDocVersion].push(fileData)
        info[0].standard ? passedCount[rootDocVersion] += 1 : failedCount[rootDocVersion] += 1
    })
})

</script>

<template>
    <ResultTable class="d-flex flex-column align-items-center"
        :passed-count="passedCount"
        :failed-count="failedCount"
        @show-file="handleShowFile">
    </ResultTable>
    <div>
        <button class="btn btn__dark m-4" @click="toggleShowAll">{{ showAll ? '隱藏全部' : '查看全部' }}</button>
        <button class="btn btn__light">匯出</button>
    </div>
    <ShowFile
        v-if="filelistDataLength > 0"
        :filelist-data="filelistData">
    </ShowFile>
    <br>
    <button @click="goHome">回到檢測首頁</button>
</template>
<style lang="scss" scoped>
</style>