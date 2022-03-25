import { onMounted, onUnmounted, Ref } from "vue";
import { SetupContext } from "@vue/runtime-core";
import {
  cutOutBoxBorder,
  movePositionType,
  zoomCutOutBoxReturnType,
  drawCutOutBoxReturnType,
  positionInfoType
} from "@/module/type/ComponentType";
import {
  clearDrawMasking,
  drawMasking
} from "@/module/split-methods/DrawMasking";
import html2canvas from "html2canvas";
import PlugInParameters from "@/module/main-entrance/PlugInParameters";
import { fixedData, nonNegativeData } from "@/module/common-methords/FixedData";
import { zoomCutOutBoxPosition } from "@/module/common-methords/ZoomCutOutBoxPosition";
import { saveBorderArrInfo } from "@/module/common-methords/SaveBorderArrInfo";
import { drawCutOutBox } from "@/module/split-methods/DrawCutOutBox";
import InitData from "@/module/main-entrance/InitData";
import { calculateToolLocation } from "@/module/split-methods/CalculateToolLocation";
import { drawRectangle } from "@/module/split-methods/DrawRectangle";
import { drawCircle } from "@/module/split-methods/DrawCircle";
import { drawLine } from "@/module/split-methods/DrawLine";
import { drawLineArrow } from "@/module/split-methods/DrawLineArrow";
import { drawPencil, initPencil } from "@/module/split-methods/DrawPencil";
import { drawText } from "@/module/split-methods/DrawText";
import { saveCanvasToImage } from "@/module/common-methords/SaveCanvasToImage";
import { saveCanvasToBase64 } from "@/module/common-methords/SaveCanvasToBase64";
import { drawMosaic } from "@/module/split-methods/DrawMosaic";
import { calculateOptionIcoPosition } from "@/module/split-methods/CalculateOptionIcoPosition";

export default class EventMonitoring {
  // 当前实例的响应式data数据
  private readonly data: InitData;
  private emit: ((event: string, ...args: any[]) => void) | undefined;

  // 截图区域canvas容器
  private screenShortController: Ref<HTMLCanvasElement | null>;
  // 工具栏dom
  private toolController: Ref<HTMLDivElement | null>;
  // 截图图片存放容器
  private screenShortImageController: HTMLCanvasElement | null;
  // 截图区域画布
  private screenShortCanvas: CanvasRenderingContext2D | undefined;
  // 文本区域dom
  private textInputController: Ref<HTMLDivElement | null> | undefined;
  // 原始img区域dom
  private imgOrigController: Ref<HTMLImageElement | null>;
  // video容器用于存放屏幕MediaStream流
  private readonly videoController: HTMLVideoElement;
  // 图形位置参数
  private drawGraphPosition: positionInfoType = {
    startX: 0,
    startY: 0,
    width: 0,
    height: 0
  };
  // 临时图形位置参数
  private tempGraphPosition: positionInfoType = {
    startX: 0,
    startY: 0,
    width: 0,
    height: 0
  };
  // 裁剪框边框节点坐标事件
  private cutOutBoxBorderArr: Array<cutOutBoxBorder> = [];
  // 裁剪框顶点边框直径大小
  private borderSize = 10;
  // 当前操作的边框节点
  private borderOption: number | null = null;
  // 点击裁剪框时的鼠标坐标
  private movePosition: movePositionType = {
    moveStartX: 0,
    moveStartY: 0
  };

  // 裁剪框拖拽状态
  private dragging = false;
  // 裁剪框修剪状态
  private draggingTrim = false;
  // 鼠标拖动状态
  private dragFlag = false;
  // 上一个裁剪框坐标信息
  private drawGraphPrevX = 0;
  private drawGraphPrevY = 0;

