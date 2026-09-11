"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot() {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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
