/**
 * Created by ptmind on 2018/9/20.
 */
// 用于动态向全局(main-content.vue)添加vue对象，常用于类似弹窗的功能等临时对象的添加
import Vue from 'vue';
var events = require('events');
var eventEmitter = new events.EventEmitter();
export const dynamicVueEvent = eventEmitter;
export function createVueObj(vueClass, attr, event) {
    let vueObj = Vue.extend(vueClass);
    dynamicVueEvent.emit('addVueObj', vueObj, attr, event);
    return vueObj;
}
export function deleteVueObj(obj) {
    dynamicVueEvent.emit('deleteVueObj', obj);
}