  // 当前点击的工具栏条目
  private toolName = "";
  private fontSize = 14;
  private fontBold = false;
  private fontItalic = false;
  // 撤销点击次数
  private undoClickNum = 0;
  // 最大可撤销次数
  private maxUndoNum = 15;
  // 马赛克模糊度
  private degreeOfBlur = 5;
  private history: Array<Record<string, any>> = [];
  // 文本输入框位置
  private textInputPosition: { mouseX: number; mouseY: number } = {
    mouseX: 0,
    mouseY: 0
  };

  constructor(props: Record<string, any>, context: SetupContext<any>) {
    // 实例化响应式data
    this.data = new InitData();
    // 设置实例与属性
    this.data.setPropsData(context.emit);
    // 获取截图区域canvas容器
    this.screenShortController = this.data.getScreenShortController();
    this.toolController = this.data.getToolController();
    this.textInputController = this.data.getTextInputController();
    this.videoController = document.createElement("video");
    this.videoController.autoplay = true;
    this.screenShortImageController = document.createElement("canvas");
    this.imgOrigController = this.data.getImgOrigController();
    onMounted(() => {
      this.emit = this.data.getEmit();
      const plugInParameters = new PlugInParameters();
      const themeColor = plugInParameters.getThemeColor();
      const headColor = plugInParameters.getHeadColor();
      const anteModalContent = document.getElementsByClassName(
        "ante-modal-content"
      )[0] as HTMLElement;
      anteModalContent.style.backgroundColor = themeColor;
      const anteModalHeader = document.getElementsByClassName(
        "ante-modal-header"
      )[0] as HTMLElement;
      anteModalHeader.style.background = headColor;
    });
    onUnmounted(() => {
      // 初始化initData中的数据
      this.data.setInitStatus(true);
    });
  }
  // 获取截屏底图
  public initCapture = () => {
    return new Promise<void>(resolve => {
      this.data.setCaptureState(false); // 更新抓拍底图状态
      const _dom: any = document.getElementById("imgContainer");
      if (this.screenShortImageController == null) return;
      // 设置截图区域canvas宽高
      this.data.setScreenShortInfo(_dom.offsetWidth, _dom.offsetHeight);
      // 设置截图图片存放容器宽高
      this.screenShortImageController.width = _dom.offsetWidth;
      this.screenShortImageController.height = _dom.offsetHeight;
      // 获取截图区域画canvas容器画布
      const contextCanvas = this.screenShortController.value?.getContext("2d");
      if (contextCanvas == null) return;
      // html2canvas截屏
      html2canvas(_dom, {}).then((canvas: any) => {
        // 装载截图的dom为null则退出
        if (this.screenShortController.value == null) return;
        // 存放html2canvas截取的内容
        this.screenShortImageController = canvas;
        // 存储屏幕截图
        this.data.setScreenShortImageController(canvas);
        // 赋值截图区域canvas画布
        this.screenShortCanvas = contextCanvas;
        resolve();
      });
    });
  };

  // 开始截屏
  public captureClickEvent = () => {
    // 获取截图区域画canvas容器画布
    const contextCanvas = this.screenShortController.value?.getContext("2d");
    if (contextCanvas == null) return;
    drawMasking(contextCanvas); // 绘制蒙层
  };

