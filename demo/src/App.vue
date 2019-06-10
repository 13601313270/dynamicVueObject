<template>
    <div id="app">
        <router-view/>
        <dynamic-vue-object></dynamic-vue-object>
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
