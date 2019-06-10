<template>
    <div class="home">
        <img alt="Vue logo" src="../assets/logo.png">
        <div v-html="testVal"></div>
        <button @click="showPrompt">测试弹窗</button>
    </div>
</template>

<script>
    import prompt from '../components/prompt/prompt.js';

    export default {
        name: 'home',
        data() {
            return {
                testVal: 'initVal'
            };
        },
        methods: {
            showPrompt() {
                prompt('输入变量', this.testVal).then(val => {
                    this.testVal = val;
                })
            }
        }
    }
</script>
