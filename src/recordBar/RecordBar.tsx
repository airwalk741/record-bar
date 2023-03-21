import React, {
  memo,
  useEffect,
  useRef,
  useState,
  MutableRefObject,
} from "react";
import styles from "./recordBar.module.css";
import {
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
} from "./ts/recordBar";

import { CanvasSize, UserEvent } from "record-types";

const myCanvasSize: CanvasSize = {
  underLine: 100,
  longHeight: 55,
  shortHeight: 75,
  textHeight: 40,
};

const dragValue: any = {
  "10": 300,
  "60": 900,
  "360": 1000 * 6,
  "1440": 1000 * 22,
};

const userEvent: UserEvent = {
  startX: 0,
  startY: 0,
  isClick: false,
  isDrag: false,
};

/**
 * selectedTimeScope에 따른 선과 선사이의 시간
 */
const oneLineTime: any = {
  "10": 10,
  "60": 60,
  "360": 60 * 6,
  "1440": 60 * 20,
};

/**
 * selectedTimeScope에 따라 긴 선인지 아닌지 확인하는 용도
 */
const longLineTime: any = {
  "10": (hour: number, minute: number, second: number) =>
    !second ? true : false,
  "60": (hour: number, minute: number, second: number) =>
    !second && minute % 10 === 0 ? true : false,
  "360": (hour: number, minute: number, second: number) =>
    !second && !minute ? true : false,
  "1440": (hour: number, minute: number, second: number) =>
    !second && !minute && hour % 4 === 0 ? true : false,
};

let startWidthTime: number;
let longLine = 1000 * 60;
let flagStick: number;
let userStickTargetTime: number;
let setIntervalID: any = null;
let isStickMouseOver = -1;
let mousewheelData = 0;

