"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/topbar";

export default function AutomationsPage() {
  const [actions, setActions] = useState<
    { action: string; configured: boolean }[]
  >([]);

  useEffect(() => {
    fetch("/api/settings/status")
      .then((r) => r.json())
      .then((d) => setActions(d.n8n ?? []));
  }, []);

  return (
    <>
      <Topbar title="Automations" />
      <div className="space-y-3 p-6">
        <p className="text-sm text-[var(--muted-fg)]">
          Capa lista para webhooks n8n. No se han añadido triggers al workflow
          todavía — configura URLs en{" "}
          <code className="text-[var(--fg)]">.env</code>.
        </p>
        {actions.map((a) => (
          <div
            key={a.action}
            className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-3"
          >
            <span className="text-sm">{a.action}</span>
            <span
              className={`text-[11px] ${a.configured ? "text-emerald-400" : "text-[var(--muted-fg)]"}`}
            >
              {a.configured ? "Configurado" : "Sin webhook"}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
