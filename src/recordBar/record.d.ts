declare module "record-types" {
  export interface CanvasSize {
    underLine: number; // 레코드바의 아랫줄 => 높이라고 보면 됨
    longHeight: number; // 레코드 바의 긴 선 높이
    shortHeight: number; // 레코드 바의 작은 선 높이
    textHeight: number; // 레코드 바의 text 높이
  }

  export interface UserEvent {
    startX: number;
    startY: number;
    isClick: boolean;
    isDrag: boolean;
  }
}
