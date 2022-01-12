import { positionInfoType } from "@/module/type/ComponentType";

/**
 * 计算工具栏位置
 * @param position 裁剪框位置信息
 * @param toolWidth 工具栏宽度
 */
export function calculateToolLocation(
  position: positionInfoType,
  toolWidth: number
) {
  // 工具栏X轴坐标 = (裁剪框的宽度 - 工具栏的宽度) / 2 + 裁剪框距离左侧的距离
  const mouseX = (position.width - toolWidth) / 2 + position.startX;
  // 工具栏Y轴坐标
  let mouseY = position.startY + position.height + 10;
  // const bodyH = document.body.clientHeight;
  const _dom: any = document.getElementById("imgContainer")?.offsetHeight;
  if (position.width < 0 && position.height < 0) {
    // 从右下角拖动时，工具条y轴的位置应该为position.startY + 10
    mouseY = position.startY + 10;
  } else if (mouseY + 45 > _dom) {
    mouseY = mouseY - 65;
  }
  return {
    mouseX,
    mouseY
  };
}
