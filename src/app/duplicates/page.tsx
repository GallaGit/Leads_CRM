"use client";

import { Suspense } from "react";
import { DuplicatesPage } from "@/components/duplicates/duplicates-page";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-(--muted-fg)">Cargando…</div>
      }
    >
      <DuplicatesPage />
    </Suspense>
  );
}