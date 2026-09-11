"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motionPresets } from "@/lib/motion/presets";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function DialogContent({
  className,
  children,
  size = "md",
  ...props
}: DialogContentProps) {
  const reduced = useReducedMotion();
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  return (
    <DialogPrimitive.Portal>
      <motion.div
        className="fixed inset-0 z-50"
        initial={reduced ? undefined : { opacity: 0 }}
        animate={reduced ? undefined : { opacity: 1 }}
        exit={reduced ? undefined : { opacity: 0 }}
        transition={reduced ? { duration: 0 } : motionPresets.fadeInUp.transition}
      >
        <DialogPrimitive.Overlay className="bg-grafito/50 dark:bg-black/50" />
      </motion.div>

      <DialogPrimitive.Portal>
        <motion.div
          className="fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 px-4"
          initial={reduced ? undefined : { opacity: 0, scale: 0.95, y: 8 }}
          animate={reduced ? undefined : { opacity: 1, scale: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, scale: 0.95, y: -8 }}
          transition={reduced ? { duration: 0 } : motionPresets.modalEnter.transition}
        >
          <DialogPrimitive.Content
            className={cn(
              "w-full rounded-xl border border-gris-200 dark:border-gris-700 bg-blanco dark:bg-grafito p-6 shadow-xl",
              sizeClasses[size],
              className,
            )}
            {...props}
          >
            {children}
            <DialogPrimitive.Close
              className="absolute right-4 top-4 rounded-lg p-1.5 text-gris-500 dark:text-gris-400 hover:bg-gris-100 dark:hover:bg-gris-800 hover:text-grafito dark:hover:text-gris-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rojo focus-visible:ring-offset-2"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </motion.div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold text-grafito dark:text-gris-100", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("mt-1 text-sm text-gris-500 dark:text-gris-400", className)}
      {...props}
    />
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3",
        className,
      )}
      {...props}
    />
  );
}