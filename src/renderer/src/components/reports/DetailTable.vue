<template>
    <div class="detail__contain">
        <div class="detail__item">
            <span>文字格子線</span>
            <span>連續空白</span>
            <span>Enter 換頁</span>
        </div>
        <div>
            <span class="detail__passed">合格</span>
            <span class="detail__passed">合格</span>
            <span class="detail__failed">建議修改</span>
        </div>
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    detailData: {
        type: Object as () => Record<string, any>,
        require: true
    }
})

</script>

<style lang="scss">
.detail__contain {
    background-color: rgb(124, 134, 141);
    border-radius: 5px;
    padding: 25px;

    div {
        display: flex;
        justify-content: space-around;
    }
}

.detail__item > span,
.detail__passed,
.detail__failed {
    color: white;
    font-size: 0.85rem;
    text-align: center;
    flex: 1;
    max-width: 120px;
}

.detail__passed,
.detail__failed {
    color: rgb(124, 134, 141);
    border-radius: 10px;
    font-size: 1.3rem;
    margin: 10px;
    padding: 10px 0;
}

.detail__passed {
    background-color: white;
}

.detail__failed {
    background-color: rgb(248, 234, 73);
}
</style>