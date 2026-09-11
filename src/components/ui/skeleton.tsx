"use client";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card";
  lines?: number;
}

export function Skeleton({
  className,
  variant = "text",
  lines = 1,
  ...props
}: SkeletonProps) {
  const reduced = useReducedMotion();
  const baseStyles = "bg-gris-200 dark:bg-gris-700 rounded";
  const shimmerClass = reduced ? "" : "shimmer";

  if (variant === "circular") {
    return <div className={cn(baseStyles, "rounded-full", shimmerClass, className)} {...props} />;
  }

  if (variant === "rectangular") {
    return <div className={cn(baseStyles, shimmerClass, className)} {...props} />;
  }

  if (variant === "card") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className={cn("h-6 w-3/4 bg-gris-200 dark:bg-gris-700 rounded", shimmerClass)} />
        {Array.from({ length: lines - 1 }).map((_, i) => (
          <div
            key={i}
            className={cn("h-4 bg-gris-200 dark:bg-gris-700 rounded", shimmerClass)}
            style={{ width: i === lines - 2 ? "60%" : "100%" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(baseStyles, shimmerClass, i === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  const reduced = useReducedMotion();
  const shimmerClass = reduced ? "" : "shimmer";

  return (
    <div className="space-y-3">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className={cn("h-8 bg-gris-200 dark:bg-gris-700 rounded", shimmerClass)} style={{ animationDelay: `${i * 0.05}s` }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, col) => (
            <div key={col} className={cn("h-10 bg-gris-200 dark:bg-gris-700 rounded", shimmerClass)} style={{ animationDelay: `${(row * columns + col) * 0.02}s` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function KanbanSkeleton({ columns = 9, cardsPerColumn = 3 }: { columns?: number; cardsPerColumn?: number }) {
  const reduced = useReducedMotion();
  const shimmerClass = reduced ? "" : "shimmer";

  return (
    <div className="flex gap-3 overflow-x-auto p-2 pb-4">
      {Array.from({ length: columns }).map((_, col) => (
        <div key={col} className="w-56 shrink-0 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className={cn("h-5 w-20 bg-gris-200 dark:bg-gris-700 rounded", shimmerClass)} />
            <div className={cn("h-5 w-8 bg-gris-200 dark:bg-gris-700 rounded-full", shimmerClass)} style={{ animationDelay: "0.1s" }} />
          </div>
          {Array.from({ length: cardsPerColumn }).map((_, card) => (
            <div
              key={card}
              className={cn("h-20 bg-gris-100 dark:bg-gris-800 rounded-lg border border-gris-200 dark:border-gris-700", shimmerClass)}
              style={{ animationDelay: `${(col * cardsPerColumn + card) * 0.05}s` }}
            />
          ))}
          <div className={cn("h-10 bg-gris-100 dark:bg-gris-800 rounded-lg border border-dashed border-gris-300 dark:border-gris-600", shimmerClass)} />
        </div>
      ))}
    </div>
  );
}