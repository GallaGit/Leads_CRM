"use client";

import { Suspense } from "react";
import { DailyWorkPage } from "@/components/inbox/daily-work-page";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-[var(--muted-fg)]">Cargando…</div>
      }
    >
      <DailyWorkPage />
    </Suspense>
  );
}
