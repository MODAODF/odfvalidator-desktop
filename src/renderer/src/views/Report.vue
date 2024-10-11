<script setup lang="ts">
import { onBeforeMount, ref, Ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResultTable from '../components/reports/ResultTable.vue'
import '../styles/tableStyles.css'
import FilelistTable from '../components/reports/FilelistTable.vue'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import NotoSansTC from '../fonts/NotoSansTC-Regular.ttf'
import pdfLogo from '../../../../public/icons/pdf_logo.jpg'

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
        const rootDocVersion = (parseFloat(info[2]['rootDocVersion']) > 1.3) ? 'undefined' : info[2]['rootDocVersion']
        const fileData = {
            fileName,
            generator,
            ...(info[4]?.canFix && { canFix: info[4].canFix }),
            layoutGridHasIssue: info[6].layoutGridHasIssue,
            pageBreakHasIssue: info[7].pageBreakHasIssue,
            spaceHasIssue: info[8].spaceHasIssue
        }
        info[0].standard ? passed[rootDocVersion].push(fileData) : failed[rootDocVersion].push(fileData)
        info[0].standard ? passedCount[rootDocVersion] += 1 : failedCount[rootDocVersion] += 1
    })
})

/**
 * 使用 jsPDF 生成表格、儲存檔案
 */
async function downloadPdf(): Promise<void> {

    const doc = new jsPDF()
    const base64Image = await imageToBase64(pdfLogo);
    const baseStyle = {
        font: 'NotoSansTC',
        fontStyle: 'normal' as 'normal',
        textColor: 0,
        fillColor: 255, // 這只設定到第一列
    }
    const pageHeader = {
        // 頁首設定，設定這以符合每一頁重複頁首
        margin: { top: 35 },
        showHeader: 'everyPage',
        willDrawPage: () => {
            doc.addImage(base64Image, 'JPEG', 14, 10, 850/12, 228/12);
        },
    }
    doc.addFont(NotoSansTC, 'NotoSansTC', 'normal')
    doc.setFont('NotoSansTC')
    doc.setFontSize(12)

    // 第一部分：標題
    doc.autoTable({
        ...pageHeader,
        body: [
            [
                {
                    content: '檢測報告',
                    styles: { halign: 'center' },
                },
            ],
            [
                {
                    content: 'Analysis Report',
                    styles: { halign: 'center' },
                },
            ],
        ],
        tableLineColor: 0,
        tableLineWidth: 0.2,
        styles: {
            ...baseStyle,
        },
        didParseCell: commonDidParseCell,
    })

    // 第二部份：檢測資訊
    const totalPassed = Object.values(passedCount).reduce((sum, value) => sum + value, 0);
    const totalFailed = Object.values(failedCount).reduce((sum, value) => sum + value, 0);
    const totalSuggestions = calculateTotalSuggestions(passed);

    doc.autoTable({
        startY: (doc as any).lastAutoTable.finalY,
        body: [
            ['驗證軟體', 'ODF格式檢測工具 1.0.0'],
            ['檢測日期', getCurrentDate()],
            ['檢測檔案總數', totalPassed + totalFailed],
            ['符合比例', `${Math.floor(totalPassed / (totalPassed + totalFailed) * 100)}%`],
            ['符合總數', totalPassed],
            ['建議修改總數', totalSuggestions],
            ['不符合總數', totalFailed],
            ['未知檔案數', failedCount['undefined']],
        ],
        styles: {
            ...baseStyle,
            lineColor: 0,
            lineWidth: 0.2,
        },
        didParseCell: commonDidParseCell,
    });

    // 第三部分：檢測結果表格，從 detectResult 取得資料，檢測標準符合的表格
    const headers = ['驗證項目', '檔案名稱', '符合ODF標準', '製作工具', '連續空白', 'Enter換頁', '文字格子線'];
    const verticalHorizontalCenter = { valign: 'middle', halign: 'center' };
    let conformingIndex = 1;
    let nonConformingIndex = 1;
    const conformingBody: Array<(string | object)[]> = [];
    const nonConformingBody: Array<(string | object)[]> = [];

    detectResult.forEach((item: any) => {
        const filePath = Object.keys(item)[0];
        const results = item[filePath];

        const row = [
            createStyleCell(String(results[0]?.standard ? conformingIndex++ : nonConformingIndex++), verticalHorizontalCenter), // 驗證項目
            filePath, // 檔案名稱
            createStyleCell(results[2]?.rootDocVersion || '', verticalHorizontalCenter), // 符合ODF標準
            createStyleCell(results[3]?.generator || '', verticalHorizontalCenter), // 製作工具
            createStyleCell(results[8]?.spaceHasIssue ? '建議修改' : '符合', verticalHorizontalCenter), // 連續空白
            createStyleCell(results[7]?.pageBreakHasIssue ? '建議修改' : '符合', verticalHorizontalCenter), // Enter換頁
            createStyleCell(results[6]?.layoutGridHasIssue ? '建議修改' : '符合', verticalHorizontalCenter), // 文字格子線
        ];

        if (results[0]?.standard) {
            conformingBody.push(row); // 符合標準的項目
        } else {
            nonConformingBody.push(row); // 不符合標準的項目
        }
    });

    if (conformingBody.length !== 0) {
        doc.text('檢測結果：', 14, (doc as any).lastAutoTable.finalY + 10)
        doc.autoTable({
            startY: (doc as any).lastAutoTable.finalY + 18,
            head: [['符合ODF標準檢測：']],
            styles: {
                ...baseStyle,
                lineColor: 0,
                lineWidth: 0.2,
            },
        })
        doc.autoTable({ 
            startY: (doc as any).lastAutoTable.finalY,
            head: createRowAndStyles(headers, verticalHorizontalCenter),
            body: conformingBody,
            styles: {
                ...baseStyle,
                lineColor: 0,
                lineWidth: 0.2,
            },
            columnStyles: {
                0: {cellWidth: 11},
                1: {cellWidth: 73},
                2: {cellWidth: 18},
                4: {cellWidth: 13},
                5: {cellWidth: 13},
                6: {cellWidth: 13},
            },
            rowPageBreak: 'avoid',
            ...pageHeader,
            didParseCell: commonDidParseCell,
        });
    }

    // 第四部分：檢測結果表格，檢測標準不符合的表格
    const nonConformingHeaders = ['驗證項目', '檔案名稱', '不符合ODF標準', '製作工具'];
    if (nonConformingBody.length !== 0) {
        doc.autoTable({
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [['不符合ODF標準檢測：']],
            styles: {
                ...baseStyle,
                lineColor: 0,
                lineWidth: 0.2,
            },
        })
        doc.autoTable({ 
            startY: (doc as any).lastAutoTable.finalY,
            head: createRowAndStyles(nonConformingHeaders, verticalHorizontalCenter),
            body: nonConformingBody,
            styles: {
                ...baseStyle,
                lineColor: 0,
                lineWidth: 0.2,
            },
            columnStyles: {
                0: {cellWidth: 11},
                1: {cellWidth: 73},
                2: {cellWidth: 49},
                3: {cellWidth: 49},
            },
            rowPageBreak: 'avoid',
            ...pageHeader,
            didParseCell: commonDidParseCell,
        });
    }

    // 第五部分：備註
    doc.autoTable({ 
        startY: (doc as any).lastAutoTable.finalY + 12,
        body: [
            ['免責聲明：'],
            ['本工具僅供檢測文件是否符合 ODF（Open Document Format）標準，其檢測結果僅供參考，不保證絕對的準確性或適用性，使用者應自行判斷是否根據本工具的建議進行調整，對於受測之ODF文件，也不會進行任何修改或調整，僅提供與文件格式相關的建議資訊。'],
        ],
        styles: {
            ...baseStyle,
            lineWidth: 0,
        },
        pageBreak: 'avoid',
        ...pageHeader,
        didParseCell: commonDidParseCell,
    });

    doc.save('ODF 標準檢測報告.pdf')
}

