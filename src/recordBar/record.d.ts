declare module "record-types" {
  /**
   * @underLine 레코드바의 아랫줄 => 높이라고 보면 됨
   * @longHeight 레코드 바의 긴 선 높이
   * @shortHeight 레코드 바의 작은 선 높이
   * @textHeight 레코드 바의 text 높이
   */
  export interface CanvasSize {
    underLine: number; // 레코드바의 아랫줄 => 높이라고 보면 됨
    longHeight: number; // 레코드 바의 긴 선 높이
    shortHeight: number; // 레코드 바의 작은 선 높이
    textHeight: number; // 레코드 바의 text 높이
  }

  /**
   * @startX 유저가 클릭한 x 좌표
   * @startY 유저가 클릭한 x 좌표
   * @isClick 유저가 클릭 했는지
   * @isDrag 유저가 드레그 중인지
   */
  export interface UserEvent {
    startX: number;
    startY: number;
    isClick: boolean;
    isDrag: boolean;
  }
}
