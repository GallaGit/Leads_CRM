"use client";

import { toast } from "sonner";
import type { AutomationDispatchResult } from "@/lib/automations/dispatch-result";

export function toastAutomationDispatch(
  automation: AutomationDispatchResult | undefined,
): void {
  if (automation?.status === "dispatched") {
    toast.message("Webhook n8n enviado");
  }
}

export function toastAutomationBulk(automation?: {
  dispatched?: number;
}): void {
  const n = automation?.dispatched ?? 0;
  if (n <= 0) return;
  toast.message(
    n === 1 ? "Webhook n8n enviado" : `${n} webhooks n8n enviados`,
  );
}

