/**
 * 绘制箭头
 * @param context 需要进行绘制的画布
 * @param mouseStartX 鼠标按下时的x轴坐标 P1
 * @param mouseStartY 鼠标按下式的y轴坐标 P1
 * @param mouseX 当前鼠标x轴坐标 P2
 * @param mouseY 当前鼠标y轴坐标 P2
 * @param borderWidth 边框宽度
 * @param color 边框颜色
 */
export function drawLine(
  context: CanvasRenderingContext2D,
  mouseStartX: number,
  mouseStartY: number,
  mouseX: number,
  mouseY: number,
  borderWidth: number,
  color: string
) {
  // 开始绘制
  context.save();
  context.beginPath();
  // 移动笔触到P1
  context.moveTo(mouseStartX, mouseStartY);
  // 绘制P1到P2的直线
  context.lineTo(mouseX, mouseY);
  // 上色
  context.strokeStyle = color;
  context.lineWidth = borderWidth;
  // 填充
  context.stroke();
  // 结束绘制
  context.restore();
}
