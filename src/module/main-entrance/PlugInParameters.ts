let enableWebRtc = false;
let initStatus = false; // 数据初始化标识
let themeColor = "#1f1f1f";
let headColor = "#1f1f1f";

export default class PlugInParameters {
  constructor() {
    // 标识为true时则初始化数据
    if (initStatus) {
      enableWebRtc = false;
      initStatus = false; // 初始化完成设置其值为false
      themeColor = "#1f1f1f";
      headColor = "#1f1f1f";
    }
  }

  // 设置数据初始化标识
  public setInitStatus(status: boolean) {
    initStatus = status;
  }
  // 获取数据初始化标识
  public getInitStatus() {
    return initStatus;
  }

  // 获取webrtc启用状态
  public getWebRtcStatus() {
    return enableWebRtc;
  }
  // 设置webrtc启用状态
  public setWebRtcStatus(status: boolean) {
    enableWebRtc = status;
  }

  public getThemeColor() {
    return themeColor;
  }
  public setThemeColor(val: string) {
    themeColor = val;
  }

  public getHeadColor() {
    return headColor;
  }
  public setHeadColor(val: string) {
    headColor = val;
  }
}
