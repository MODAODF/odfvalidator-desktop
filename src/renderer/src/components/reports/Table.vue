<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
    passedCount: {
        type: Object
    },
    failedCount: {
        type: Object
    }
})

const emit = defineEmits(['show-file'])

function showFile(version: string, ispassed: boolean) {
    emit('show-file', { version, ispassed})
}
</script>

<template>
    <div class="table-container">
        <table class="detect-table">
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
.table-container {
    margin: 0 auto;
    width: 80%;
}

.detect-table {
    border: 1px solid #000;
    border-collapse: collapse;
    width: 100%;
}

.detect-table th, .detect-table td {
    padding: 5px 20px;
    text-align: left;
    border: 1px solid #000;
}
</style>