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

# 使用

我们有一个任意的组件，例如temp.vue，这个组件有一个参数`name`

```vue
<template>
    <div>{{name}}</div>
</template>
<script>
export default {
    props: ['name'],
    name: 'temp'
}
</script>
```

## 将这个组件封装成一个函数，函数也有一个参数name。
```javascript
import temp from './temp.vue';
import {createVueObj} from 'dynamic-vue-object'

export function showTemp(name) {
  createVueObj(temp, {
    name
  })
}
```

## 接下来，我们将可以在任何地方使用我们的这个函数了。
```vue
<template>
    <div>
        <button @click="showAlert">打开alert</button>
    </div>
</template>
<script>
import {showTemp} from '****/showTemp.js';
export default {
    methods: {
        showAlert() {
              showTemp('这是标题')
        }
    }
}
</script>
```

# 函数操作结果，
## 有时候需要弹出的组件的操作作为结果，例如：弹出续费会员窗口，监听充值成功，弹出确认弹窗，监听点击确定，我们可以封装成一个Projise

我们有一个组件

```vue
<template>
    <div>
        {{name}}
        <button @click="$emit('ok')">确认</button>
    </div>
</template>
<script>
export default {
    props: ['name'],
    name: 'temp'
}
</script>
```
## 异步函数封装

createVueObj函数第三个参数是组件emit

```javascript
import temp from './temp.vue';
import {createVueObj} from 'dynamic-vue-object'

export function showTemp(name) {
  return new Promise(function(res) {
    createVueObj(temp, {
      name
    }, {
      ok() {
        res()
      }
    })
  })
}
```

## 接下来，我们将可以在任何地方使用我们的这个异步函数了。
```vue
<template>
    <div>
        <button @click="showAlert">打开alert</button>
    </div>
</template>
<script>
import {showTemp} from '****/showTemp.js';
export default {
    methods: {
        showAlert() {
            showTemp('这是标题').then(res => {
                console.log('点击了确定');
            })
        }
    }
}
</script>
```

## 代码结构


| 目录               |                                    | 
|-------------------|:----------------------------------:|
| /dynamicVueObject |  源代码 |
| /demo             |    一个使用了dynamicVueObject的案例   |


完整代码的git仓库是
[https://github.com/13601313270/dynamicVueObject](https://github.com/13601313270/dynamicVueObject)
完整的功能，支持同时弹出多个组件，git仓库里包含一个可以跑起来的demo。
