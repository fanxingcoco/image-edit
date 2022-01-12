import { ComponentInternalInstance, ref } from "vue";
import {
  positionInfoType,
  imgOperationType
} from "@/module/type/ComponentType";
// 是否显示canvas画布
const canvasStatus = ref<boolean>(false);
// 截图容器宽高
const screenShortWidth = ref<number>(0);
const screenShortHeight = ref<number>(0);
// 工具栏展示状态与位置
const toolStatus = ref<boolean>(false);
const toolLeft = ref<number>(0);
const toolTop = ref<number>(0);
// 工具栏点击状态
const toolClickStatus = ref<boolean>(false);
// 工具栏画笔选择显示状态
const optionStatus = ref<boolean>(false);
// 当前选择的颜色
const selectedColor = ref<string>("#F53340");
// 当前点击的工具栏名称
const toolName = ref<string>("");
// 当前选择的画笔大小
const penSize = ref<number>(2);
// 当前选择的画笔大小
const textSize = ref<number>(14);
// 当前选择的画笔大小
const textBold = ref<boolean>(false);
// 当前选择的画笔大小
const textItalic = ref<boolean>(false);
// 文本输入工具栏点击状态
const textClickStatus = ref<boolean>(false);
// 撤销状态
const undoStatus = ref<boolean>(false);
// 工具栏画笔选择三角形角标位置
const optionIcoPosition = ref<number>(0);
// 裁剪框位置参数
let cutOutBoxPosition: positionInfoType = {
  startX: 0,
  startY: 0,
  width: 0,
  height: 0
};
// 图片放大缩小旋转拖拽操作
const imgPosition = ref<imgOperationType>({
  multiples: 1, // 放大或者缩小
  deg: 0, // 旋转的角度
  endX: 0,
  endY: 0,
  isMove: false, // 是否开始拖拽
  startX: 0, // 鼠标的点击X轴
  startY: 0, // 鼠标的点击Y轴
  moveX: 0, // 鼠标移动的X轴
  moveY: 0 // 鼠标移动的Y轴
});
// 是否重新抓拍底图
const captureState = ref<boolean>(true);

// 获取截图容器dom
let screenShortController = ref<HTMLCanvasElement | null>(null);
// 获取工具栏容器dom
let toolController = ref<HTMLDivElement | null>(null);
// 屏幕截图容器
let screenShortImageController: HTMLCanvasElement | null = null;
// 获取文本输入区域dom
let textInputController = ref<HTMLDivElement | null>(null);
// 获取原始img图片dom
let imgOrigController = ref<HTMLImageElement | null>(null);
// 当前实例
let currentInstance: ComponentInternalInstance | null | undefined;
// 事件处理
let emit: ((event: string, ...args: any[]) => void) | undefined;

// 数据初始化标识
let initStatus = false;

export default class InitData {
  constructor() {
    // 标识为true时则初始化数据
    if (initStatus) {
      // 初始化完成设置其值为false
      initStatus = false;
      canvasStatus.value = false;
      screenShortWidth.value = 0;
      screenShortHeight.value = 0;
      screenShortController = ref(null);
      toolController = ref(null);
      textInputController = ref(null);
      imgOrigController = ref(null);
      cutOutBoxPosition = {
        startX: 0,
        startY: 0,
        width: 0,
        height: 0
      };
      toolStatus.value = false;
      optionStatus.value = false;
      emit = undefined;
      currentInstance = undefined;
      toolClickStatus.value = false;
      optionIcoPosition.value = 0;
      selectedColor.value = "#F53340";
      toolName.value = "";
      penSize.value = 2;
      textSize.value = 14;
      textBold.value = false;
      textItalic.value = false;
      imgPosition.value = {
        multiples: 1, // 放大或者缩小
        deg: 0, // 旋转的角度
        endX: 0,
        endY: 0,
        isMove: false, // 是否开始拖拽
        startX: 0, // 鼠标的点击X轴
        startY: 0, // 鼠标的点击Y轴
        moveX: 0, // 鼠标移动的X轴
        moveY: 0 // 鼠标移动的Y轴
      };
      captureState.value = true;
      undoStatus.value = false;
    }
  }

  // 获取/设置数据初始化标识
  public getInitStatus() {
    return initStatus;
  }
  public setInitStatus(status: boolean) {
    initStatus = status;
  }

  // 获取/设置画布显示状态
  public getCanvasStatus() {
    return canvasStatus;
  }
  public setCanvasStatus(status: boolean) {
    canvasStatus.value = status;
  }

