"use client";

import { Toaster as SonnerToaster, toast, type ToasterProps } from "sonner";
import { cn } from "@/lib/utils";

export interface ToastOptions {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

export const useToast = () => {
  const showToast = ({ title, description, action, duration }: ToastOptions) => {
    return toast(title, {
      description,
      action: action ? { label: action.label, onClick: action.onClick } : undefined,
      duration,
    });
  };

  const showSuccess = (title: string, description?: string) => {
    return toast.success(title, { description });
  };

  const showError = (title: string, description?: string) => {
    return toast.error(title, { description });
  };

  const showInfo = (title: string, description?: string) => {
    return toast.info(title, { description });
  };

  const showWarning = (title: string, description?: string) => {
    return toast.warning(title, { description });
  };

  const showLoading = (title: string, description?: string) => {
    return toast.loading(title, { description });
  };

  const dismiss = (id?: string | number) => {
    toast.dismiss(id);
  };

  const promise = <T,>(promise: Promise<T>, messages: { loading: string; success: string; error: string }) => {
    return toast.promise(promise, messages);
  };

  return { toast: showToast, success: showSuccess, error: showError, info: showInfo, warning: showWarning, loading: showLoading, dismiss, promise };
};

export function Toaster(props?: Omit<ToasterProps, "theme">) {
  return (
    <SonnerToaster
      theme="system"
      className={cn("toaster")}
      toastOptions={{
        classNames: {
          toast: "group rounded-xl border border-gris-200 dark:border-gris-700 bg-blanco dark:bg-grafito shadow-xl px-4 py-3 gap-3",
          title: "text-sm font-medium text-grafito dark:text-gris-100",
          description: "text-sm text-gris-500 dark:text-gris-400",
          actionButton: "rounded-lg px-3 py-1 text-xs font-medium bg-rojo text-blanco hover:bg-rojo-hover transition-colors",
          closeButton: "text-gris-400 hover:text-gris-600 dark:hover:text-gris-300",
          icon: "text-rojo",
        },
      }}
      {...props}
    />
  );
}

export { toast };