import type { AutomationAction } from "@/lib/settings/types";

const SAMPLE_LEAD = {
  id: "sample-lead-id",
  companyName: "Asesoría Ejemplo S.L.",
  city: "Valencia",
  province: "Valencia",
  status: "Nuevo",
  email: "contacto@ejemplo.example",
};

export function sampleAutomationPayload(
  action: AutomationAction,
): Record<string, unknown> {
  switch (action) {
    case "lead_created":
      return {
        event: "lead.created",
        source: "leads_crm_test",
        lead: SAMPLE_LEAD,
      };
    case "lead_updated":
      return {
        event: "lead.updated",
        source: "leads_crm_test",
        lead: { ...SAMPLE_LEAD, status: "Validado" },
        changed: ["status"],
      };
    case "lead_analyzed":
      return {
        event: "lead.analyzed",
        source: "leads_crm_test",
        lead: SAMPLE_LEAD,
        analysis: {
          evidence: [],
          inference: [],
          speculation: [],
        },
      };
  }
}

export function leadCreatedPayload(
  lead: Record<string, unknown>,
): Record<string, unknown> {
  return { event: "lead.created", source: "leads_crm", lead };
}

export function leadUpdatedPayload(
  lead: Record<string, unknown>,
  changed: string[] = [],
): Record<string, unknown> {
  return { event: "lead.updated", source: "leads_crm", lead, changed };
}

export function leadAnalyzedPayload(
  lead: Record<string, unknown>,
  analysis: Record<string, unknown> = {},
): Record<string, unknown> {
  return { event: "lead.analyzed", source: "leads_crm", lead, analysis };
}
