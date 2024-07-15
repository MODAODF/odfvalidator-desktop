<template>
    <div class="mt-5">
        <table class="table__dark w-75">
            <thead>
                <tr>
                    <th class="text-start ps-4">{{ title }}</th>
                    <th>檢測結果</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(fileData, index) in props.filelistData?.[version]" :key="index">
                    <td class="text-start ps-4">檔案名稱：{{ fileData.fileName || '未知' }}</td>
                    <td class="w-25">
                        <div class="d-flex align-items-center justify-content-center">
                            <span class="fs-3">A</span>
                            <button class="btn btn__dark ms-4">
                                查看
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue"

const props = defineProps({
    filelistData: {
        type: Object as () => Record<string, any>,
        require: true
    }
})

const version = ref('')
const ispassed = ref(false)

onMounted(async () => {
    version.value = Object.keys(props.filelistData as object)[0]
    ispassed.value = (props.filelistData as object)['ispassed']
})

watch(() => props.filelistData, (newVal: object) => {
    version.value = Object.keys(newVal)[0]
    ispassed.value = newVal['ispassed']
})

let title = computed(() => {
    if (!version.value) return '全部受檢測的檔案：'
    if (version.value === 'undefined') return '無法檢測的檔案：'
    return ispassed.value ? `符合 ODF ${version.value} 標準的檔案：` : `不符合 ODF ${version.value} 標準的檔案列表：`
})
</script>

<style lang="scss">
</style>