  // 鼠标按下事件
  private mouseDownEvent = (event: MouseEvent) => {
    // 当前操作的是撤销
    if (this.toolName == "undo") return;
    this.dragging = true;
    const mouseX = nonNegativeData(event.offsetX);
    const mouseY = nonNegativeData(event.offsetY);

    // 如果当前操作的是工具栏
    if (this.data.getToolClickStatus().value) {
      // 记录当前鼠标开始坐标
      this.drawGraphPosition.startX = mouseX;
      this.drawGraphPosition.startY = mouseY;
    }
    // 当前操作的是画笔
    if (this.toolName == "brush" && this.screenShortCanvas) {
      // 初始化画笔
      initPencil(this.screenShortCanvas, mouseX, mouseY);
    }
    // 当前操作的文本
    if (
      this.toolName == "text" &&
      this.textInputController?.value &&
      this.screenShortCanvas
    ) {
      // 显示文本输入区域
      this.data.setTextStatus(true);
      // 判断输入框位置是否变化
      if (
        this.textInputPosition.mouseX != 0 &&
        this.textInputPosition.mouseY != 0 &&
        this.textInputPosition.mouseX != mouseX &&
        this.textInputPosition.mouseY != mouseY
      ) {
        this.fontSize = this.data.getTextSize().value;
        this.fontBold = this.data.getTextBold().value;
        this.fontItalic = this.data.getTextItalic().value;
        drawText(
          this.textInputController.value?.innerText,
          this.textInputPosition.mouseX,
          this.textInputPosition.mouseY,
          this.data.getSelectedColor().value,
          this.fontSize,
          this.fontBold,
          this.fontItalic,
          this.screenShortCanvas
        );
        // 清空文本输入区域的内容
        this.textInputController.value.innerHTML = "";
        // 保存绘制记录
        this.addHistory();
      }
      // 计算文本框显示位置
      const textMouseX = mouseX - 15;
      const textMouseY = mouseY - 15;
      // 修改文本区域位置
      this.textInputController.value.style.left = textMouseX + "px";
      this.textInputController.value.style.top = textMouseY + "px";
      setTimeout(() => {
        // 获取焦点
        if (this.textInputController?.value) {
          this.textInputController.value.focus();
          // 记录当前输入框位置
          this.textInputPosition = { mouseX: mouseX, mouseY: mouseY };
        }
      });
    }

    // 如果操作的是裁剪框
    if (this.borderOption) {
      // 设置为拖动状态
      this.draggingTrim = true;
      // 记录移动时的起始点坐标
      this.movePosition.moveStartX = mouseX;
      this.movePosition.moveStartY = mouseY;
    } else {
      // 保存当前裁剪框的坐标
      this.drawGraphPrevX = this.drawGraphPosition.startX;
      this.drawGraphPrevY = this.drawGraphPosition.startY;
      // 绘制裁剪框,记录当前鼠标开始坐标
      this.drawGraphPosition.startX = mouseX;
      this.drawGraphPosition.startY = mouseY;
    }
  };

  // 鼠标移动事件
  private mouseMoveEvent = (event: MouseEvent) => {
    if (
      this.screenShortCanvas == null ||
      this.screenShortController.value == null ||
      this.toolName == "undo"
    )
      return;

    // 工具栏未选择且鼠标处于按下状态时
    if (!this.data.getToolClickStatus().value && this.dragging) {
      // 修改拖动状态为true;
      this.dragFlag = true;
      // 隐藏工具栏
      this.data.setToolStatus(false);
    }
    // 获取当前绘制中的工具位置信息
    const { startX, startY, width, height } = this.drawGraphPosition;
    // 获取当前鼠标坐标
    const currentX = nonNegativeData(event.offsetX);
    const currentY = nonNegativeData(event.offsetY);
    // 绘制中工具的临时宽高
    const tempWidth = currentX - startX;
    const tempHeight = currentY - startY;
    // 工具栏绘制
    if (this.data.getToolClickStatus().value && this.dragging) {
      // 当前操作的不是马赛克则显示最后一次画布绘制时的状态
      if (this.toolName != "mosaicPen") {
        this.showLastHistory();
      }
      switch (this.toolName) {
        case "square":
          drawRectangle(
            this.screenShortCanvas,
            startX,
            startY,
            tempWidth,
            tempHeight,
            this.data.getSelectedColor().value,
            this.data.getPenSize().value
          );
          break;
        case "round":
          drawCircle(
            this.screenShortCanvas,
            currentX,
            currentY,
            startX,
            startY,
            this.data.getPenSize().value,
            this.data.getSelectedColor().value
          );
          break;
        case "line":
          drawLine(
            this.screenShortCanvas,
            startX,
            startY,
            currentX,
            currentY,
            this.data.getPenSize().value,
            this.data.getSelectedColor().value
          );
          break;
        case "right-top":
          drawLineArrow(
            this.screenShortCanvas,
            startX,
            startY,
            currentX,
            currentY,
            30,
            10,
            this.data.getPenSize().value,
            this.data.getSelectedColor().value
          );
          break;
        case "brush":
          // 画笔绘制
          drawPencil(
            this.screenShortCanvas,
            currentX,
            currentY,
            this.data.getPenSize().value,
            this.data.getSelectedColor().value
          );
          break;
        case "mosaicPen":
          // 绘制马赛克，为了确保鼠标位置在绘制区域中间，所以对x、y坐标进行-10处理
          drawMosaic(
            this.screenShortCanvas,
            currentX - 10,
            currentY - 10,
            this.data.getPenSize().value * 2, // 马赛克画笔在原有画笔大小的基础上放大,使模糊效果明显
            this.degreeOfBlur,
            this.screenShortController.value as HTMLCanvasElement,
            this.screenShortImageController as HTMLCanvasElement
          );
          break;
        default:
          break;
      }
    } else {
      // 执行裁剪框操作函数
      this.operatingCutOutBox(
        currentX,
        currentY,
        startX,
        startY,
        width,
        height,
        this.screenShortCanvas
      );
      // 如果鼠标未点击或者当前操作的是裁剪框都return
      if (!this.dragging || this.draggingTrim) return;
      // 绘制裁剪框
      this.tempGraphPosition = drawCutOutBox(
        startX,
        startY,
        tempWidth,
        tempHeight,
        this.screenShortCanvas,
        this.borderSize,
        this.screenShortController.value as HTMLCanvasElement,
        this.screenShortImageController as HTMLCanvasElement
      ) as drawCutOutBoxReturnType;
    }
  };