/**
 * 計算檢測結果總共有幾個建議修改
 * @param passed 檢測結果通過的檔案
 */
function calculateTotalSuggestions(passed: Record<string, any[]>): number {
    let totalSuggestions = 0;

    Object.keys(passed).forEach(version => {
        passed[version].forEach(file => {
            if (file.layoutGridHasIssue) {totalSuggestions++;}
            if (file.pageBreakHasIssue) {totalSuggestions++;}
            if (file.spaceHasIssue) {totalSuggestions++;}
        });
    });

    return totalSuggestions;
}

/**
 * 將圖片轉換成 base64
 * @param imagePath 圖片路徑
 */
function imageToBase64(imagePath): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imagePath;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
            } else {
                console.error('Failed to get 2D context');
            }

            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL.replace(/^data:image\/(png|jpg);base64,/, ''));
        };

        img.onerror = (err) => {
            reject(err);
        };
    });
}

/**
 * 取得目前日期 YYYY/MM/DD
 */
function getCurrentDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}`;
}

/**
 * 產生一列，並且設定樣式
 * @param row
 * @param styles 
 */
function createRowAndStyles(row: string[], styles: object): any[] {
    return [row.map(content => ({
        content: content,
        styles: styles,
    }))];
}

/**
 * 產生一個 cell，並且設定的樣式
 * @param content 
 * @param styles 
 */
function createStyleCell(content: string, styles: object): object {
    return {
        content: content,
        styles: styles,
    };
}

/**
 * 設定所有 body 部分的樣式
 */
function commonDidParseCell(data: any): void {
    // 設定表格樣式，所有 body 都使用同樣的樣式
    if (data.section === 'body') {
        data.cell.styles.fillColor = 'white';
    }
}

// 添加這個函數來印出 filelistData
// function logFilelistData(data: any) {
//   console.log('Report: filelistData:', JSON.stringify(data, null, 2));
// }
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