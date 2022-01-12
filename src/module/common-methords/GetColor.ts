import InitData from "@/module/main-entrance/InitData";

export function getColor(index: number) {
  const data = new InitData();
  let currentColor = "#F53440";
  switch (index) {
    case 1:
      currentColor = "#FFFFFF";
      break;
    case 2:
      currentColor = "#000000";
      break;
    case 3:
      currentColor = "#D254CF";
      break;
    case 4:
      currentColor = "#12A9D7";
      break;
    case 5:
      currentColor = "#30A345";
      break;
    case 6:
      currentColor = "#FACF50";
      break;
    case 7:
      currentColor = "#F66632";
      break;
    case 8:
      currentColor = "#989998";
      break;
    case 9:
      currentColor = "#F53440";
      break;
    case 10:
      currentColor = "#F65E95";
      break;
    case 11:
      currentColor = "#16DCDC";
      break;
    case 12:
      currentColor = "#0061D5";
      break;
    case 13:
      currentColor = "#99CC00";
      break;
    case 14:
      currentColor = "#808080";
      break;
  }
  data.setSelectedColor(currentColor);
  return currentColor;
}
