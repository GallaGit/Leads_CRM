import { Suspense } from "react";
import { LeadsPageClient } from "@/components/leads/leads-page-client";

export default function LeadsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-[var(--muted-fg)]">
          Cargando leads…
        </div>
      }
    >
      <LeadsPageClient />
    </Suspense>
  );
}
