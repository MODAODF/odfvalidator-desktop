<script setup lang="ts">
import { onMounted, ref } from "vue"


const props = defineProps({
    passedCount: {
        type: Object
    },
    failedCount: {
        type: Object
    }
})

const emit = defineEmits(['show-file'])
const totalPassed = ref<number>(0)
const totalFailed = ref<number>(0)

function showFile(version: string, ispassed: boolean) {
    emit('show-file', { version, ispassed})
}

onMounted(async () => {
    totalPassed.value = Object.values(props.passedCount as Object).reduce((acc, curr) => acc + curr, 0)
    totalFailed.value = Object.values(props.failedCount as Object).reduce((acc, curr) => acc + curr, 0)
})
</script>

<template>
    <div>
        <span>
            <p>
                檢驗檔案總數：
                <span>{{ totalPassed + totalFailed }}</span>
                ， 符合數：
                <span class="detect-success">{{ totalPassed }}</span>
                ， 不符合數：
                <span class="detect-fail">{{ totalFailed }}</span>
                ， 符合比例：
                <span :class="(totalPassed / (totalPassed + totalFailed)) > 0.5 ? 'detect-success' : 'detect-fail'">{{ `${Math.floor(totalPassed / (totalPassed + totalFailed) * 100)} %` }}</span>
            </p>
        </span>
        <table>
            <thead>
                <tr>
                    <th>檢測標準</th>
                    <th>ODF 1.1</th>
                    <th>ODF 1.2</th>
                    <th>ODF 1.3</th>
                    <th>未知</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>符合</td>
                    <td v-for="(count, version) in props.passedCount" :key="version">
                        {{ count }}
                        <button v-if="count > 0" @click="showFile(version, true)">查看</button>
                    </td>
                    <td>N/A</td>
                </tr>
                <tr>
                    <td>不符合</td>
                    <td v-for="(count, version) in props.failedCount" :key="version">
                        {{ count }}
                        <button v-if="count > 0" @click="showFile(version, false)">查看</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style>

</style>