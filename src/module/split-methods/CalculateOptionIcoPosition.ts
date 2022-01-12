/**
 * 计算工具栏画笔选项三角形角标位置
 * @param index
 */
export function calculateOptionIcoPosition(index: number) {
  switch (index) {
    case 1:
      return 170 + 24 * 0 + 8;
    case 2:
      return 170 + 24 * 2 - 2;
    case 3:
      return 170 + 24 * 4 - 10;
    case 4:
      return 170 + 24 * 5 + 6;
    case 5:
      return 170 + 24 * 7 - 4;
    case 6:
      return 170 + 24 * 9 - 12;
    case 7:
      return 170 + 24 * 10;
    default:
      return 170;
  }
}
