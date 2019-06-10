<!--一个用于创建临时vue对象的容器，例如选择弹窗，提示窗，或其他场景下使用的"用完即删"型需求-->
<script>
import { dynamicVueEvent } from './dynamicVueObject';
export default {
    created() {
        // 支持全局调用临时添加，用完即删型vue组件
        dynamicVueEvent.on('addVueObj', (vueObj, attr, event) => {
            this.allGlobleVue.push({
                vueObj, attr, event
            });
        });
        dynamicVueEvent.on('deleteVueObj', (vueObj) => {
            this.allGlobleVue.splice(this.allGlobleVue.findIndex(item => {
                return item.vueObj === vueObj
            }), 1);
        });
    },
    data() {
        return {
            allGlobleVue: [] // 临时动态添加的窗体，例如弹窗等
        }
    },
    render(createElement) {
        return createElement('div', {}, this.allGlobleVue.map(item => {
            return createElement(item.vueObj, {
                props: item.attr,
                on: item.event
            })
        }));
    }
}
</script>