  // 获取/设置截图容器宽高
  public getScreenShortWidth() {
    return screenShortWidth;
  }
  public getScreenShortHeight() {
    return screenShortHeight;
  }
  public setScreenShortInfo(width: number, height: number) {
    screenShortWidth.value = width;
    screenShortHeight.value = height;
  }

  // 获取/设置工具栏展示状态
  public getToolStatus() {
    return toolStatus;
  }
  public setToolStatus(status: boolean) {
    toolStatus.value = status;
  }

  // 获取/设置文本输入工具栏展示状态
  public getTextStatus() {
    return textClickStatus;
  }
  public setTextStatus(status: boolean) {
    textClickStatus.value = status;
  }

  // 获取/设置屏幕截图容器
  public getScreenShortImageController() {
    return screenShortImageController;
  }
  public setScreenShortImageController(imageController: HTMLCanvasElement) {
    screenShortImageController = imageController;
  }

  // 获取/设置截图工具位置信息
  public getToolLeft() {
    return toolLeft;
  }
  public getToolTop() {
    return toolTop;
  }
  public setToolInfo(left: number, top: number) {
    toolLeft.value = left;
    toolTop.value = top;
  }

  // 获取/设置工具栏点击状态
  public getToolClickStatus() {
    return toolClickStatus;
  }
  public setToolClickStatus(status: boolean) {
    toolClickStatus.value = status;
  }

  // 获取/设置裁剪框位置信息
  public getCutOutBoxPosition() {
    return cutOutBoxPosition;
  }
  public setCutOutBoxPosition(
    mouseX: number,
    mouseY: number,
    width: number,
    height: number
  ) {
    cutOutBoxPosition.startX = mouseX;
    cutOutBoxPosition.startY = mouseY;
    cutOutBoxPosition.width = width;
    cutOutBoxPosition.height = height;
  }

  // 获取/设置原始图片样式数据
  public getImgPosition() {
    return imgPosition;
  }
  public setImgPosition(data: imgOperationType) {
    imgPosition.value = data;
  }

  // 获取/设置裁剪框拖拽状态
  public getCaptureState() {
    return captureState;
  }
  public setCaptureState(status: boolean) {
    captureState.value = status;
  }

  // 获取/设置撤销状态
  public getUndoStatus() {
    return undoStatus;
  }
  public setUndoStatus(status: boolean) {
    undoStatus.value = status;
  }

  // 获取/设置工具栏画笔选择工具展示状态
  public getOptionStatus() {
    return optionStatus;
  }
  public setOptionStatus(status: boolean) {
    optionStatus.value = status;
  }

  // 获取/设置三角形角标位置
  public getOptionIcoPosition() {
    return optionIcoPosition;
  }
  public setOptionIcoPosition(position: number) {
    optionIcoPosition.value = position;
  }

  // 获取/设置当前选择的颜色
  public getSelectedColor() {
    return selectedColor;
  }
  public setSelectedColor(color: string) {
    selectedColor.value = color;
  }

  // 获取/设置当前点击的工具栏条目名称
  public getToolName() {
    return toolName;
  }
  public setToolName(itemName: string) {
    toolName.value = itemName;
  }

  // 获取/设置当前画笔大小
  public getPenSize() {
    return penSize;
  }
  public setPenSize(size: number) {
    penSize.value = size;
  }

  // 获取/设置当前文本大小
  public getTextBold() {
    return textBold;
  }
  public setTextBold(size: boolean) {
    textBold.value = size;
  }

  // 获取/设置当前画笔大小
  public getTextItalic() {
    return textItalic;
  }
  public setTextItalic(size: boolean) {
    textItalic.value = size;
  }

  // 获取/设置当前文本大小
  public getTextSize() {
    return textSize;
  }
  public setTextSize(size: number) {
    textSize.value = size;
  }

  // 获取截图容器dom
  public getScreenShortController() {
    return screenShortController;
  }

  // 获取工具栏dom
  public getToolController() {
    return toolController;
  }

  // 获取文本输入区域dom
  public getTextInputController() {
    return textInputController;
  }

  // 获取文本输入区域dom
  public getImgOrigController() {
    return imgOrigController;
  }

  /**
   * 设置父组件传递的数据
   * @param emitParam
   */
  public setPropsData(emitParam: (event: string, ...args: any[]) => void) {
    emit = emitParam;
  }

  /**
   * 设置实例属性
   * @param instanceParam
   */
  public setProperty(instanceParam: ComponentInternalInstance | null) {
    currentInstance = instanceParam;
  }

  // 获取当前实例
  public getCurrentInstance() {
    return currentInstance;
  }

  // 获取当前emit
  public getEmit() {
    return emit;
  }
}
