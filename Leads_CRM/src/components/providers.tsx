"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>
        <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
        <Toaster theme="system" position="bottom-right" richColors />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