  // 鼠标抬起事件
  private mouseUpEvent = () => {
    // 当前操作的是撤销
    if (this.toolName == "undo") return;
    // 绘制结束
    this.dragging = false;
    this.draggingTrim = false;
    if (
      this.screenShortController.value == null ||
      this.screenShortCanvas == null ||
      this.screenShortImageController == null
    )
      return;

    // 工具栏未点击且鼠标未拖动且单击截屏状态为false则复原裁剪框位置
    if (!this.data.getToolClickStatus().value && !this.dragFlag) {
      // 复原裁剪框的坐标
      this.drawGraphPosition.startX = this.drawGraphPrevX;
      this.drawGraphPosition.startY = this.drawGraphPrevY;
      return;
    }
    if (this.data.getToolClickStatus().value) {
      // 保存绘制记录
      this.addHistory();
      return;
    }
    // 保存绘制后的图形位置信息
    this.drawGraphPosition = this.tempGraphPosition;
    // 如果工具栏未点击则保存裁剪框位置
    if (!this.data.getToolClickStatus().value) {
      const { startX, startY, width, height } = this.drawGraphPosition;
      this.data.setCutOutBoxPosition(startX, startY, width, height);
    }
    // 保存边框节点信息
    this.cutOutBoxBorderArr = saveBorderArrInfo(
      this.borderSize,
      this.drawGraphPosition
    );
    if (this.screenShortController.value != null) {
      // 修改鼠标状态为拖动
      this.screenShortController.value.style.cursor = "move";
      // 复原拖动状态
      this.dragFlag = false;
      // 显示工具栏
      this.data.setToolStatus(true);
      setTimeout(() => {
        if (this.toolController.value != null) {
          // 计算工具栏位置
          const toolLocation = calculateToolLocation(
            this.drawGraphPosition,
            this.toolController.value?.offsetWidth
          );
          // 设置工具栏位置
          this.data.setToolInfo(toolLocation.mouseX, toolLocation.mouseY);
        }
      });
    }
  };

