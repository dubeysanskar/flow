"use client";

import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  target: number;
  duration?: number;
  delay?: number;
}

export function useCountUp({ target, duration = 1400, delay = 0 }: UseCountUpOptions) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        setCount(Math.round(easeOut(progress) * target));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return count;
}
