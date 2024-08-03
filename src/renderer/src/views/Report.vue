<script setup lang="ts">
import { onBeforeMount, ref, Ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResultTable from '../components/reports/ResultTable.vue'
import '../styles/tableStyles.css'
import FilelistTable from '../components/reports/FilelistTable.vue'
import html2pdf from 'html2pdf.js'

const passed: Record<string, any[]> = {
    '1.1': [],
    '1.2': [],
    '1.3': [],
}
const failed: Record<string, any[]> = {
    '1.1': [],
    '1.2': [],
    '1.3': [],
    'undefined': []
}
const passedCount: Record<string, number> = {
    '1.1': 0,
    '1.2': 0,
    '1.3': 0,
}
const failedCount: Record<string, number> = {
    '1.1': 0,
    '1.2': 0,
    '1.3': 0,
    'undefined': 0
}

const route = useRoute()
const router = useRouter()
const detectResult: Array<{ [key: string]: any[]}> = JSON.parse(route.query.detectResult as string)
const showAllBtn: Ref<boolean> = ref(false)
const showFilelist: Ref<Array<object>> = ref([])

function handleShowFile(data: { version: string | '', ispassed: boolean | '', showAll: boolean }) {
    const { version, ispassed, showAll = false } = data
    clearShowFile()

    if (showAll) {
        /* 顯示「全部」檔案列表 */
        for (const version in passed) {
            const newData = passed[version]
            if (newData.length > 0) {
                showFilelist.value.push({
                    [version]: newData,
                    'ispassed': true
                })
            }
        }
        for (const version in failed) {
            const newData = failed[version]
            if (newData.length > 0) {
                showFilelist.value.push({
                    [version]: newData,
                    'ispassed': false
                })
            }
        }
    } else {
        /* 顯示「選擇版本」檔案列表 */
        showAllBtn.value = false
        const newData = ispassed ? passed[version] : failed[version]
        showFilelist.value.push({
            [version]: newData,
            'ispassed': ispassed
        })
    }
}

function goHome() {
    router.push('/')
}

/* 點擊「查看全部」按鈕 */
function toggleShowAll() {
    showAllBtn.value = !showAllBtn.value
    if (showAllBtn.value) {
        handleShowFile({ version: '', ispassed: '', showAll: showAllBtn.value})
    } else {
        clearShowFile()
    }
}

/* 初始化所有「查看」按鈕樣式 */ 
function initShowFileBtns() {
    const btns = document.querySelectorAll<HTMLElement>('[id^="passed-"], [id^="failed-"]')
    if (btns) {
        btns.forEach(btn => {
            if (btn.textContent?.trim() === '收起') {
                btn.textContent = '查看'
                btn.classList.add('btn__dark')
                btn.classList.remove('btn__light')
            }
        })
    }
}

/* 清空檔案列表 */
function clearShowFile() {
    showFilelist.value = []
}

watch(showAllBtn, (showAllBtnVal) => {
    if (showAllBtnVal) initShowFileBtns() /* 點擊「查看全部」按鈕時，初始化「查看」按鈕樣式 */

    const btn: HTMLElement | null = document.querySelector('#show-all-btn')
    if (btn !== null) {
        btn.classList.toggle('btn__dark')
        btn.classList.toggle('btn__light')
    }
})

onBeforeMount(async () => {
    detectResult.forEach(detectInfo => {
        const fileName = Object.keys(detectInfo)[0].split('/').pop()
        const info = Object.values(detectInfo)[0]
        const { generator } = info[3]
        const { rootDocVersion } = info[2]
        const fileData = {
            fileName,
            generator,
            ...(info[4]?.canFix && { canFix: info[4].canFix }),
            layoutGridHasIssue: info[4].layoutGridHasIssue,
            pageBreakHasIssue: info[5].pageBreakHasIssue,
            spaceHasIssue: info[6].spaceHasIssue

        }
        info[0].standard ? passed[rootDocVersion].push(fileData) : failed[rootDocVersion].push(fileData)
        info[0].standard ? passedCount[rootDocVersion] += 1 : failedCount[rootDocVersion] += 1
    })
})

function downloadPdf(): void {
    toggleShowAll()
    
    // Add the print-pdf class
    const pageContent = document.getElementById('app');
    if (pageContent !== null) {
        pageContent.classList.add('print-pdf')
    }

    const filelistComponent = document.getElementById('filelistComponent')
    if (filelistComponent !== null){
        const filelistTable = filelistComponent.querySelector('table')
        if (filelistTable !== null) {
            filelistTable.classList.remove('w75')
        }
    }

    const opt = {
        margin: 0,
        filename: 'ODF 標準檢測報告.pdf',
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(pageContent).set(opt).save()
    // .then(() => {
    //     // Remove the print-pdf class after PDF generation
    //     pageContent.classList.remove('print-pdf');
    // }).catch((error: Error) => {
    //     console.error('PDF generation failed:', error);
    //     // Ensure the class is removed even if PDF generation fails
    //     pageContent.classList.remove('print-pdf');
    // });
}

</script>

<template>
    <ResultTable class="d-flex flex-column align-items-center"
        :passed-count="passedCount"
        :failed-count="failedCount"
        @show-file="handleShowFile"
        @init-show-file-btns="initShowFileBtns"
        @clear-show-file="clearShowFile">
    </ResultTable>
    <div>
        <button class="btn btn__dark m-4" id="show-all-btn" @click="toggleShowAll">{{ showAllBtn ? '隱藏全部' : '查看全部' }}</button>
        <button class="btn btn__light" @click="downloadPdf">匯出</button>
    </div>
    <FilelistTable v-for="(filelistData, index) in showFilelist" :key="index" id="filelistComponent" class="d-flex flex-column align-items-center"
        :filelist-data="filelistData">
    </FilelistTable>
    <br>
    <button class="btn btn__dark my-3 mb-5" @click="goHome">檢測其他檔案</button>
</template>
<style lang="css" src="../styles/printpdf.css"></style>