  /**
   * 操作裁剪框
   * @param currentX 裁剪框当前x轴坐标
   * @param currentY 裁剪框当前y轴坐标
   * @param startX 鼠标x轴坐标
   * @param startY 鼠标y轴坐标
   * @param width 裁剪框宽度
   * @param height 裁剪框高度
   * @param context 需要进行绘制的canvas画布
   * @private
   */
  private operatingCutOutBox(
    currentX: number,
    currentY: number,
    startX: number,
    startY: number,
    width: number,
    height: number,
    context: CanvasRenderingContext2D
  ) {
    // canvas元素不存在
    if (this.screenShortController.value == null) {
      return;
    }
    // 获取鼠标按下时的坐标
    const { moveStartX, moveStartY } = this.movePosition;

    // 裁剪框边框节点事件存在且裁剪框未进行操作，则对鼠标样式进行修改
    if (this.cutOutBoxBorderArr.length > 0 && !this.draggingTrim) {
      // 标识鼠标是否在裁剪框内
      let flag = false;
      // 判断鼠标位置
      context.beginPath();
      for (let i = 0; i < this.cutOutBoxBorderArr.length; i++) {
        context.rect(
          this.cutOutBoxBorderArr[i].x,
          this.cutOutBoxBorderArr[i].y,
          this.cutOutBoxBorderArr[i].width,
          this.cutOutBoxBorderArr[i].height
        );
        // 当前坐标点处于8个可操作点上，修改鼠标指针样式
        if (context.isPointInPath(currentX, currentY)) {
          switch (this.cutOutBoxBorderArr[i].index) {
            case 1:
              this.screenShortController.value.style.cursor = "move";
              break;
            case 2:
              // 工具栏被点击则不改变指针样式
              this.screenShortController.value.style.cursor = "ns-resize";
              break;
            case 3:
              // 工具栏被点击则不改变指针样式
              this.screenShortController.value.style.cursor = "ew-resize";
              break;
            case 4:
              // 工具栏被点击则不改变指针样式
              this.screenShortController.value.style.cursor = "nwse-resize";
              break;
            case 5:
              // 工具栏被点击则不改变指针样式
              this.screenShortController.value.style.cursor = "nesw-resize";
              break;
            default:
              break;
          }
          this.borderOption = this.cutOutBoxBorderArr[i].option;
          flag = true;
          break;
        }
      }
      context.closePath();
      if (!flag) {
        // 鼠标移出裁剪框重置鼠标样式
        this.screenShortController.value.style.cursor = "default";
        // 重置当前操作的边框节点为null
        this.borderOption = null;
      }
    }

    // 裁剪框正在被操作
    if (this.draggingTrim) {
      // 当前操作节点为1时则为移动裁剪框
      if (this.borderOption === 1) {
        // 计算要移动的x轴坐标
        const x = fixedData(
          currentX - (moveStartX - startX),
          width,
          this.screenShortController.value.width
        );
        // 计算要移动的y轴坐标
        const y = fixedData(
          currentY - (moveStartY - startY),
          height,
          this.screenShortController.value.height
        );
        // 重新绘制裁剪框
        this.tempGraphPosition = drawCutOutBox(
          x,
          y,
          width,
          height,
          context,
          this.borderSize,
          this.screenShortController.value as HTMLCanvasElement,
          this.screenShortImageController as HTMLCanvasElement
        ) as drawCutOutBoxReturnType;
      } else {
        // 裁剪框其他8个点的拖拽事件
        const {
          tempStartX,
          tempStartY,
          tempWidth,
          tempHeight
        } = zoomCutOutBoxPosition(
          currentX,
          currentY,
          startX,
          startY,
          width,
          height,
          this.borderOption as number
        ) as zoomCutOutBoxReturnType;
        // 绘制裁剪框
        this.tempGraphPosition = drawCutOutBox(
          tempStartX,
          tempStartY,
          tempWidth,
          tempHeight,
          context,
          this.borderSize,
          this.screenShortController.value as HTMLCanvasElement,
          this.screenShortImageController as HTMLCanvasElement
        ) as drawCutOutBoxReturnType;
      }
    }
  }

