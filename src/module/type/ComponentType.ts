// 裁剪框节点事件定义
export type cutOutBoxBorder = {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number; // 样式
  option: number; // 操作
};

// 鼠标起始位置坐标
export type movePositionType = {
  moveStartX: number;
  moveStartY: number;
};

// 裁剪框位置参数
export type positionInfoType = {
  startX: number;
  startY: number;
  width: number;
  height: number;
};

// 图片style参数
export type imgOperationType = {
  multiples: number;
  deg: number;
  endX: number;
  endY: number;
  isMove: boolean;
  startX: number;
  startY: number;
  moveX: number;
  moveY: number;
};

// 裁剪框缩放时所返回的数据类型
export type zoomCutOutBoxReturnType = {
  tempStartX: number;
  tempStartY: number;
  tempWidth: number;
  tempHeight: number;
};

// 绘制裁剪框所返回的数据类型
export type drawCutOutBoxReturnType = {
  startX: number;
  startY: number;
  width: number;
  height: number;
};

export type imageEditType = {
  enableWebRtc?: boolean; // 是否启用webrtc，默认是启用状态
  themeColor?: string; // content背景色配置
  headColor?: string; // head背景色配置
};
