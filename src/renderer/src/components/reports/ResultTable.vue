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

const emit = defineEmits(['show-file', 'init-show-file-btns', 'clear-show-file'])
const totalPassed = ref<number>(0)
const totalFailed = ref<number>(0)

function showFile(version: string, ispassed: boolean): void {
    const selectedBtn = document.querySelector<HTMLElement>(`#${ispassed ? 'passed' : 'failed'}-${version.replace(/\./g, '\\.')}`)
    const btnVal: string = selectedBtn?.textContent?.trim() ?? '';
    
    if (selectedBtn) {
        if (btnVal === '收起') {
            emit('clear-show-file')
            selectedBtn.textContent = '查看'
            selectedBtn.classList.remove('btn__light')
            selectedBtn.classList.add('btn__dark')
        } else if (btnVal === '查看') {
            emit('show-file', { version, ispassed })
            emit('init-show-file-btns')
            selectedBtn.textContent = '收起'
            selectedBtn.classList.remove('btn__dark')
            selectedBtn.classList.add('btn__light')
        }
    }
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
        <table class="table__dark table__overview">
            <thead>
                <tr>
                    <th>檢測標準</th>
                    <th>ODF 1.1</th>
                    <th>
                        ODF 1.2
                        <div>包含extended</div>
                    </th>
                    <th>
                        ODF 1.3
                        <div>包含extended</div>
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
                        <button v-if="count > 0"
                            class="btn btn__dark mt-1"
                            :id="`passed-${version}`"
                            @click="showFile(version, true)">查看
                        </button>
                    </td>
                    <td>N/A</td>
                </tr>
                <tr>
                    <td>不符合</td>
                    <td v-for="(count, version) in props.failedCount" :key="version">
                        <div>
                            {{ count }}
                        </div>
                        <button v-if="count > 0"
                            class="btn btn__dark mt-1"
                            :id="`failed-${version}`"
                            @click="showFile(version, false)">查看
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

.table__overview {
    width: 75%;

    & thead tr th div {
        font-size: 0.9rem;
    }

    & tbody tr {
        height: 100px;
        
        & td {
            width: 20%
        }
    }
}

</style>