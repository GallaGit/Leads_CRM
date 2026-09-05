"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/topbar";

export default function SettingsPage() {
  const [status, setStatus] = useState<{
    authDisabled: boolean;
    notionConfigured: boolean;
    serpapiConfigured: boolean;
    groqConfigured: boolean;
    n8n: { action: string; configured: boolean }[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/settings/status")
      .then((r) => r.json())
      .then(setStatus);
  }, []);

  return (
    <>
      <Topbar title="Settings" />
      <div className="max-w-xl space-y-4 p-6">
        <p className="text-sm text-[var(--muted-fg)]">
          Secretos solo en variables de entorno del servidor. Copia{" "}
          <code>.env.example</code> a <code>.env.local</code>.
        </p>
        {!status ? (
          <p className="text-[var(--muted-fg)]">Cargando…</p>
        ) : (
          <ul className="space-y-2 text-sm">
            <Row
              label="Auth desactivado (local)"
              ok={status.authDisabled}
            />
            <Row label="Notion" ok={status.notionConfigured} />
            <Row label="SerpAPI" ok={status.serpapiConfigured} />
            <Row label="Groq (IA)" ok={status.groqConfigured} />
            {status.n8n.map((a) => (
              <Row
                key={a.action}
                label={`n8n · ${a.action}`}
                ok={a.configured}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function Row({ label, ok }: { label: string; ok: boolean }) {
  return (
    <li className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2">
      <span>{label}</span>
      <span className={ok ? "text-emerald-400" : "text-amber-400"}>
        {ok ? "OK" : "Pendiente"}
      </span>
    </li>
  );
}
