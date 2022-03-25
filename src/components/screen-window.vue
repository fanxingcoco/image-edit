<template>
  <teleport to="body">
    <div class="ante-modal-root" id="imageEdit">
      <div class="ante-modal-mask"></div>
      <div class="ante-modal-wrap">
        <div class="ante-modal" style="width: 60%;">
          <div class="ante-modal-content">
            <div class="ante-modal-close" @click="handleOk"></div>
            <div class="ante-modal-header">
              <div class="ante-modal-title">图片编辑</div>
            </div>
            <div class="ante-modal-body">
              <div id="toolContainer">
                <!--工具栏-->
                <div id="toolPanelTop">
                  <div class="item-panel" style="width: 60px; color: #000;">
                    <input
                      type="checkbox"
                      name="checkAllImg"
                      :checked="imgData.isSelectAll"
                      @click="selectAllImgFun"
                      size="small"
                      style="margin-right: 5px;"
                    />
                    全选
                  </div>
                  <div class="item-panel separateLine"></div>
                  <div class="item-panel delete" title="删除" @click="deleteImgFun"></div>
                  <div
                    class="item-panel shot"
                    title="截图"
                    @click="toolClickEvent('shot', 0, $event)"
                  ></div>
                  <div class="item-panel separateLine"></div>
                  <div
                    v-for="item in toolbar"
                    :key="item.id"
                    :class="
                      `item-panel ${item.title} ${
                        item.title == currentName ? 'active' : ''
                      } ${
                        item.title !== 'undo' || undoStatus ? '' : 'disabled'
                      }`
                    "
                    :title="item.name"
                    @click="toolClickEvent(item.title, item.id, $event)"
                  ></div>
                  <!--撤销部分单独处理-->
                  <!-- <div
                    v-if="undoStatus"
                    class="item-panel undo"
                    title="撤销"
                    @click="toolClickEvent('undo', 10, $event)"
                  ></div>
                  <div v-else class="item-panel undo-disabled"></div> -->
                  <!-- <div
                    class="item-panel clear"
                    title="清除"
                    @click="toolClickEvent('clear', 11, $event)"
                  ></div> -->
                </div>
                <!--画笔绘制选项-->
                <div
                  id="optionPanel"
                  v-show="optionStatus"
                  :style="{
                    left: 0 + optionIcoPosition + 'px',
                    top: 44 + 6 + 'px'
                  }"
                >
                  <!--画笔大小选择-->
                  <div class="brush-select-panel" v-if="currentName !== 'text'">
                    <div
                      :class="
                        penSize == 2
                          ? 'item-panel brush-small active'
                          : 'item-panel brush-small'
                      "
                      @click="setBrushSize('small', 1, $event)"
                    ></div>
                    <div
                      :class="
                        penSize == 5
                          ? 'item-panel brush-medium active'
                          : 'item-panel brush-medium'
                      "
                      @click="setBrushSize('medium', 2, $event)"
                    ></div>
                    <div
                      :class="
                        penSize == 10
                          ? 'item-panel brush-big active'
                          : 'item-panel brush-big'
                      "
                      @click="setBrushSize('big', 3, $event)"
                    ></div>
                  </div>
                  <!--字体选择-->
                  <div class="right-font" v-if="currentName == 'text'">
                    <div
                      :class="textBold ? 'font-bold active' : 'font-bold'"
                      @click="setTextStyle('bold')"
                    >
                      B
                    </div>
                    <div
                      :class="textItalic ? 'font-style active' : 'font-style'"
                      @click="setTextStyle('italic')"
                    >
                      I
                    </div>
                    <select
                      class="font-size"
                      value="14"
                      @change="setTextStyle('size', $event)"
                    >
                      <option value="12">12</option>
                      <option value="14">14</option>
                      <option value="18">18</option>
                      <option value="24">24</option>
                      <option value="32">32</option>
                    </select>
                  </div>
                  <!--颜色选择-->
                  <div class="right-panel" v-if="currentName !== 'mosaicPen'">
                    <div
                      class="color-select-panel"
                      :style="{ background: selectedColor }"
                    ></div>
                    <div class="color-panel">
                      <div
                        class="color-item"
                        v-for="index in 14"
                        :key="index"
                        @click="getColor(index)"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 图片编辑部分 -->
              <div id="imgPanel" ref="imgController">
                <div class="imgList">
                  <div
                    v-for="(item, index) in imgData.imgList"
                    :key="index"
                    :class="`img-list-item ${item.currentImg ? 'active' : ''} `"
                  >
                    <input
                      type="checkbox"
                      name="checkImg"
                      :checked="item.isChecked"
                      @click="value => checkImgFun(value, index)"
                      class="img-list-item-select"
                    />
                    <img
                      :src="item.url"
                      alt=""
                      @click="selectCurImgFun(index)"
                    />
                  </div>
                </div>
                <div class="imgEdit">
                  <div id="imgContainer"
                    @mouseleave="imgOptEvent('mouseLeave')">
                    <canvas
                      id="imageEditContainer"
                      v-show="canvasStatus"
                      :width="screenShortWidth"
                      :height="screenShortHeight"
                      ref="screenShortController"
                    ></canvas>
                    <!--工具栏-->
                    <div
                      id="toolPanel"
                      v-show="toolStatus"
                      :style="{ left: toolLeft + 'px', top: toolTop + 'px' }"
                      ref="toolController"
                    >
                      <!--关闭与确认进行单独处理-->
                      <div
                        class="item-panel close"
                        title="关闭"
                        @click="toolClickEvent('close', 12, $event)"
                      ></div>
                      <div
                        class="item-panel confirm"
                        title="确认"
                        @click="toolClickEvent('confirm', 13, $event)"
                      ></div>
                    </div>
                    <!--文本输入区域-->
                    <div
                      id="textInputPanel"
                      ref="textInputController"
                      v-show="textStatus"
                      contenteditable="true"
                      spellcheck="false"
                    ></div>
                    <img
                      ref="imgOrigController"
                      :src="imgData.currentImgUrl"
                      :style="{
                        transform:
                          'scale(' +
                          imgPosition.multiples +
                          ') rotateZ(' +
                          imgPosition.deg +
                          'deg',
                        left: imgPosition.endX + 'px',
                        top: imgPosition.endY + 'px'
                      }"
                      alt=""
                      @mousemove="
                        e => {
                          imgOptEvent('mouseMove', e);
                        }
                      "
                      @mousedown="
                        e => {
                          imgOptEvent('mouseDown', e);
                        }
                      "
                      @mouseup="imgOptEvent('mouseUp')"
                    />
                  </div>
                  <!-- 图片放大缩小旋转移动操作 -->
                  <div v-show="!canvasStatus" class="img-footer">
                    <div
                      class="item-panel zoom-in"
                      title="放大"
                      @click="imgOptEvent('magnify')"
                    ></div>
                    <div
                      class="item-panel zoom-out"
                      title="缩小"
                      @click="imgOptEvent('shrink')"
                    ></div>
                    <div
                      class="item-panel rotate"
                      title="旋转"
                      @click="imgOptEvent('rotate')"
                    ></div>
                    <!-- <div class="item-panel separateLine" @click="imgOptEvent('move')></div> -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import InitData from "@/module/main-entrance/InitData";
