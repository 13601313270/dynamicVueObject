/**
 * Created by ptmind on 2018/9/20.
 */
// 用于动态向全局(main-content.vue)添加vue对象，常用于类似弹窗的功能等临时对象的添加
import Vue from 'vue';

var events = require('events');
var eventEmitter = new events.EventEmitter();
export const dynamicVueEvent = eventEmitter;
let allGolbueVueObj = [];

let dyVueObj = Vue.extend({
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
        dynamicVueEvent.on('getVueObj', (vueObj, Callback) => {
            const findRes = this.allGlobleVue.findIndex(item => {
                return item.vueObj === vueObj
            })
            if (findRes > -1) {
                Callback(allGolbueVueObj[findRes])
            }
        });
    },
    data() {
        return {
            allGlobleVue: [] // 临时动态添加的窗体，例如弹窗等
        }
    },
    render(createElement) {
        allGolbueVueObj = this.allGlobleVue.map(item => {
            return createElement(item.vueObj, {
                props: item.attr,
                on: item.event
            })
        })
        return createElement('div', {}, allGolbueVueObj);
    }
});
let instance = new dyVueObj({
    el: document.createElement('div'),
});

document.body.appendChild(instance.$el);

export function createVueObj(vueClass, attr, event) {
    let vueObj = Vue.extend(vueClass);
    dynamicVueEvent.emit('addVueObj', vueObj, attr, event);
    return vueObj;
}

export function deleteVueObj(obj) {
    dynamicVueEvent.emit('deleteVueObj', obj);
}

// 获取由vueClass创建的实例
export function getVueObj(obj, callback) {
    dynamicVueEvent.emit('getVueObj', obj, callback);
}
