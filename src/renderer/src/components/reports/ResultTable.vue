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
    <div class="report__contain">
        <span>
            <p>
                檢驗檔案總數：
                <span>{{ totalPassed + totalFailed }}</span>
                ， 符合數：
                <span class="detect__success">{{ totalPassed }}</span>
                ， 不符合數：
                <span class="detect__fail">{{ totalFailed }}</span>
                ， 符合比例：
                <span :class="(totalPassed / (totalPassed + totalFailed)) > 0.5 ? 'detect__success' : 'detect__fail'">{{ `${Math.floor(totalPassed / (totalPassed + totalFailed) * 100)} %` }}</span>
            </p>
        </span>
        <table class="table__dark w-75">
            <thead>
                <tr>
                    <th>檢測標準</th>
                    <th>ODF 1.1</th>
                    <th>ODF 1.2</th>
                    <th>
                        ODF 1.2
                        <div class="fs-6">extended</div>
                    </th>
                    <th>ODF 1.3</th>
                    <th>
                        ODF 1.3
                        <div class="fs-6">extended</div>
                    </th>
                    <th>未知</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>符合</td>
                    <td v-for="(count, version) in props.passedCount" :key="version">
                        <div>
                            {{ count }}
                        </div>
                        <button v-if="count > 0" class="btn btn__dark mt-1" @click="showFile(version, true)">
                            查看
                        </button>
                    </td>
                    <td>N/A</td>
                </tr>
                <tr>
                    <td>建議修改</td>
                    <td v-for="(count, version) in props.failedCount" :key="version">
                        <div>
                            {{ count }}
                        </div>
                        <button v-if="count > 0" class="btn btn__dark mt-1" @click="showFile(version, false)">
                            查看
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style lang="scss" scoped>
.detect__success {
    color: green;
}

.detect__fail {
    color: red;
}
</style>