  /**
   * 裁剪框工具栏点击事件
   * @param toolName
   * @param index
   * @param mouseEvent
   */
  public toolClickEvent = (toolName: string, index: number) => {
    let undoStatus = this.data.getUndoStatus();
    if(this.toolName == "undo" && !undoStatus) return; // 如果是撤销操作 且状态为false 
    // 显示canvas图层
    this.data.setCanvasStatus(true);

    // 更新当前点击的工具栏条目
    this.toolName = toolName;
    this.data.setToolName(toolName);

    // 截图操作过程中不允许画图
    const state = this.data.getToolStatus(); // 此处为截图工具栏
    if (state.value && this.toolName != "close" && this.toolName != "confirm") {
      window.alert("请确认或取消截图!");
      return;
    }

    // 修改鼠标样式
    if (this.screenShortController.value == null) return;
    if (toolName == "save" || toolName == "download" || toolName == "undo") {
      this.screenShortController.value.style.cursor = "default";
    } else if (toolName == "clear") {
      if (this.imgOrigController.value) {
        this.imgOrigController.value.style.cursor = "move";
      }
    } else if (toolName == "text") {
      this.screenShortController.value.style.cursor = "text";
    } else {
      this.screenShortController.value.style.cursor = "crosshair";
    }

    // 隐藏/显示画笔选择工具栏
    if (
      toolName == "shot" ||
      toolName == "save" ||
      toolName == "download" ||
      toolName == "undo" ||
      toolName == "clear" ||
      toolName == "close" ||
      toolName == "confirm"
    ) {
      // 隐藏画笔选择工具栏
      this.data.setOptionStatus(false);
    } else {
      // 显示画笔选择工具栏
      this.data.setOptionStatus(true);
      // 设置画笔选择工具栏三角形角标位置
      this.data.setOptionIcoPosition(calculateOptionIcoPosition(index));
    }
    
    // 初始化监听
    if (
      toolName != "save" &&
      toolName != "download" &&
      toolName != "undo" &&
      toolName != "clear" &&
      toolName != "close" &&
      toolName != "confirm"
    ) {
      // 添加监听
      this.screenShortController.value?.addEventListener(
        "mousedown",
        this.mouseDownEvent
      );
      this.screenShortController.value?.addEventListener(
        "mousemove",
        this.mouseMoveEvent
      );
      this.screenShortController.value?.addEventListener(
        "mouseup",
        this.mouseUpEvent
      );
    }

    // 清空文本输入区域的内容并隐藏文本输入框
    if (this.textInputController?.value != null && this.data.getTextStatus()) {
      this.textInputController.value.innerHTML = "";
      this.data.setTextStatus(false);
    }

    // 初始化点击状态
    this.dragging = false;
    this.draggingTrim = false;
    this.dragFlag = false;

    // 截图画图后需要重新绘制底图 注意：画图工具直接获取底图；截图 保存 确认 需要等底图绘制完成后才能进行后续操作
    const captureState = this.data.getCaptureState();
    if (
      captureState.value &&
      toolName != "shot" &&
      toolName != "save" &&
      toolName != "download" &&
      toolName != "confirm"
    ) {
      this.initCapture(); // 获取截屏底图
    }
    if (toolName == "shot") { // 打开截图功能
      if (captureState.value) {
        this.initCapture().then(() => {
          this.captureClickEvent(); // 开始截屏
        });
      } else {
        this.captureClickEvent(); // 开始截屏
      }
    } else if (toolName == "save") { // 保存图片
      if (captureState.value) {
        this.initCapture().then(() => {
          this.getCanvasImgData('save');
        });
      } else {
        this.getCanvasImgData('save');
      }
    } else if (toolName == "download") { // 下载图片
      if (captureState.value) {
        this.initCapture().then(() => {
          this.getCanvasImgData('download');
        });
      } else {
        this.getCanvasImgData('download');
      }
    } else if (toolName == "undo") { // 撤销
      this.takeOutHistory();
    } else if (toolName == "close" || toolName == "clear") { // 重置组件
      this.resetComponent();
    } else if (toolName == "confirm" && this.screenShortCanvas && this.emit) { // 确认截图
      if (captureState.value) {
        this.initCapture().then(() => {
          this.getCanvasImgData('shot');
        });
      } else {
        this.getCanvasImgData('shot');
      }
    }
    // 设置工具栏点击状态
    if (toolName != "shot") {
      this.data.setToolClickStatus(true);
    } else {
      this.data.setToolClickStatus(false);
    }
  };

