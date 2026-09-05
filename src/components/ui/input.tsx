import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-8 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
