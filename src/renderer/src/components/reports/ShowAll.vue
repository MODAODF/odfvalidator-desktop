<script setup lang="ts">

const props = defineProps({
    detectResult: {
        type: Object as () => Record<string, any>,
        required: true
    }
})
</script>

<template>
    <div>
        <ol>
            <li v-for="(detectInfo, path) in props.detectResult" :key="path" class="detect-list">
                <span v-for="(value, key) in detectInfo" :key="key">
                    <b :class="value[0].standard ? 'detect__success' : 'detect__fail'">
                        {{ value[1].msg }}
                    </b>
                    <p>儲存的 ODF 格式版本：{{ value[2].rootDocVersion || '未知' }}</p>
                    <p>最後儲存的應用工具：{{ value[3].generator || '未知' }}</p>
                    <p v-if="value[4]?.canFix" class="detect-canfix">
                        {{ `可將 ${key.toString().split('/').pop()} 透過「ODF」文件應用工具「另存新檔」以通過檢驗` }}
                        <br>
                    </p>
                </span>
            </li>
        </ol>
    </div>
</template>

<style>
</style>