  /**
   * 保存当前画布状态
   * @private
   */
  private addHistory() {
    if (
      this.screenShortCanvas != null &&
      this.screenShortController.value != null
    ) {
      // 获取canvas画布与容器
      const context = this.screenShortCanvas;
      const controller = this.screenShortController.value;
      if (this.history.length > this.maxUndoNum) {
        // 删除最早的一条画布记录
        this.history.shift();
      }
      // 保存当前画布状态
      this.history.push({
        data: context.getImageData(0, 0, controller.width, controller.height)
      });
      // 启用撤销按钮
      this.data.setUndoStatus(true);
      // // 启用撤销按钮
      // this.data.setRedoStatus(true);
    }
  }

  /**
   * 显示最新的画布状态
   * @private
   */
  private showLastHistory() {
    if (this.screenShortCanvas != null) {
      const context = this.screenShortCanvas;
      if (this.history.length <= 0) {
        this.addHistory();
      }
      context.putImageData(this.history[this.history.length - 1]["data"], 0, 0);
    }
  }

  /**
   * 取出一条历史记录
   */
  private takeOutHistory() {
    const lastImageData = this.history.pop();
    if (this.screenShortCanvas != null && lastImageData) {
      const context = this.screenShortCanvas;
      if (this.undoClickNum == 0 && this.history.length > 0) {
        // 首次取出需要取两条历史记录
        const firstPopImageData = this.history.pop() as Record<string, any>;
        context.putImageData(firstPopImageData["data"], 0, 0);
      } else {
        context.putImageData(lastImageData["data"], 0, 0);
      }
    }
    this.undoClickNum++;
    // 历史记录已取完，禁用撤回按钮点击
    if (this.history.length <= 0) {
      this.undoClickNum = 0;
      this.data.setUndoStatus(false);
    }
    // if (this.history.length >=) {
    //   this.redoClickNum = 0;
    //   // 启用撤销按钮
    //   this.data.setRedoStatus(false);
    // }
  }

  /**
   * 重置组件
   */
  public resetComponent = () => {
    if (this.emit) {
      // 清除绘制的蒙层
      const contextCanvas = this.screenShortController.value?.getContext("2d");
      if (contextCanvas) {
        clearDrawMasking(contextCanvas);
      }
      this.draggingTrim = false;
      this.cutOutBoxBorderArr = []; // 清除裁剪边框数据
      this.history = []; // 清除历史数据
      this.data.setToolStatus(false); // 隐藏工具栏
      this.data.setCanvasStatus(false); // 隐藏canvas图层
      // 重置组件
      // this.emit("destroy-component", false);
      return;
    }
    throw "组件重置失败";
  };

