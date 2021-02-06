# vue组件函数化

我们在vue项目开发过程中总是遇到各种个样的全局弹窗（权限提醒，alert提示，缴费提醒），这些全局弹窗全站很多地方在调用，调用调用很蛮烦，将这些组件部署到全局位置，又无法做到按需加载，而且部署到全局的组件数据回传（比如检测缴费是否完成）又是一个问题，我们又得借助vuex或者event来传递，又回造成vuex的滥用。

我们举一个简单的场景：
如果我们要在vue里实现一个类似原生alert的弹出框，大概长这个样子。
```
<template>
    <div class="popup_background">
        <div>
            <div v-html="title"></div>
            <button @click="ok">确定</button>
            <button @click="cancel">否定</button>
        </div>
    </div>
</template>
<script>
export default {
    props: ['text'],
    data() {
        return {};
    },
    methods: {
        ok() {
            this.$emit('ok');
        },
        cancel() {
            this.$emit('cancel');
        }
    }
}
</script>
```
如果有一个页面，需要使用这个组件，即使是空页面，也要做下面代码里描述的所有事情
```
<template>
    <div>
        <button @click="showAlert">打开alert</button>
        <ui-alert v-if="isShow" title="这是标题" @ok="fine" @cancel="cancel"></ui-alert>
    </div>
</template>
<script>
import uiAlert from '******.vue';  // 引用组件
export default {
    data() {
        return {
            isShow:false  //控制弹窗是否显示的开关
        };
    },
    methods: {
        showAlert() {  //控制弹窗显示
            this.isShow = true;
        },
        fine() {  //弹窗打开后点击ok的事件绑定
            this.isShow = false;
            // 点击ok触发的事情
        },
        cancel() {  //弹窗打开后点击cancel的事件绑定
            this.isShow = false;
            // 点击cancel触发的事情
        }
    },
    components:{uiAlert}
}
</script>
```
汇总一下，做的事情有
1、引用组件
2、设置控制显示的变量开关
3、设置弹出组件的函数
4、设置多个回调事件，监听返回值

但是我们想一下，假如我们可以像调用原生组件类似的形式，一个函数搞定，会更方便。获取返回值的方式比如promise、回调。比如我们封装成返回promise的一个函数，代码可能像下面这样。
```
<template>
    <div>
        <button @click="showAlert">打开alert</button>
    </div>
</template>
<script>
import popAlert from '*******';
export default {
    methods: {
        showAlert() {
              popAlert('这是标题').then(res=>{
                      // res 就是true或者false，代表点击了ok还是cancel
              })
        }
    }
}
</script>
```
这样调用起来很方便，我们可以看看类似alert这样的弹出框，有一些特点，就是过程化，它从被创建到使用，再到最后销毁，这个过程相对调用的页面是独立的，交互过程是高度过程化的。不像其他组件和页面直接可能多次交互。简单来说，就是“用完即删”。再有就是布局独立，布局层面跟调用者不存在占位归属，更像是全局的组件。
只要符合这种特点的组件，封装成函数，是更方便的策略。

那么如何封装出一个类似刚才例子中popAlert这样的函数呢？我们要保留组件要使用vue的开发方式，也就是说，我们要把已经存在的vue组件不进行任何改动，在组件外对它通过包装的形式形成一个函数。这样vue组件可以向前兼容，并且组件继续使用vue的开发方式。


