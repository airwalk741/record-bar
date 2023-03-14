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

interface CanvasSize {
  underLine: number; // 레코드바의 아랫줄 => 높이라고 보면 됨
  longHeight: number; // 레코드 바의 긴 선 높이
  shortHeight: number; // 레코드 바의 작은 선 높이
  textHeight: number; // 레코드 바의 text 높이
}

interface UserEvent {
  startX: number;
  startY: number;
  isClick: boolean;
  isDrag: boolean;
}

const myCanvasSize: CanvasSize = {
  underLine: 80,
  longHeight: 35,
  shortHeight: 55,
  textHeight: 20,
};

const userEvent: UserEvent = {
  startX: 0,
  startY: 0,
  isClick: false,
  isDrag: false,
};

let startWidthTime: number;
let longLine = 1000 * 60;
let flagStick: number;
let userStickTargetTime: number;
let isUserEvent = false;
let setIntervalID: any = null;
let isStickMouseOver = -1;

const RecordBar = ({}) => {
  const myCanvas = useRef() as MutableRefObject<HTMLCanvasElement>;
  const canvasContainer = useRef() as MutableRefObject<HTMLDivElement>;
  const [selectedTimeScope, setSelectedTimeScope] = useState<number>(10);
  const [useTime, setUseTime] = useState<string>(
    currentDate(new Date().getTime())
  );

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
    if (selectedTimeScope === 10) {
      longLine = 1000 * 60;
    } else if (selectedTimeScope === 60) {
      longLine = 1000 * 60 * 10;
    } else if (selectedTimeScope === 360) {
      longLine = 1000 * 60 * 60;
    } else if (selectedTimeScope === 360) {
      longLine = 1000 * 60 * 60 * 24;
    }

    if (setIntervalID) {
      clearInterval(setIntervalID);
    }
    reTouch("");
    setIntervalID = setInterval(() => {
      reTouch("");
    }, 1000);
  }, [selectedTimeScope]);

  function reTouch(event: string) {
    // underline 그리기
    const ctx: any = myCanvas.current.getContext("2d");
    ctx.canvas.width = canvasContainer.current.clientWidth;
    ctx.fillStyle = "rgb(160, 160, 160)";
    // 밑에 긴 선 그리기
    drawUnderline(ctx, myCanvas, myCanvasSize);
    // 현재 시간
    const currentStartTime =
      parseInt((new Date().getTime() / 1000).toString()) * 1000;
    console.log(selectedTimeScope);
    // 현재 시간과 사용자가 이벤트한 시간의 차이
    const differTime = parseInt(
      (
        (selectedTimeScope * 1000 -
          (currentStartTime % (selectedTimeScope * 1000))) /
        1000
      ).toString()
    );

    // div의 80% 지점을 기준으로 깃발 꽂기
    const flagIndex = solutionLocationIndex(
      canvasContainer.current.clientWidth * 0.8,
      selectedTimeScope,
      canvasContainer
    );

    flagStick = selectedTimeScope * 0.8;
    startWidthTime = currentStartTime - 1000 * flagIndex;

    for (
      let i = differTime;
      i <= 60 * selectedTimeScope;
      i += selectedTimeScope
    ) {
      const inputDate = solutionTime(i, startWidthTime); // i 가지고 시간 구하기
      const location = solutionLocation(i, selectedTimeScope, canvasContainer); // 그릴 위치 구하기

      if (inputDate % longLine === 0) {
        // 긴선 그리기
        drawLongline(ctx, location, inputDate, myCanvasSize);
        if (
          // 다음날짜 box 처리하기 및 날짜 입력
          Math.floor((inputDate / (60 * 60 * 1000) + 9) % 24) === 0 &&
          Math.floor((inputDate / (60 * 1000)) % 60) === 0
        ) {
          drawNextDateBox(ctx, location, inputDate, myCanvasSize);
        }
        ctx.fillStyle = "rgb(160, 160, 160)";
      } else if (
        inputDate % (selectedTimeScope * 1000) === 0 &&
        inputDate % longLine !== 0
      ) {
        // 짧은 선 그리기
        drawShortline(ctx, location, myCanvasSize);
      }
    }

    // 스틱부분
    if (!userEvent.isClick) {
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

  useEffect(() => {
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
        if (myCanvas.current) {
          myCanvas.current.style.cursor = "auto";
        }
      }
    };

    window.addEventListener("mousemove", mouseOver);
    return () => {
      window.removeEventListener("mousemove", mouseOver);
    };
  }, [selectedTimeScope]);

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
          onClick={() => setSelectedTimeScope(1440)}
          disabled={selectedTimeScope === 1440}
        >
          24시간
        </button>
      </div>
    </div>
  );
};

export default RecordBar;
