<template>
    <div class="mt-5">
        <table class="table__dark w-75">
            <thead>
                <tr>
                    <th class="text-start ps-4">{{ title }}</th>
                    <th>排版建議</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(fileData, index) in props.filelistData?.[version]" :key="index">
                    <td class="text-start px-4">
                        <p>檔案名稱：{{ fileData.fileName || '未知' }}</p>
                        <DetailTable v-if="isShowDetail[index]"
                            :detail-data="fileData">
                        </DetailTable>
                    </td>
                    <td class="w-25">
                        <div class="d-flex align-items-center justify-content-center flex-column mx-2">
                            <button v-if="hasLayoutSuggest(fileData)" class="btn" :class="isShowDetail[index] ? 'btn__light' : 'btn__dark'" @click="showDetail(index)">
                                {{ isShowDetail[index] ? '收起' : '查看' }}
                            </button>
                            <span v-else class="fs-2 no__suggest">-</span>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue"
import DetailTable from './DetailTable.vue'

const props = defineProps({
    filelistData: {
        type: Object as () => Record<string, any>,
        require: true
    }
})

const version = ref('')
const ispassed = ref(false)
const isShowDetail = ref([] as boolean[])

onMounted(async () => {
    version.value = Object.keys(props.filelistData as object)[0]
    ispassed.value = (props.filelistData as object)['ispassed']
})

watch(() => props.filelistData, (newVal: object) => {
    version.value = Object.keys(newVal)[0]
    ispassed.value = newVal['ispassed']
    isShowDetail.value = Array(Object.values(newVal)[0].length).fill(false)
})

const title = computed(() => {
    if (version.value === 'undefined') return '無法檢測的檔案：'
    return ispassed.value ? `符合 ODF ${version.value} 標準的檔案：` : `不符合 ODF ${version.value} 標準的檔案列表：`
})

function showDetail(index: number) {
    isShowDetail.value[index] = !isShowDetail.value[index]
}

function hasLayoutSuggest(fileData: Record<string, any>) {
    return fileData.layoutGridHasIssue || fileData.pageBreakHasIssue || fileData.spaceHasIssue
}
</script>

<style lang="scss">
.no__suggest {
    color: rgb(124, 134, 141);
}
</style>