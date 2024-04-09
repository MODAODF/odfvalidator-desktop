<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const detectResult = JSON.parse(route.query.detectResult as string)

function goHome() {
    router.push('/')
}
</script>

<template>
    <div class="detect-content">
        <ol>
            <li v-for="(detectInfo, path) in detectResult" :key="path" class="detect-list">
                <span v-for="(value, key) in detectInfo" :key="key">
                    <b :class="value[0].standard ? 'detect-success' : 'detect-fail'">
                        {{ value[1].msg }}
                    </b>
                    <p>儲存的 ODF 格式版本：{{ value[2].rootDocVersion }}</p>
                    <p>最後儲存的應用工具：{{ value[3].generator }}</p>
                    <p v-if="value[4]?.canFix" class="detect-canfix">
                        {{ `可將 ${key.toString().split('/').pop()} 透過「ODF」文件應用工具「另存新檔」以通過檢驗` }}
                        <br>
                    </p>
                </span>
            </li>
        </ol>
        <br>
        <button @click="goHome">回到檢測首頁</button>
    </div>
</template>

<style>
.detect-content {
    margin-left: 50px;
}

.detect-list {
    text-align: left;
}

.detect-success {
    color: green;
}

.detect-fail {
    color: red;
}

.detect-canfix {
    color: blue;
}
</style>