  /**
   * 将指定区域的canvas转为图片
   * @private
   */
  private getCanvasImgData = (isSave: string) => {
    // 获取裁剪区域位置信息
    const { startX, startY, width, height } = this.data.getCutOutBoxPosition();
    let base64 = "";
    // 保存图片,需要减去八个点的大小
    if (this.screenShortCanvas && this.screenShortController.value) {
      if (isSave == 'shot') {
        // 保存截图时
        // 清除绘制的蒙层(为了去掉八个点 且不改变框选区域大小)
        const contextCanvas = this.screenShortController.value?.getContext(
          "2d"
        );
        if (contextCanvas) {
          clearDrawMasking(contextCanvas);
        }
      }
      // 使用drawImage将图片绘制到蒙层下方
      this.screenShortCanvas.save();
      this.screenShortCanvas.globalCompositeOperation = "destination-over";
      this.screenShortCanvas.drawImage(
        this.screenShortImageController as HTMLCanvasElement,
        0,
        0,
        this.screenShortController.value?.width,
        this.screenShortController.value?.height
      );
      this.screenShortCanvas.restore(); // 绘制结束
      if (isSave == 'save' || isSave == 'download') {
        // 下载图片
        let isDownLoad = false
        if(isSave == 'download') {
          isDownLoad = true
        }
        // 将canvas转为图片
        base64 = saveCanvasToImage(
          this.screenShortCanvas,
          0,
          0,
          this.screenShortController.value?.width,
          this.screenShortController.value?.height,
          isDownLoad
        );
      } else {
        // 保存截图
        // 将canvas转为base64
        base64 = saveCanvasToBase64(
          this.screenShortCanvas,
          startX,
          startY,
          width,
          height
        );
        // 重置图片和位置
        if (this.imgOrigController.value) {
          this.imgOrigController.value.src = base64;
          const data = {
            multiples: 1,
            deg: 0,
            endX: 0,
            endY: 0,
            isMove: false,
            startX: 0,
            startY: 0,
            moveX: 0,
            moveY: 0
          };
          this.data.setImgPosition(data); // 重置位置
        }
        this.data.setCaptureState(true); // 重新抓拍底图
      }
      this.resetComponent(); // 重置组件
      if (this.emit && (isSave == 'save' || isSave == 'shot')) {
        this.emit("get-img-data", {type: isSave, base64: base64});
      }
    }
    return base64;
  };

  /**
   * img的放大缩小旋转移动操作
   */
  public imgOptEvent = (
    value: string,
    e: any
  ) => {
    const canvasStatus = this.data.getCanvasStatus();
    if (canvasStatus.value) return;
    const imgPosition = this.data.getImgPosition();
    if (value == "magnify") {
      if (imgPosition.value.multiples >= 10) {
        return;
      }
      imgPosition.value.multiples += 0.25;
    } else if (value == "shrink") {
      if (imgPosition.value.multiples <= 0) {
        return;
      }
      imgPosition.value.multiples -= 0.25;
    } else if (value == "rotate") {
      imgPosition.value.deg += 90;
      if (imgPosition.value.deg >= 360) {
        imgPosition.value.deg = 0;
      }
    } else if (value == "mouseDown") {
      e.preventDefault()
      imgPosition.value.isMove = true;
      imgPosition.value.startX = e.clientX;
      imgPosition.value.startY = e.clientY;
    } else if (value == "mouseMove") {
      // 当鼠标拖拽图片的时候，才计算移动距离
      // 移动图片相对于父元素的位置
      if (imgPosition.value.isMove && this.imgOrigController.value) {
        // 鼠标移动的距离
        imgPosition.value.moveX = e.clientX;
        imgPosition.value.moveY = e.clientY;
        // 相对页面的距离
        const x = imgPosition.value.moveX - imgPosition.value.startX;
        const y = imgPosition.value.moveY - imgPosition.value.startY;
        imgPosition.value.endX = this.imgOrigController.value.offsetLeft + x;
        imgPosition.value.endY = this.imgOrigController.value.offsetTop + y;
        // 记录上次移动的距离
        imgPosition.value.startX = imgPosition.value.moveX;
        imgPosition.value.startY = imgPosition.value.moveY;
      }
    } else if (value == "mouseUp") {
      imgPosition.value.isMove = false;
    } else if (value == "mouseLeave") {
      imgPosition.value.isMove = false;
    }
    // 设置样式
    const data = {
      multiples: imgPosition.value.multiples,
      deg: imgPosition.value.deg,
      endX: imgPosition.value.endX,
      endY: imgPosition.value.endY,
      isMove: imgPosition.value.isMove,
      startX: imgPosition.value.startX,
      startY: imgPosition.value.startY,
      moveX: imgPosition.value.moveX,
      moveY: imgPosition.value.moveY
    };
    this.data.setImgPosition(data);
    // 重新抓拍底图
    if (value != "mouseMove" && value != "mouseDown") {
      this.data.setCaptureState(true);
    }
  };
}
