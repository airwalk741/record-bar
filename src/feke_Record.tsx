import { currentTime, currentTimeSecond } from "./operator";
import React, { useEffect, useRef, useState } from "react";
import useInterval from "src/hooks/useInterval";

const RecordBar = (props) => {
  // const arr = new Array(1000).fill(undefined);

  const [arr, setArr] = useState([]);
  const [currentPoint, setCurrentPoint] = useState<number>(0);

  const svgRef = useRef(null);

  // 점선
  const resizeArr = () => {
    if (svgRef.current) {
      const newContainer = new Array(
        Math.ceil(svgRef.current.width.animVal.value)
      ).fill(undefined);
      console.log(timeFlag);

      const length = Math.ceil(newContainer.length * 0.8);
      let date = new Date().getTime() + timeFlag * 200;
      date += timeFlag * 200;

      date -= date % 1000;

      const newData = newContainer.map((item: any, index: number) => {
        return date - (length - index) * 1000;
      });

      setArr(newData);
      if (!currentPoint) {
        setCurrentPoint(date);
      }
    }
  };

  // 시간 지나간다~
  useInterval(resizeArr, 1000, setCurrentPoint);

  useEffect(() => {
    window.addEventListener("resize", resizeArr);
    window.addEventListener("mouseup", handleMouseUpMarker);
    resizeArr();

    return () => {
      window.removeEventListener("resize", resizeArr);
      window.removeEventListener("mouseup", resizeArr);
    };
  }, []);

  const [isClickMarker, setIsClickMarker] = useState(false);

  // 깃발 잡고 움직일때 클릭
  const handleClickMarker = (e) => {
    setIsClickMarker(true);
  };

  // 깃발 움직이는거 끝날 때
  const handleMouseUpMarker = (e) => {
    setIsClickMarker(false);
  };

  // 깃발 움직일 때
  const handleMove = (e) => {
    if (isClickMarker) {
      const index = arr.indexOf(currentPoint);

      setCurrentPoint(currentPoint - (index - e.nativeEvent.layerX) * 1000);
    }
  };

  const [timeFlag, setTimeFlag] = useState(0);

  const goLive = () => {
    // const length = Math.ceil(arr.length * 0.8);
    let date = new Date().getTime();
    date -= date % 1000;

    setCurrentPoint(date);
  };

  const handleWheel = (e) => {
    setTimeFlag((pre) => pre + e.deltaY);
  };

  // 마우스 휠 했을 때 시간
  useEffect(() => {
    resizeArr();
  }, [timeFlag]);

  const handleClickContainer = (e) => {
    const index = arr.indexOf(currentPoint);

    setCurrentPoint(currentPoint - (index - e.nativeEvent.layerX) * 1000);
  };

  return (
    <>
      <div className='container'>
        <h1>
          {currentTimeSecond(currentPoint)} {currentPoint}
        </h1>
        <button onClick={goLive} style={{ marginBottom: "40px" }}>
          Go Live
        </button>
        <div className='timebar_area'>
          <svg
            ref={svgRef}
            width='90vw'
            height='100'
            onMouseUp={handleMouseUpMarker}
            onMouseMove={handleMove}
            onClick={handleClickContainer}
            onWheel={handleWheel}>
            <g fill='none'>
              <g>
                <path stroke='black' strokeWidth='2' d='M0 40 l100000 0' />
              </g>
              {arr.map((item: any, index: number) => {
                const data = item - (item % 1000);
                if (data % (60 * 1000) === 0 && data % (10 * 1000) === 0) {
                  return (
                    <g key={index}>
                      <path stroke='black' d={`M${index} 0 l0 40`} />
                      <text x={index - 15} y='70' fill='red'>
                        {currentTime(item)}
                      </text>
                    </g>
                  );
                } else if (data % (10 * 1000) === 0) {
                  return (
                    <g key={index}>
                      <path stroke='black' d={`M${index} 20 l0 20`} />
                    </g>
                  );
                } else {
                  return <g key={index}></g>;
                }
              })}
            </g>
            {arr.indexOf(currentPoint) !== -1 && (
              <g onMouseDown={handleClickMarker} transform='translate(-7, 0)'>
                <image
                  className='image'
                  // x={currentPoint}
                  x={arr.indexOf(currentPoint)}
                  y={0}
                  href='https://cam.toast.com/resources/img/ic-detail-indicator.png'
                />
              </g>
            )}
          </svg>
        </div>
      </div>
    </>
  );
};

export default RecordBar;
