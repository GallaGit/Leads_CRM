"use client";

import type { IntegrationConnectionState } from "@/lib/settings/types";
import { cn } from "@/lib/utils";

const LABELS: Record<IntegrationConnectionState["status"], string> = {
  never: "Nunca",
  syncing: "Comprobando…",
  ok: "OK",
  error: "Error",
};

export function ConnectionBadge({
  connection,
  pending,
}: {
  connection: IntegrationConnectionState;
  pending?: boolean;
}) {
  const status = pending ? "syncing" : connection.status;
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px]">
      <span
        className={cn(
          "rounded px-1.5 py-0.5 font-medium",
          status === "ok" && "bg-emerald-500/15 text-emerald-400",
          status === "error" && "bg-red-500/15 text-red-400",
          status === "syncing" && "bg-amber-500/15 text-amber-400",
          status === "never" && "bg-(--muted) text-(--muted-fg)",
        )}
      >
        {LABELS[status]}
      </span>
      {connection.lastSyncedAt ? (
        <span className="text-(--muted-fg)">
          Última sync:{" "}
          {new Date(connection.lastSyncedAt).toLocaleString("es-ES", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
      ) : null}
      {status === "error" && connection.lastError ? (
        <span className="text-red-400">{connection.lastError}</span>
      ) : null}
    </div>
  );
}