import eventMonitoring from "@/module/main-entrance/EventMonitoring";
import { getColor } from "@/module/common-methords/GetColor";
import {
  setBrushSize,
  setTextStyle
} from "@/module/common-methords/SetBrushSize";
import { SetupContext } from "@vue/runtime-core";
import _ from "lodash";
import toolbar from "@/module/config/Toolbar";
import { reactive } from "vue";

export default {
  name: "screen-window",
  components: {},
  props: {
    imageList: {
      type: Array,
      default: () => []
    }
  },
  setup(props: any, context: any) {
    let data = new InitData();
    const canvasStatus = data.getCanvasStatus();
    const screenShortWidth = data.getScreenShortWidth();
    const screenShortHeight = data.getScreenShortHeight();
    const screenShortController = data.getScreenShortController();
    const toolController = data.getToolController();
    const textInputController = data.getTextInputController();
    const imgOrigController = data.getImgOrigController();
    const textStatus = data.getTextStatus(); // 文本输入状态
    const undoStatus = data.getUndoStatus(); // 撤销
    const currentName = data.getToolName(); // 画笔类型
    const optionStatus = data.getOptionStatus(); // 画笔展示
    const optionIcoPosition = data.getOptionIcoPosition(); // 画笔位置
    const penSize = data.getPenSize(); // 画笔大小
    const textSize = data.getTextSize(); // 文本大小
    const textBold = data.getTextBold(); // 文本粗体
    const textItalic = data.getTextItalic(); // 文本斜体
    const selectedColor = data.getSelectedColor(); // 选中颜色
    const toolStatus = data.getToolStatus(); // 工具栏状态
    const toolLeft = data.getToolLeft(); // 工具栏位置
    const toolTop = data.getToolTop(); // 工具栏位置
    const imgPosition = data.getImgPosition(); // 图片位置
    const event = new eventMonitoring(props, context as SetupContext<any>);
    const toolClickEvent = event.toolClickEvent; // 工具栏点击事件
    const imgOptEvent = event.imgOptEvent; // 图片放大缩小旋转拖拽操作
    const resetComponent = event.resetComponent; // 重置组件

    // 图片原始数据及切换
    const imgData = reactive({
      isSelectAll: false,
      currentImgUrl: "",
      imgList: [
        {
          url: "",
          currentImg: true,
          isChecked: false
        }
      ]
    });
    if (props.imageList.length > 0) {
      imgData.imgList = [];
      props.imageList.map((item: any, index: number) => {
        if (index == 0) {
          imgData.imgList.push({
            url: item,
            currentImg: true,
            isChecked: false
          });
        } else {
          imgData.imgList.push({
            url: item,
            currentImg: false,
            isChecked: false
          });
        }
      });
      imgData.currentImgUrl = imgData.imgList[0].url;
    } else {
      imgData.imgList = [];
      imgData.currentImgUrl = "";
    }
    const selectAllImgFun = (val: { target: { checked: boolean } }) => {
      imgData.isSelectAll = val.target.checked;
      imgData.imgList.forEach((item: { isChecked: boolean }) => {
        item.isChecked = val.target.checked;
      });
    };
    const selectCurImgFun = (val: number) => {
      imgData.imgList.forEach(
        (item: { currentImg: boolean; url: any }, index: number) => {
          if (val == index) {
            item.currentImg = true;
            imgData.currentImgUrl = item.url;
            // 初始化编辑数据
            data.setInitStatus(true);
            data = new InitData();
            resetComponent();
          } else {
            item.currentImg = false;
          }
        }
      );
    };
    const checkImgFun = (
      val: { target: { checked: boolean } },
      numb: number
    ) => {
      let allTag = true; // 图片是否全部被选中
      imgData.imgList.forEach((item: { isChecked: boolean }, index: number) => {
        if (numb == index) {
          item.isChecked = val.target.checked;
        }
        if (!item.isChecked) {
          allTag = false;
        }
      });
      imgData.isSelectAll = allTag;
    };
    const deleteImgFun = () => {
      // 删除图片数据
      const imgArr: any = [];
      if (imgData.isSelectAll || imgData.imgList.length == 0) {
        imgData.imgList = [];
        imgData.currentImgUrl = '';
        // 初始化编辑数据
        data.setInitStatus(true);
        data = new InitData();
        resetComponent();
      } else {
        for (let i = imgData.imgList.length - 1; i >= 0; i--) {
          if (imgData.imgList[i].isChecked) {
            imgData.imgList.splice(i, 1);
          } else {
            imgArr.push(imgData.imgList[i].url);
          }
        }
        // 重新选中图片
        if (imgData.imgList.length > 0) {
          const imgListLength = imgData.imgList.length;
          imgData.imgList[imgListLength-1].currentImg = true;
          imgData.currentImgUrl = imgData.imgList[imgListLength-1].url;
          // 初始化编辑数据
          data.setInitStatus(true);
          data = new InitData();
          resetComponent();
        }
      }
      context.emit("edit-img-list", imgArr);
    };
    // 关闭图片编辑窗口
    const handleOk = () => {
      context.emit("destroy-component", false);
    };

    return {
      canvasStatus,
      screenShortWidth,
      screenShortHeight,
      screenShortController,
      textInputController,
      imgOrigController,
      toolStatus,
      toolController,
      textStatus,
      undoStatus,
      optionStatus,
      currentName,
      optionIcoPosition,
      penSize,
      textSize,
      textBold,
      textItalic,
      selectedColor,
      toolbar,
      toolLeft,
      toolTop,
      imgPosition,
      toolClickEvent,
      imgOptEvent,
      resetComponent,
      getColor,
      setBrushSize,
      setTextStyle,

      imgData,
      selectAllImgFun,
      selectCurImgFun,
      checkImgFun,
      deleteImgFun,

      handleOk
    };
  },
  emits: {
    // vue3中建议对所有emit事件进行验证
    "destroy-component": (status: boolean) => {
      return !_.isNull(status);
    },
    "get-img-data": (data: object) => {
      return !_.isNull(data);
    },
    "edit-img-list": (editImgList: any) => {
      return !_.isNull(editImgList);
    }
  }
};
</script>

<style scoped lang="scss" src="@/assets/scss/screen-window.scss"></style>
