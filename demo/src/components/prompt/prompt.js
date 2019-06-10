/**
 * Created by ptmind on 2018/9/21.
 */
import {createVueObj, deleteVueObj} from '../dynamicVueObject/dynamicVueObject';
// createVueObj  全局生成组件函数
// deleteVueObj  全局删除由createVueObj生成的组件
import promptVue from './prompt.vue';

export default function(title, initValue) {
    return new Promise((resolve, reject) => {
        let dyVueObj = createVueObj(promptVue, {
            title,
            initValue
        }, {
            ok(res) {
                deleteVueObj(dyVueObj);// 点完ok关闭弹窗
                resolve(res);
            },
            cancel() {
                deleteVueObj(dyVueObj);// 点完cancel关闭弹窗
                reject();
            }
        });
    });
}
