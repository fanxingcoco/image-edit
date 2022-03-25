# vue-web-image-edit
web端图片编辑(Vue3版),本插件仅支持Vue3
效果图如下：![Image text]()

## 插件安装
```bash
yarn add vue-web-image-edit
# or
npm install vue-web-image-edit --save
```

## 插件使用
由于插件使用Vue3编写，因此它只能在Vue3项目中运行

* 在项目的入口文件`main.ts/main.js`中加入下述代码
```javascript
// 导入截屏插件
import screenWindow from "vue-web-image-edit";
const app = createApp(App);
// 使用截屏插件
app.use(screenWindow, { themeColor: '#1f1f1f', headColor: '#1f1f1f' })
```
* 在你的需要使用的业务代码中，添加下述代码
```vue
<template>
  <!--截图组件-->
  <screen-window
    v-if="imageEditStatus"
    :imageList="imageList"
    @edit-img-list="editImgList"
    @destroy-component="destroyComponent"
    @get-img-data="getImgData">
  </screen-window>
</template>

<script lang="ts">

export default defineComponent({
  setup(props, context) {
    // 控制组件显示状态
    const imageEditStatus = ref<boolean>(false);
    // 图片信息
    const imageList = ref<string[]>([]);
    // 编辑现有图片数据
    const editImgList = (imgArr: any) => {
        imageList.value = imgArr;
    }
    // 销毁组件函数
    const destroyComponent = function(status: boolean) {
      imageEditStatus.value = status;
    }
    // 获取裁剪图片、绘图图片信息
    const getImgData = function(data: { type: string|undefined; base64: string|undefined; }) {
      // imageUrl.value = data.base64
      // if(data.base64 && data.type == 'save') {
      //   imageList.value.push(data.base64)
      //   imageEditStatus.value = false;
      // }
      console.log("图片编辑弹框传递的图片信息", data.base64);
    }
    
    return {
      imageList,
      imageEditStatus,
      editImgList,
      destroyComponent,
      getImgData
    }
  }
})
</script>
```
### 参数说明
如示例代码所示，在template中直接使用`screen-window`插件，绑定组件需要的事件处理函数即可。
#### 组件中属性的意义
* imageEditStatus 用于控制组件是否出现在dom中
* imageList 用于存储编辑的图片信息 例如：`imageList.value = [require('@/assets/image/person.png')]`
* @destroy-component 用于接收图片编辑后传递的销毁消息，需要在对应的函数中销毁编辑弹框
* @edit-img-list 用于接收图片编辑器中删除的imageList数据，保持数据一致
* @get-image-data 用于接收图片编辑后传递的base64图片信息，在确认截图(type: "shot")和保存(type: "save“)绘制图片事件后触发

#### 可选参数
* `themeColor` 设置弹框body底色
* `headColor` 设置弹框head底色
