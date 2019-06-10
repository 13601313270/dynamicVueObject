<template>
    <popupBackground class="center">
        <div class="content">
            <div class="text">
                <div v-html="title"></div>
                <input v-model="inputValue"/>
            </div>
            <button @click="ok">确定</button>
            <button @click="cancel">取消</button>
        </div>
    </popupBackground>
</template>
<script>
    import popupBackground from '../popupBackground';

    export default {
        props: ['title', 'initValue'],
        data() {
            return {
                inputValue: this.initValue
            };
        },
        methods: {
            ok() {
                this.$emit('ok', this.inputValue);
            },
            cancel() {
                this.$emit('cancel');
            }
        },
        components: {
            popupBackground
        }
    }
</script>
<style scoped lang="less">
    .center {
        display: flex;
        justify-content: center;
        align-items: center;

        .content {
            background-color: white;
            padding: 10px;

            input {
                border: solid 1px grey;
            }
        }

        .text {
            padding-bottom: 10px;
        }

        button {
            border: solid 1px grey;
        }
    }
</style>
