<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import Overview from '../components/reports/Overview.vue'

const route = useRoute()
const router = useRouter()
const detectResult = JSON.parse(route.query.detectResult as string)

function goHome() {
    router.push('/')
}

</script>

<template>
    <Overview :detect-result="detectResult"></Overview>
    <br>
    <button @click="goHome">回到檢測首頁</button>
</template>