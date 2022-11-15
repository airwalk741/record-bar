import React from "react";
import { useEffect, useState } from "react";

const useMount = (state: any) => {
  const [isMount, setIsMount] = useState(false);

  useEffect(() => {
    setIsMount(true);

    return () => {
      setIsMount(false);
    };
  }, [state]);

  return isMount;
};

export default useMount;
