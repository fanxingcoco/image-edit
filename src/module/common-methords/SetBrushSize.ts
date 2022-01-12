import InitData from "@/module/main-entrance/InitData";

/**
 * 设置画笔大小
 * @param size
 * @param index
 * @param mouseEvent
 */
export function setBrushSize(size: string) {
  const data = new InitData();
  let sizeNum = 2;
  switch (size) {
    case "small":
      sizeNum = 2;
      break;
    case "medium":
      sizeNum = 5;
      break;
    case "big":
      sizeNum = 10;
      break;
  }
  data.setPenSize(sizeNum);
  return sizeNum;
}

/**
 * 设置文本样式
 * @param type
 * @param index
 * @param mouseEvent
 */
export function setTextStyle(type: string, event: MouseEvent) {
  const data = new InitData();
  const sizeNum = 2;
  if (type == "bold") {
    const bold = data.getTextBold();
    data.setTextBold(!bold.value);
  } else if (type == "italic") {
    const italic = data.getTextItalic();
    data.setTextItalic(!italic.value);
  } else if (type == "size") {
    const dom = event.target as HTMLSelectElement;
    const size = parseInt(dom.value);
    data.setTextSize(size);
  }
  return sizeNum;
}
