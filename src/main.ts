import { App } from "vue";
import screenWindow from "@/components/screen-window.vue";
import PlugInParameters from "@/module/main-entrance/PlugInParameters";
import { imageEditType } from "@/module/type/ComponentType";

export default {
  install(app: App, options: imageEditType): void {
    const plugInParameters = new PlugInParameters();
    // if (options?.enableWebRtc != null) {
    //   plugInParameters.setWebRtcStatus(options.enableWebRtc);
    // }

    // if (options?.level != null) {
    //   plugInParameters.setLevel(options.level);
    // }

    // if (options?.clickCutFullScreen != null) {
    //   plugInParameters.serClickCutFullScreenStatus(options.clickCutFullScreen);
    // }
    if (options?.themeColor != null) {
      plugInParameters.setThemeColor(options.themeColor);
    }
    if (options?.headColor != null) {
      plugInParameters.setHeadColor(options.headColor);
    }
    // 将截屏组件挂载到vue实例
    app.component(screenWindow.name, screenWindow);
  }
};
