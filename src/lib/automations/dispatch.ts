import "server-only";

import { after } from "next/server";
import type { Lead } from "@/lib/domain/lead";
import { getSettingsService } from "@/lib/settings/service";
import type { AutomationAction } from "@/lib/settings/types";
import { getAutomationClient } from "./get-client";
import type { AutomationDispatchResult } from "./dispatch-result";

export type { AutomationDispatchResult, AutomationBulkDispatchResult } from "./dispatch-result";

export function leadWebhookPayload(lead: Lead): Record<string, unknown> {
  return {
    id: lead.id,
    companyName: lead.companyName,
    status: lead.status,
    city: lead.city,
    province: lead.province,
    email: lead.email,
    phone: lead.phone,
    website: lead.website,
    source: lead.source,
  };
}

function preview(action: AutomationAction): AutomationDispatchResult {
  const raw = getSettingsService().getRaw();
  if (!raw.automations[action].enabled.value) {
    return { status: "skipped", reason: "inactive" };
  }
  if (!raw.n8n.webhooks[action].value) {
    return { status: "skipped", reason: "not_configured" };
  }
  return { status: "dispatched" };
}

function fireAndForget(
  action: AutomationAction,
  leadId: string,
  work: Promise<unknown>,
): void {
  after(() =>
    work.catch((error) => {
      console.error("[n8n] notify failed", {
        action,
        leadId,
        reason: error instanceof Error ? error.message : "unknown",
      });
    }),
  );
}

export function dispatchLeadCreated(lead: Lead): AutomationDispatchResult {
  const result = preview("lead_created");
  if (result.status === "skipped") return result;
  const client = getAutomationClient();
  fireAndForget(
    "lead_created",
    lead.id,
    client.notifyLeadCreated(leadWebhookPayload(lead)),
  );
  return result;
}

export function dispatchLeadUpdated(
  lead: Lead,
  changed: string[] = [],
): AutomationDispatchResult {
  const result = preview("lead_updated");
  if (result.status === "skipped") return result;
  const client = getAutomationClient();
  fireAndForget(
    "lead_updated",
    lead.id,
    client.notifyLeadUpdated(leadWebhookPayload(lead), changed),
  );
  return result;
}

export function dispatchLeadAnalyzed(
  lead: Lead,
  analysis: Record<string, unknown> = {},
): AutomationDispatchResult {
  const result = preview("lead_analyzed");
  if (result.status === "skipped") return result;
  const client = getAutomationClient();
  fireAndForget(
    "lead_analyzed",
    lead.id,
    client.notifyLeadAnalyzed(leadWebhookPayload(lead), analysis),
  );
  return result;
}

export function changedKeys(patch: object): string[] {
  return Object.keys(patch).filter((key) => {
    const value = (patch as Record<string, unknown>)[key];
    return value !== undefined;
  });
}

export function summarizeDispatch(
  results: AutomationDispatchResult[],
): { dispatched: number; skipped: number } {
  let dispatched = 0;
  let skipped = 0;
  for (const result of results) {
    if (result.status === "dispatched") dispatched += 1;
    else skipped += 1;
  }
  return { dispatched, skipped };
}