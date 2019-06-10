<template>
    <div id="app">
        <div>需要在"全局"的地方部署dynamic-vue-object.vue组件</div>
        <dynamic-vue-object></dynamic-vue-object>
        <router-view/>
    </div>
</template>
<script>
    import dynamicVueObject from './components/dynamicVueObject/dynamicVueObject.vue';

    export default {
        name: 'home',
        components: {
            dynamicVueObject
        }
    }
</script>
<style lang="less">
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }
</style>
