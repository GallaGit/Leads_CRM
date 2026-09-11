"use client";

import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
  easing?: (t: number) => number;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function useCountUp(
  end: number,
  options: UseCountUpOptions = {}
): number {
  const { duration = 1500, delay = 0, easing = easeOutExpo } = options;
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      const id = requestAnimationFrame(() => setCount(end));
      return () => cancelAnimationFrame(id);
    }

    let started = false;

    const animate = (timestamp: number) => {
      if (!started) {
        startTimeRef.current = timestamp + delay;
        started = true;
      }

      const startTime = startTimeRef.current!;
      const elapsed = timestamp - startTime;

      if (elapsed < 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const current = Math.round(end * easedProgress);

      setCount(current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [end, duration, delay, easing]);

  return count;
}
