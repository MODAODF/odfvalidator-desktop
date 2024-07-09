<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
    showFileData: {
        type: Object as () => Record<string, any>,
        require: true
     }
})

const version = ref('')
const ispassed = ref(false)

onMounted(async () => {
    version.value = Object.keys(props.showFileData as object)[0]
    ispassed.value = (props.showFileData as object)['ispassed']
})

watch(() => props.showFileData, (newValue: object) => {
    version.value = Object.keys(newValue)[0]
    ispassed.value = newValue['ispassed']
})
</script>

<template>
    <div v-if="props.showFileData">
        <ol>
            <b>
                {{ ispassed ? `符合 ODF ${version} 標準：` : version === 'undefined' ? '非 ODF 文件格式：' : `不符合 ODF ${version} 標準：` }}
            </b>
            <li v-for="(value, key) in props.showFileData[version]" :key="key">
                <p>檔案名稱：{{ value.fileName || '未知' }}</p>
                <p>最後儲存的應用工具：{{ value.generator || '未知' }}</p>
                <p v-if="value.canFix">
                    {{ `可將 ${value.fileName} 透過「ODF」文件應用工具「另存新檔」以通過檢驗` }}
                </p>
            </li>
        </ol>
    </div>
</template>

<style>
</style>