const RecordBar = ({}) => {
  const myCanvas = useRef() as MutableRefObject<HTMLCanvasElement>;
  const canvasContainer = useRef() as MutableRefObject<HTMLDivElement>;
  const [selectedTimeScope, setSelectedTimeScope] = useState<number>(10);
  const [useTime, setUseTime] = useState<string>(
    currentDate(new Date().getTime())
  );

  // 1초마다 새로 그리기
  useEffect(() => {
    reTouch("");
    setIntervalID = setInterval(() => {
      reTouch("");
    }, 1000);
    return () => {
      if (setIntervalID) {
        clearInterval(setIntervalID);
      }
    };
  }, []);

  // 버튼 클릭하면 긴선 기준 비꾸기
  useEffect(() => {
    mousewheelData = 0;
    if (selectedTimeScope === 10) {
      longLine = 1000 * 60;
    } else if (selectedTimeScope === 60) {
      longLine = 1000 * 60 * 10;
    } else if (selectedTimeScope === 360) {
      longLine = 1000 * 60 * 60;
    } else if (selectedTimeScope === 1440) {
      longLine = 1000 * 60 * 60 * 4;
    }

    if (setIntervalID) {
      clearInterval(setIntervalID);
    }
    reTouch("", true);
    setIntervalID = setInterval(() => {
      reTouch("");
    }, 1000);
  }, [selectedTimeScope]);

  function reTouch(event: string, isUnitChange?: boolean) {
    const ctx: any = myCanvas.current.getContext("2d");
    ctx.canvas.width = canvasContainer.current.clientWidth;
    ctx.fillStyle = "rgb(160, 160, 160)";

    // 밑에 긴 선 그리기
    drawUnderline(ctx, myCanvas, myCanvasSize);
    // 현재 시간
    if (mousewheelData && !event) {
      mousewheelData += 1000;
    }

    // 마우스 휠로 이동했으면 이동한 값이 현재 값
    const currentStartTime = mousewheelData
      ? parseInt((new Date(mousewheelData).getTime() / 1000).toString()) * 1000
      : parseInt((new Date().getTime() / 1000).toString()) * 1000;

    // 현재 시간과 사용자가 이벤트한 시간의 차이
    const differTime = parseInt(
      (
        (oneLineTime[`${selectedTimeScope}`] * 1000 -
          (currentStartTime % (oneLineTime[`${selectedTimeScope}`] * 1000))) /
        1000
      ).toString()
    );

    // div의 80% 지점을 기준으로 깃발 꽂기
    // 10분이라면 8분
    // 60분이라면 48분
    const flagIndex = solutionLocationIndex(
      canvasContainer.current.clientWidth * 0.8,
      oneLineTime[`${selectedTimeScope}`],
      canvasContainer
    );

    flagStick = selectedTimeScope * 0.8;
    startWidthTime = currentStartTime - 1000 * flagIndex;
    for (
      let i = differTime;
      i <= 60 * selectedTimeScope;
      i += oneLineTime[`${selectedTimeScope}`]
    ) {
      ctx.fillStyle = "rgb(160, 160, 160)";

      const inputDate = solutionTime(i, startWidthTime); // i 가지고 시간 구하기
      const location = solutionLocation(i, selectedTimeScope, canvasContainer); // 그릴 위치 구하기

      const resUtc = new Date(inputDate);
      const hours = Number(resUtc.getHours());
      const minutes = Number(resUtc.getMinutes());
      const seconds = resUtc.getSeconds();

      if (longLineTime[selectedTimeScope](hours, minutes, seconds)) {
        // 긴선 그리기
        drawLongline(ctx, location, inputDate, myCanvasSize);
      } else {
        // 짧은 선 그리기
        drawShortline(ctx, location, myCanvasSize);
      }

      if (
        // 다음날짜 회색 box 처리하기 및 날짜 입력
        hours === 0 &&
        minutes === 0 &&
        seconds === 0
      ) {
        drawNextDateBox(ctx, location, inputDate, myCanvasSize);
      }
    }

    // 스틱부분
    if (!userStickTargetTime) {
      userStickTargetTime = currentStartTime;
    } else {
      if (event !== "click") {
        userStickTargetTime += 1000; // ? 왜 500으로 해야 동작하지
      }
    }
    const index = solutionTimeIndex(userStickTargetTime, startWidthTime);
    const targetX = solutionLocation(index, selectedTimeScope, canvasContainer);
    if (Math.abs(isStickMouseOver - targetX) <= 15) {
      drawStick(targetX, ctx, myCanvasSize, "blue");
    } else {
      drawStick(targetX, ctx, myCanvasSize, "crimson");
    }

    setUseTime(currentDate(userStickTargetTime));
  }

  // 클릭하면 그부분으로 스틱 옮기기
  function handleClick(event: any) {
    userEvent.isClick = true;
    userEvent.startX = canvasX(myCanvas, event.clientX);
    userEvent.startY = canvasY(myCanvas, event.clientY);
    const targetIndex =
      (userEvent.startX * 60 * selectedTimeScope) /
      canvasContainer.current.clientWidth;
    // 유저가 클릭한 위치 구하기
    const userClickTime = startWidthTime + 1000 * targetIndex;

    const { startX, startY, isClick, isDrag } = userEvent;

    if (startY >= myCanvasSize.longHeight && startY <= myCanvasSize.underLine) {
      userEvent.isDrag = false;
      userStickTargetTime = userClickTime;
      reTouch("click");
    }
  }

  // 스틱 마우스 오버했을 때 색 바꾸기 및 눈금자 포인터
  useEffect(() => {
    // 스틱 잡고 움직이기
    const mouseGrabMove = (event: any) => {
      if (!userEvent.isDrag) return;
      userEvent.startX = canvasX(myCanvas, event.clientX);
      userEvent.startY = canvasY(myCanvas, event.clientY);
      const targetIndex =
        (userEvent.startX * 60 * selectedTimeScope) /
        canvasContainer.current.clientWidth;
      const userClickTime = startWidthTime + 1000 * targetIndex;

      const { startX, startY, isClick, isDrag } = userEvent;
      userStickTargetTime = userClickTime;
      reTouch("click");
    };

    // 스틱 잡기
    const mouseDown = (event: any) => {
      const startX = canvasX(myCanvas, event.clientX);
      const startY = canvasY(myCanvas, event.clientY);

      if (
        startY >= myCanvasSize.longHeight &&
        startY < myCanvasSize.underLine + 2
      ) {
        let newIsStickMouseOver: number;
        // 스틱 부분
        const index = solutionTimeIndex(userStickTargetTime, startWidthTime);
        const targetX = solutionLocation(
          index,
          selectedTimeScope,
          canvasContainer
        );

        if (Math.abs(targetX - startX) <= 15) {
          newIsStickMouseOver = targetX;
          userEvent.isDrag = true;
        }
      }
    };

    // 스틱 움직이는 것 종료
    const mouseup = () => {
      userEvent.isDrag = false;
    };

    // 스틱 파란색
    const mouseOver = (event: any) => {
      const startX = canvasX(myCanvas, event.clientX);
      const startY = canvasY(myCanvas, event.clientY);

      if (
        startY >= myCanvasSize.longHeight &&
        startY < myCanvasSize.underLine + 2
      ) {
        if (myCanvas.current) {
          myCanvas.current.style.cursor = "pointer";
        }
        let newIsStickMouseOver: number;
        // 스틱 부분
        const index = solutionTimeIndex(userStickTargetTime, startWidthTime);
        const targetX = solutionLocation(
          index,
          selectedTimeScope,
          canvasContainer
        );

        if (Math.abs(targetX - startX) <= 15) {
          newIsStickMouseOver = targetX;
        } else {
          newIsStickMouseOver = -1;
        }

        if (isStickMouseOver !== newIsStickMouseOver) {
          isStickMouseOver = newIsStickMouseOver;
          reTouch("click");
        }
      } else {
        if (isStickMouseOver !== -1) {
          isStickMouseOver = -1;
          reTouch("click");
        }
        if (myCanvas.current) {
          myCanvas.current.style.cursor = "auto";
        }
      }
    };

    window.addEventListener("mousemove", mouseOver);
    window.addEventListener("mousemove", mouseGrabMove);
    window.addEventListener("mouseup", mouseup);
    window.addEventListener("mousedown", mouseDown);
    return () => {
      window.removeEventListener("mousemove", mouseOver);
      window.removeEventListener("mousemove", mouseGrabMove);
      window.removeEventListener("mouseup", mouseup);
      window.removeEventListener("mousedown", mouseDown);
    };
  }, [selectedTimeScope]);

  const mouseWheel = (event: any) => {
    const data = event.deltaY;
    const date = mousewheelData ? new Date(mousewheelData) : new Date();
    const currentStartTime =
      parseInt(
        (
          (date.getTime() + data * dragValue[`${selectedTimeScope}`]) /
          1000
        ).toString()
      ) * 1000;

    mousewheelData = currentStartTime;
    reTouch("click");
  };

  return (
    <div className={styles.total_contaner}>
      <div className={styles.container}>
        <div className={styles.video}></div>
        <h1 className='text-start'>{useTime}</h1>
      </div>

      <div ref={canvasContainer} className={styles.test_container}>
        <canvas
          onClick={handleClick}
          ref={myCanvas}
          className={styles.canvas}
          height={myCanvasSize.underLine + 2}
          onWheel={mouseWheel}
        ></canvas>
      </div>
      <div className={styles.btn_container}>
        <button
          onClick={() => setSelectedTimeScope(10)}
          disabled={selectedTimeScope === 10}
        >
          10분
        </button>
        <button
          onClick={() => setSelectedTimeScope(60)}
          disabled={selectedTimeScope === 60}
        >
          1시간
        </button>
        <button
          onClick={() => setSelectedTimeScope(360)}
          disabled={selectedTimeScope === 360}
        >
          6시간
        </button>
        <button
          onClick={() => setSelectedTimeScope(60 * 24)}
          disabled={selectedTimeScope === 60 * 24}
        >
          24시간
        </button>
      </div>
    </div>
  );
};

export default RecordBar;
