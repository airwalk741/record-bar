import React, { useEffect, useRef, useState } from "react";

const useInterval = (callback: any, delay: any, setCurrentPoint: any) => {
  const savedCallback = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    const tick = () => {
      savedCallback.current();
      setCurrentPoint((pre) => pre + 1000);
    };

    const timerId = setInterval(tick, delay);
    return () => clearInterval(timerId);
  }, [delay]);
};

export default useInterval;
