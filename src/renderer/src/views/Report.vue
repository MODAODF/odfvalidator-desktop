<script setup lang="ts">
import { onBeforeMount, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Overview from '../components/reports/Overview.vue'
import Table from '../components/reports/Table.vue'
import ShowFile from '../components/reports/ShowFile.vue'

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
const showFileData = ref({})
const showFileDataLength = computed(() => Object.keys(showFileData.value).length)

function handleShowFile(data: { version: string, ispassed: boolean }) {
    const { version, ispassed } = data
    const newData = ispassed ? passed[version] : failed[version]
    showFileData.value = {
        [version]: newData,
        'ispassed': ispassed
    }
}

function goHome() {
    router.push('/')
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
    <Table
        :passed-count="passedCount"
        :failed-count="failedCount"
        @show-file="handleShowFile">
    </Table>
    <br>
    <ShowFile
        v-if="showFileDataLength > 0"
        :show-file-data="showFileData">
    </ShowFile>
    <br>
    <Overview :detect-result="detectResult"></Overview>
    <br>
    <button @click="goHome">回到檢測首頁</button>
</template>