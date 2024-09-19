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
                        <span class="last__tool text-muted small">最後儲存的文件應用工具: {{ fileData.generator }}</span>
                        <span v-if="!ispassed" class="d-block mb-3 small">
                            <span v-if="fileData.canFix">請將檔案【另存新檔】後重新檢測，即可通過</span>
                            <span v-else>請嘗試【另存新檔】以修正錯誤，若仍不符合，請參考</span>
                            <a href="https://odf.moda.gov.tw/QA/public/" target="_blank" class="text-dark">ODF文件應用工具問與答</a>
                        </span>
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
.last__tool {
    display: block;
    margin-top: -10px;
    margin-bottom: 15px;
}
</style>