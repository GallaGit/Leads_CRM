"use client";

import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reduced;
}

export function useMotionValue<T>(normal: T, reduced: T = {} as T): T {
  const isReduced = useReducedMotion();
  return isReduced ? reduced : normal;
}

export function getMotionProps<T extends Record<string, unknown>>(
  normal: T,
  reduced: Partial<T> = {}
): T {
  if (typeof window === "undefined") return normal;
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  return prefersReduced ? { ...normal, ...reduced } : normal;
}