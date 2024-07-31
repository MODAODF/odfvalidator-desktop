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
    </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'

interface DetailData {
    layoutGridHasIssue?: boolean
    pageBreakHasIssue?: boolean
    spaceHasIssue?: boolean
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
</style>