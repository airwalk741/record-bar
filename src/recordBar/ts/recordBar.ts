interface CanvasSize {
  underLine: number;
  longHeight: number;
  shortHeight: number;
  textHeight: number;
}

// 받은 시간 구하는 곳
function currentDate(data: string | number) {
  const resUtc = new Date(data);
  const year = resUtc.getFullYear();
  const month = ("0" + (resUtc.getMonth() + 1)).slice(-2);
  const date = ("0" + resUtc.getDate()).slice(-2);

  const hours = ("0" + resUtc.getHours()).slice(-2);
  const minutes = ("0" + resUtc.getMinutes()).slice(-2);
  const seconds = ("0" + resUtc.getSeconds()).slice(-2);

  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

// 위치가지고 index 구하기
function solutionLocationIndex(
  location: number,
  selectedTimeScope: number,
  canvasContainer: any
): number {
  return (
    (location * 60 * selectedTimeScope) / canvasContainer.current.clientWidth
  );
}

// index 가지고 위치 구하기
function solutionLocation(
  index: number,
  selectedTimeScope: number,
  canvasContainer: any
): number {
  const data =
    (canvasContainer.current.clientWidth * index) / (60 * selectedTimeScope);
  return data;
}

// 시간 가지고 index 구하기
function solutionTimeIndex(time: number, startWidthTime: number): number {
  return (time - startWidthTime) / 1000;
}

// index 가지고 시간 구하기
function solutionTime(index: number, startWidthTime: number): number {
  return startWidthTime + 1000 * index;
}

// underline 그리기
function drawUnderline(ctx: any, myCanvas: any, myCanvasSize: CanvasSize) {
  ctx.beginPath();
  ctx.moveTo(0, myCanvasSize.underLine);
  ctx.lineTo(myCanvas.current.width, myCanvasSize.underLine);
  ctx.stroke();
}

// 스틱 그리기
function drawStick(
  targetX: number,
  ctx: any,
  myCanvasSize: CanvasSize,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(
    targetX - 2,
    myCanvasSize.longHeight,
    4,
    myCanvasSize.underLine - myCanvasSize.longHeight
  );
  ctx.beginPath();
  ctx.moveTo(targetX - 15, myCanvasSize.underLine);
  ctx.lineTo(targetX, myCanvasSize.underLine - 7);
  ctx.lineTo(targetX + 15, myCanvasSize.underLine);
  ctx.closePath();
  ctx.fill();
}

// 긴 선 그리기
function drawLongline(
  ctx: any,
  location: number,
  inputDate: number,
  myCanvasSize: CanvasSize
) {
  ctx.fillRect(
    location,
    myCanvasSize.longHeight,
    2,
    myCanvasSize.underLine - myCanvasSize.longHeight
  ); // 긴 선
  ctx.font = "15px bold";
  ctx.fillStyle = "black";
  ctx.fillText(
    `${(
      "0" + Math.floor((inputDate / (60 * 60 * 1000) + 9) % 24).toString()
    ).slice(-2)}시 ${(
      "0" + Math.floor((inputDate / (60 * 1000)) % 60).toString()
    ).slice(-2)}분`,
    location - 25,
    myCanvasSize.textHeight
  );
}

// 다음날짜 box 처리하기 및 날짜 입력
function drawNextDateBox(
  ctx: any,
  location: number,
  inputDate: number,
  myCanvasSize: CanvasSize
) {
  const date = currentDate(inputDate).split(" ")[0];
  ctx.fillStyle = "rgb(202, 200, 200)";
  ctx.fillRect(location - 35, myCanvasSize.textHeight - 38, 85, 25);
  ctx.fillStyle = "black";
  ctx.fillText(date, location - 30, myCanvasSize.textHeight - 20);
}

// 짧은 선 그리기
function drawShortline(ctx: any, location: number, myCanvasSize: CanvasSize) {
  ctx.fillRect(
    location,
    myCanvasSize.shortHeight,
    1,
    myCanvasSize.underLine - myCanvasSize.shortHeight
  );
}

// x 좌표
function canvasX(myCanvas: any, clientX: number) {
  const bound = myCanvas.current.getBoundingClientRect();
  const bw = 0; // 임시
  return (
    (clientX - bound.left - bw) *
    (myCanvas.current.width / (bound.width - bw * 2))
  );
}

// y 좌표
function canvasY(myCanvas: any, clientY: number) {
  const bound = myCanvas.current.getBoundingClientRect();
  const bw = 0; // 임시
  return (
    (clientY - bound.top - bw) *
    (myCanvas.current.height / (bound.height - bw * 2))
  );
}

export {
  currentDate,
  solutionLocationIndex,
  solutionLocation,
  solutionTimeIndex,
  solutionTime,
  drawStick,
  drawLongline,
  drawNextDateBox,
  drawShortline,
  drawUnderline,
  canvasX,
  canvasY,
};
