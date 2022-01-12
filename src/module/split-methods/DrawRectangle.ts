/**
 * 绘制矩形
 * @param context 需要进行绘制的canvas画布
 * @param mouseX
 * @param mouseY
 * @param width
 * @param height
 * @param color 边框颜色
 * @param borderWidth 边框大小
 * @param controller 需要进行操作的canvas容器
 * @param imageController 图片canvas容器
 */
export function drawRectangle(
  context: CanvasRenderingContext2D,
  mouseX: number,
  mouseY: number,
  width: number,
  height: number,
  color: string,
  borderWidth: number
) {
  context.save();
  // 设置边框颜色
  context.strokeStyle = color;
  // 设置边框大小
  context.lineWidth = borderWidth;
  context.beginPath();
  // 绘制矩形
  context.rect(mouseX, mouseY, width, height);
  context.stroke();
  // 绘制结束
  context.restore();
}
