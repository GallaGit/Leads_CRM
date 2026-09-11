"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motionPresets } from "@/lib/motion/presets";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useCountUp } from "@/hooks/useCountUp";

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  sparklineData?: number[];
  color?: "rojo" | "grafito" | "exito" | "info" | "advertencia";
  href?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  icon,
  trend,
  sparklineData,
  color = "rojo",
  href,
  className,
}: KPICardProps) {
  const reduced = useReducedMotion();
  const countUp = useCountUp(value, { duration: 1.5, delay: 0.3 });
  const colorClasses = {
    rojo: "text-rojo bg-rojo/10 dark:bg-rojo/20",
    grafito: "text-grafito bg-gris-100 dark:bg-gris-800",
    exito: "text-exito bg-exito/10 dark:bg-exito/20",
    info: "text-info bg-info/10 dark:bg-info/20",
    advertencia: "text-advertencia bg-advertencia/10 dark:bg-advertencia/20",
  };

  const sparklineColors = {
    rojo: "stroke-rojo",
    grafito: "stroke-gris-400 dark:stroke-gris-500",
    exito: "stroke-exito",
    info: "stroke-info",
    advertencia: "stroke-advertencia",
  };

  const Component = href ? "a" : "div";

  return (
    <motion.div
      className={cn(
        "relative group rounded-xl border border-gris-200 dark:border-gris-700 bg-blanco dark:bg-grafito p-5",
        "hover:shadow-lg hover:border-gris-300 dark:hover:border-gris-600",
        "transition-all duration-150",
        className,
      )}
      initial={reduced ? undefined : { opacity: 0, y: 16 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      whileHover={reduced ? undefined : { y: -2, boxShadow: "var(--shadow-xl)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gris-500 dark:text-gris-400 truncate">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <motion.span
              className="text-3xl font-bold tabular-nums text-grafito dark:text-gris-100"
              key={Math.floor(countUp)}
            >
              {Math.floor(countUp).toLocaleString()}
            </motion.span>
            {trend && (
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                trend.value >= 0 ? "text-exito bg-exito/10 dark:bg-exito/20" : "text-error bg-error/10 dark:bg-error/20"
              )}>
                {trend.value >= 0 ? "+" : ""}{trend.value.toFixed(1)}%
              </span>
            )}
          </div>
          {trend && <p className="mt-0.5 text-xs text-gris-500 dark:text-gris-400">{trend.label}</p>}
        </div>

        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            colorClasses[color],
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      {sparklineData && sparklineData.length > 1 && (
        <motion.div
          className="mt-4 h-16 w-full"
          initial={reduced ? false : { opacity: 0, height: 0 }}
          animate={reduced ? false : { opacity: 1, height: "auto" }}
          transition={reduced ? { duration: 0 } : { duration: 0.3, delay: 0.5 }}
        >
          <svg viewBox="0 0 200 50" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
            <defs>
              <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color === "rojo" ? "#C62828" : color === "exito" ? "#16A34A" : color === "info" ? "#2563EB" : "#1F2328"} stopOpacity="0.3" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d={getSparklinePath(sparklineData)}
              stroke={color === "rojo" ? "#C62828" : color === "exito" ? "#16A34A" : color === "info" ? "#2563EB" : "#1F2328"}
              strokeWidth="2"
              fill="url(#sparkline-gradient)"
              className="transition-opacity duration-300 group-hover:opacity-100"
            />
          </svg>
        </motion.div>
      )}

      {href && (
        <motion.span
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          initial={reduced ? false : { opacity: 0, x: -4 }}
          animate={reduced ? false : { opacity: 0, x: 0 }}
        >
          →
        </motion.span>
      )}
    </motion.div>
  );
}

function getSparklinePath(data: number[]): string {
  if (data.length < 2) return "";
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 200;
  const height = 50;
  const padding = 4;

  return data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

interface KPICardGridProps {
  cards: KPICardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function KPICardGrid({ cards, columns = 4, className }: KPICardGridProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "grid gap-4",
        columns === 2 ? "grid-cols-1 sm:grid-cols-2" :
        columns === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? false : { opacity: 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.3, staggerChildren: 0.08 }}
    >
      {cards.map((card, i) => (
        <motion.div key={card.title} custom={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <KPICard {...card} />
        </motion.div>
      ))}
    </motion.div>
  );
}