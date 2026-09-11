import type { Transition, Variants, Easing } from "framer-motion";

const standardEasing: Easing = [0.4, 0, 0.2, 1];

const baseTransition = { ease: standardEasing };

export const motionPresets = {
  fadeInUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { ...baseTransition, duration: 0.15 },
  },

  staggerContainer: {
    animate: { transition: { staggerChildren: 0.05 } },
  },

  staggerItem: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { ...baseTransition, duration: 0.15 },
  },

  hoverLift: {
    whileHover: { y: -2, boxShadow: "var(--shadow-lg)" },
    transition: { ...baseTransition, duration: 0.15 },
  },

  tapScale: {
    whileTap: { scale: 0.98 },
    transition: { duration: 0.05 },
  },

  dragActive: {
    whileDrag: { boxShadow: "var(--shadow-xl)", zIndex: 100 },
    transition: { duration: 0.1 },
  },

  pageTransition: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { ...baseTransition, duration: 0.2 },
  },

  cardEnter: {
    initial: { opacity: 0, y: 16, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { ...baseTransition, duration: 0.2 },
  },

  modalEnter: {
    initial: { opacity: 0, scale: 0.95, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -8 },
    transition: { ...baseTransition, duration: 0.2 },
  },

  drawerEnter: {
    initial: { opacity: 0, x: "100%" },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: "100%" },
    transition: { ...baseTransition, duration: 0.2 },
  },

  shimmer: {
    animate: {
      backgroundPosition: ["-200% 0", "200% 0"],
    },
    transition: {
      duration: 1.5,
      ease: "linear",
      repeat: Infinity,
    },
  },

  countUp: (duration: number = 1) => ({
    animate: { opacity: 1 },
    transition: { duration, ease: "easeOutExpo" },
  }),
} as const;

export const transitions = {
  fast: { duration: 0.1, ease: standardEasing },
  base: { duration: 0.15, ease: standardEasing },
  slow: { duration: 0.2, ease: standardEasing },
  macro: { duration: 0.3, ease: standardEasing },
  spring: { type: "spring", stiffness: 400, damping: 25 },
  springSoft: { type: "spring", stiffness: 300, damping: 30 },
} as const satisfies Record<string, Transition>;

export const easings = {
  standard: standardEasing,
  accelerate: [0.4, 0, 1, 1] as const satisfies Easing,
  decelerate: [0, 0, 0.2, 1] as const satisfies Easing,
  sharp: [0.4, 0, 0.6, 1] as const satisfies Easing,
} as const;

export function getReducedMotionTransition<T extends Transition>(
  normal: T,
  reduced?: T
): T {
  if (typeof window !== "undefined") {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    return prefersReduced && reduced ? reduced : normal;
  }
  return normal;
}