import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-grafito dark:text-gris-100"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            "flex h-9 w-full rounded-md border bg-blanco px-3 text-sm text-grafito placeholder:text-gris-400 transition-all duration-150",
            "border-gris-300 dark:border-gris-600 dark:bg-gris-800 dark:text-gris-100 dark:placeholder:text-gris-500",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rojo focus-visible:ring-offset-2 focus-visible:ring-offset-blanco dark:focus-visible:ring-offset-gris-900",
            "hover:border-gris-400 dark:hover:border-gris-500",
            error && "border-error focus-visible:ring-error",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gris-100 dark:disabled:bg-gris-800",
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-gris-500 dark:text-gris-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-grafito dark:text-gris-100"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border bg-blanco px-3 py-2 text-sm text-grafito placeholder:text-gris-400 transition-all duration-150 resize-y",
            "border-gris-300 dark:border-gris-600 dark:bg-gris-800 dark:text-gris-100 dark:placeholder:text-gris-500",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rojo focus-visible:ring-offset-2 focus-visible:ring-offset-blanco dark:focus-visible:ring-offset-gris-900",
            "hover:border-gris-400 dark:hover:border-gris-500",
            error && "border-error focus-visible:ring-error",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gris-100 dark:disabled:bg-gris-800",
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-gris-500 dark:text-gris-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";