<template>
    <div class="detail__contain">
        <div class="detail__item">
            <span>文字格子線</span>
            <span>Enter 換頁</span>
            <span>連續空白</span>
        </div>
        <div>
            <span :class="layoutGridStyle">{{ layoutGridIsPassed }}</span>
            <span :class="pageBreakStyle">{{ pageBreakHasIssue }}</span>
            <span :class="spaceStyle">{{ spaceHasIssue }}</span>
        </div>
        <div class="detail__suggest">
            <span v-show="$props.detailData.layoutGridHasIssue">
                <p>文字格子線：<br>
                    於檔案頁面點擊右鍵，選擇「頁面樣式」->「文字網格」->「不使用網格」
                </p>
            </span>
            <span v-show="$props.detailData.pageBreakHasIssue">
                <p>Enter換頁：<br>
                    請以「Ctrl + Enter」換頁方法取代 Enter換頁
                </p>
            </span>
            <span v-show="$props.detailData.spaceHasIssue">
                <p>連續空白：<br>
                    當使用 MODAODF 文件應用工具時，請按以下步驟進行格式校正：
                    <ol>
                        <li>在功能表列中點擊「格式校正工具」</li>
                        <li>移動游標至「單一格式校正」</li>
                        <li>選擇「取代段落空白」</li>
                    </ol>
                    若使用其他 ODF文件應用工具，請
                    <a href="https://github.com/MODAODF/FormatCheck/releases" target="_blank">點我</a>
                    安裝最新版本的 FormatCheck.oxt
                </p>
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'

interface DetailData {
    layoutGridHasIssue?: boolean
    pageBreakHasIssue?: boolean
    spaceHasIssue?: boolean
    // canFix?: boolean
}

const props = defineProps<{
    detailData: DetailData
}>()

const getStatusClass = (hasIssue: boolean | undefined) => {
    return hasIssue ? 'detail__failed' : 'detail__passed'
}

const getStatusText = (hasIssue: boolean | undefined) => {
    return hasIssue === undefined ? '未知' : hasIssue ? '建議修改' : '符合'
}

const layoutGridStyle = computed(() => getStatusClass(props.detailData?.layoutGridHasIssue))
const layoutGridIsPassed = computed(() => getStatusText(props.detailData?.layoutGridHasIssue))

const pageBreakStyle = computed(() => getStatusClass(props.detailData?.pageBreakHasIssue))
const pageBreakHasIssue = computed(() => getStatusText(props.detailData?.pageBreakHasIssue))

const spaceStyle = computed(() => getStatusClass(props.detailData?.spaceHasIssue))
const spaceHasIssue = computed(() => getStatusText(props.detailData?.spaceHasIssue))

</script>

<style lang="scss">
.detail__contain {
    background-color: rgb(124, 134, 141);
    border-radius: 5px;
    padding: 25px;

    div {
        display: flex;
        justify-content: space-around;
    }
}

.detail__item > span,
.detail__passed,
.detail__failed {
    color: white;
    font-size: 0.85rem;
    text-align: center;
    flex: 1;
    max-width: 120px;
}

.detail__passed,
.detail__failed {
    color: rgb(124, 134, 141);
    border-radius: 10px;
    font-size: 1.3rem;
    margin: 10px;
    padding: 10px 0;
}

.detail__passed {
    background-color: white;
}

.detail__failed {
    background-color: rgb(248, 234, 73);
}

.detail__suggest {
    width: 100%;
    flex-direction: column;
    color: white;
    font-size: 0.85rem;
    margin-top: 20px;
    margin-left: 10px;
}
</style>