# vue-web-image-edit
web端图片编辑(Vue3版),本插件仅支持Vue3

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
    @destroy-component="destroyComponent">
  </screen-window>
</template>

<script lang="ts">

export default defineComponent({
  setup(props, context) {
    const imageEditStatus = ref<boolean>(false);
    const imageList = ref<string[]>([]);
    // 编辑现有图片数据
    const editImgList = (imgArr: any) => {
        imageList.value = imgArr;
    }
    // 销毁组件函数
    const destroyComponent = function(status: boolean) {
      imageEditStatus.value = status;
    }
    // 获取裁剪区域图片信息
    const getImg = function(base64: string) {
      console.log("截图组件传递的图片信息", base64);
    }
    
    return {
      imageList,
      imageEditStatus,
      editImgList,
      destroyComponent,
      getImg
    }
  }
})
</script>
```
### 参数说明
如示例代码所示，在template中直接使用`screen-short`插件，绑定组件需要的事件处理函数即可。

接下来就跟大家讲下组件中每个属性的意义：
* imageEditStatus 用于控制组件是否出现在dom中
* @destroy-component 用于接收截图组件传递的销毁消息，我们需要在对应的函数中销毁截图组件
* @get-image-data 用于接收截图组件传递的框选区域的base64图片信息，我们需要为他提供一个函数来接收截图组件传递的消息

#### 可选参数
* `enableWebRtc` 是否启用webrtc，值为boolean类型，值为false则使用html2canvas来截图
* `level` 截图容器层级，值为number类型。
* `clickCutFullScreen` 单击截全屏启用状态,值为`boolean`类型， 默认为`false`
## 写在最后
至此，插件的所有使用方法就介绍完了。
