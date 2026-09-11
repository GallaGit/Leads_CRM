"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motionPresets } from "@/lib/motion/presets";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: "rojo" | "grafito" | "exito" | "info" | "advertencia";
  showValue?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  color = "rojo",
  showValue = true,
  className,
  ariaLabel,
}: ProgressRingProps) {
  const reduced = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference * (1 - progress);

  const colorClasses = {
    rojo: "text-rojo",
    grafito: "text-grafito",
    exito: "text-exito",
    info: "text-info",
    advertencia: "text-advertencia",
  };

  const bgColorClasses = {
    rojo: "text-rojo/20",
    grafito: "text-gris-200 dark:text-gris-700",
    exito: "text-exito/20",
    info: "text-info/20",
    advertencia: "text-advertencia/20",
  };

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      role="img"
      aria-label={ariaLabel || `Progreso: ${Math.round(progress * 100)}%`}
    >
      <svg width={size} height={size} className="transform -rotate-90" aria-hidden="true">
        <motion.circle
          className={cn(bgColorClasses[color])}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          initial={reduced ? false : { pathLength: 0 }}
          animate={reduced ? false : { pathLength: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        />
        <motion.circle
          className={cn(colorClasses[color], "transition-colors duration-300")}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={reduced ? false : { strokeDashoffset: circumference }}
          animate={reduced ? false : { strokeDashoffset: offset }}
          transition={reduced ? { duration: 0 } : { duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
        />
      </svg>

      {showValue && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={reduced ? false : { opacity: 0, scale: 0.5 }}
          animate={reduced ? false : { opacity: 1, scale: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.3, ease: [0.4, 0, 0.2, 1], delay: 0.5 }}
        >
          <span className="text-sm font-bold tabular-nums text-grafito dark:text-gris-100">
            {Math.round(progress * 100)}%
          </span>
        </motion.div>
      )}
    </div>
  );
}

interface ProgressRingWithLabelProps extends ProgressRingProps {
  label: string;
  sublabel?: string;
}

export function ProgressRingWithLabel({
  label,
  sublabel,
  className,
  ...props
}: ProgressRingWithLabelProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 text-center", className)}>
      <ProgressRing {...props} />
      <div>
        <p className="text-sm font-medium text-grafito dark:text-gris-100">{label}</p>
        {sublabel && <p className="text-xs text-gris-500 dark:text-gris-400">{sublabel}</p>}
      </div>
    </div>
  );
}

interface MultiProgressRingProps {
  rings: Array<ProgressRingProps & { label: string; key: string }>;
  gap?: number;
  className?: string;
}

export function MultiProgressRing({
  rings,
  gap = 16,
  className,
}: MultiProgressRingProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-center gap-4", className)}
      style={{ gap }}
      role="group"
      aria-label="Indicadores de progreso"
    >
      {rings.map(({ key, label, ...rest }) => (
        <ProgressRingWithLabel key={key} label={label} {...rest} />
      ))}
    </div>
  );
}