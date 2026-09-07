"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SecretField } from "@/components/settings/fields";
import type { PublicAutomation, PublicSettings } from "@/lib/settings/types";

async function fetchAutomations(): Promise<PublicAutomation[]> {
  const res = await fetch("/api/automations");
  const data = (await res.json()) as {
    automations?: PublicAutomation[];
    error?: string;
  };
  if (!res.ok) throw new Error(data.error || "No se pudieron cargar");
  return data.automations ?? [];
}

export function AutomationsPanel() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["automations"],
    queryFn: fetchAutomations,
  });
  const [webhookDraft, setWebhookDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function patch(
    action: string,
    body: { enabled?: boolean; webhookUrl?: string },
  ) {
    setBusy(action);
    try {
      const res = await fetch(`/api/automations/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        settings?: PublicSettings;
        automation?: PublicAutomation;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      if (data.settings) {
        queryClient.setQueryData(["automations"], data.settings.automations);
        queryClient.setQueryData(["settings"], data.settings);
      } else if (data.automation) {
        queryClient.setQueryData(["automations"], (cur: PublicAutomation[] | undefined) =>
          (cur ?? []).map((a) => (a.action === action ? data.automation! : a)),
        );
      }
      setWebhookDraft((d) => ({ ...d, [action]: "" }));
      toast.success("Automatización actualizada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setBusy(null);
    }
  }

  async function test(action: string) {
    setBusy(`test:${action}`);
    try {
      const res = await fetch(`/api/automations/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        status?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "La prueba falló");
      toast.success(`Webhook respondió HTTP ${data.status ?? 200}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al probar");
    } finally {
      setBusy(null);
    }
  }

  if (query.isPending) {
    return <p className="text-sm text-[var(--muted-fg)]">Cargando…</p>;
  }
  if (query.isError) {
    return (
      <p className="text-sm text-red-400">
        {query.error instanceof Error
          ? query.error.message
          : "No se pudieron cargar las automatizaciones"}
      </p>
    );
  }

  const items = query.data ?? [];

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--muted-fg)]">
        Solo configuración de webhooks. Leads_CRM no edita el workflow de n8n.
        Activa cada evento, pega la URL y usa <strong>Probar</strong> para
        enviar un payload de ejemplo.
      </p>
      {items.map((item) => {
        const configured = item.webhook.configured;
        const inactive = !item.enabled;
        return (
          <section
            key={item.action}
            className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[13px] font-medium tracking-tight">
                  {item.name}
                </h2>
                <p className="mt-0.5 text-[12px] text-[var(--muted-fg)]">
                  {item.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[var(--muted-fg)]">
                  {item.enabled ? "Activa" : "Inactiva"}
                </span>
                <Switch
                  checked={item.enabled}
                  disabled={busy === item.action}
                  onCheckedChange={(enabled) =>
                    void patch(item.action, { enabled })
                  }
                  label={`${item.name} activa`}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span
                className={
                  configured ? "text-emerald-400" : "text-[var(--muted-fg)]"
                }
              >
                {configured ? "Webhook configurado" : "Sin webhook"}
              </span>
              <span className="text-[var(--muted-fg)]">
                {inactive ? "No se disparará hasta activarla" : "Lista"}
              </span>
            </div>

            <SecretField
              id={`auto-wh-${item.action}`}
              label="URL del webhook"
              field={item.webhook}
              value={webhookDraft[item.action] ?? ""}
              onChange={(v) =>
                setWebhookDraft((d) => ({ ...d, [item.action]: v }))
              }
              placeholder="https://…/webhook/…"
              hint="Vacío = no cambiar. Guarda para persistir un override local."
            />

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={busy !== null}
                onClick={() =>
                  void patch(item.action, {
                    webhookUrl: webhookDraft[item.action]?.trim() || undefined,
                  })
                }
              >
                Guardar URL
              </Button>
              <Button
                size="sm"
                disabled={busy !== null || !configured}
                onClick={() => void test(item.action)}
              >
                {busy === `test:${item.action}` ? "Enviando…" : "Probar"}
              </Button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
