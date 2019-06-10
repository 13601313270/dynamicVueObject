<!--弹窗元素的背景黑幕-->
<template>
    <div class="popup_background">
        <slot></slot>
    </div>
</template>
<script>
export default {
    props: [],
    data() {
        return {};
    },
    methods: {}
}
</script>
<style scoped lang="less">
    .popup_background {
        position: fixed;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        background-color: rgba(128, 128, 128, 0.6);
    }
</style>