#全局按需动态加载
我想到的实现方式，就是利用render函数。我们在一个“全局”的地方，所有页面都会加载的最外层的模板，比如跟路由配置的那个App.vue。在这里添加我们要开发的，可以动态改变状态的组件。
```
<template>
    <div id="app">
        <router-view/>
        <!--全局的地方添加一个组件-->
        <dynamic-vue></dynamic-vue>
    </div>
</template>
.........
```
我们看一下dynamic-vue的实现
```
<!--一个用于创建临时vue对象的容器，例如选择弹窗，提示窗，或其他场景下使用的"用完即删"型需求-->
<script>
export default {
    data() {
        return {
            globleVue: null // 临时动态添加的窗体，例如弹窗等
            /*
            {
                vueObj: 'vue组件',
                attr:{  //初始化组件的props
                },
                on:{  //组件的emit回调绑定
                }
            }
            */
        }
    },
    render(createElement) {
        if(this.globleVue){
            return createElement(this.globleVue.vueObj, {
                props: this.globleVue.attr,
                on: this.globleVue.event
            });
        }
        else {
            return createElement('div');
        }
    }
}
</script>
```
接下来我们只要能够通过某些方法把globleVue赋值成包含vue组件的对象，初始化的参数，回调方法的对象，全局就会弹出这个组件。我的实现方式是使用自带的events对globleVue进行修改。我们在created里面增加event的监听。
```
<script>
import { dynamicVueEvent } from 'dynamicVueObject.js';
export default {
    created() {
        // 支持全局调用临时添加，用完即删型vue组件
        dynamicVueEvent.on('addVueObj', (vueObj, attr, event) => {
            this.globleVue = {
                vueObj,
                attr,
                event
            };
        });
        dynamicVueEvent.on('deleteVueObj', () => {
            this.globleVue = null;
        });
    },
    data() {
        return {
            globleVue: null
        }
    },
    render(createElement) {
        if(this.globleVue){
            return createElement(this.globleVue.vueObj, {
                props: this.globleVue.attr,
                on: this.globleVue.event
            });
        }
        else {
            return createElement('div');
        }
    }
}
</script>
```
触发 dynamicVueEvent 事件的代码。
```
// dynamicVueObject.js
import Vue from 'vue';
var events = require('events');
var eventEmitter = new events.EventEmitter();
export function createVueObj(vueClass, attr, event) {
    let vueObj = Vue.extend(vueClass);
    dynamicVueEvent.emit('addVueObj', vueObj, attr, event);
}
export function deleteVueObj() {
    dynamicVueEvent.emit('deleteVueObj');
}

```
dynamicVueObject.js暴露了两个函数，一个动态创建组件createVueObj，一个清空组件deleteVueObj。我们就有了在全局动态控制弹出组件的这个功能。我们可以在任何地方通过这两个函数控制全局弹窗了。

接下来我们就可以对已经存在的alert.vue组件，不进行修改的基础上，单独封装一个独立的函数。
![image.png](https://upload-images.jianshu.io/upload_images/8105934-cfefa0c15bf568b1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
我们在原始的alert.vue旁边创建一个alert.js，这样调用者很容易发现和调用。
```
/*
    alert.js
    alert.vue组件函数化
*/
// 引入全局创建组件，和全局删除组件两个方法
import { createVueObj, deleteVueObj } from '../dynamicVueObject/dynamicVueObject';
import alertVue from './alert.vue'; // 引入要使用的组件

export function alert(text) {
    return new Promise((resolve, reject) => {
        let dyVueObj = createVueObj(alertVue, {
            text
        }, {
            ok() {
                resolve(true);
                deleteVueObj(dyVueObj); // 删除掉弹出的组件
            },
            cancel() {
                resolve(false);
                deleteVueObj(dyVueObj); // 删除掉弹出的组件
            }
        });
    });
}
```
这样alert函数封装完毕了。不到20行就可以针对alert.vue封装一个promise方式的alert，很方便，接下来我们就可以调用一下这个alert函数
```
<template>
    <div>
        <button @click="showAlert">打开alert</button>
    </div>
</template>
<script>
import popAlert from '****/alert.js';
export default {
    methods: {
        showAlert() {
              popAlert('这是标题').then(res=>{
                      // res 就是true或者false，代表点击了ok还是cancel
              })
        }
    }
}
</script>
```
这样调用就方便多了！！！
大概实现逻辑就是如此了。
#后续做的优化
##1、不再使用手动部署dynamicVueObject.vue到一个全局的地方。
不再使用手动部署dynamicVueObject.vue到一个全局的地方，而是在dynamicVueObject.js第一次执行的时候，在body上添加一个动态创建的新div上。
```
let dyVueObj = Vue.extend({
        /*****dynamicVueObject.vue******/
});
// 添加到一个动态的div上
let instance = new dyVueObj({
    el: document.createElement('div'),
});
// 添加到body上
document.body.appendChild(instance.$el);

export function createVueObj(vueClass, attr, event) {
    let vueObj = Vue.extend(vueClass);
    dynamicVueEvent.emit('addVueObj', vueObj, attr, event);
    return vueObj;
}

export function deleteVueObj(obj) {
    dynamicVueEvent.emit('deleteVueObj', obj);
}
```
##2、支持同时弹出多个组件
allGlobleVue改为了一个数组，支持添加多个弹出组件createVueObj方法的返回值，作为deleteVueObj删除方法的参数。
```
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
});
```

## 代码结构


| 目录               |                                    | 
|-------------------|:----------------------------------:|
| /dynamicVueObject |  源代码 |
| /demo             |    一个使用了dynamicVueObject的案例   |


完整代码的git仓库是
[https://github.com/13601313270/dynamicVueObject](https://github.com/13601313270/dynamicVueObject)
完整的功能，支持同时弹出多个组件，git仓库里包含一个可以跑起来的demo。
