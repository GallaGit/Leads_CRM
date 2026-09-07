import type { AutomationAction, ValueSource } from "./types";

export function sourceLabel(source: ValueSource): string {
  switch (source) {
    case "file":
      return "archivo local";
    case "env":
      return ".env";
    case "default":
      return "valor por defecto";
    default:
      return "sin configurar";
  }
}

export const DEFAULT_NOTION_DATABASE_ID =
  "ed07cdd4c5424f9a8b8ebd73e358c6cd";
export const DEFAULT_NOTION_DATA_SOURCE_ID =
  "27fefc60-8dfd-4356-9465-582d3c49d99f";
export const DEFAULT_AI_PROVIDER = "groq";
export const DEFAULT_AI_MODEL = "openai/gpt-oss-120b";

export const AUTOMATION_CATALOG: Record<
  AutomationAction,
  {
    name: string;
    description: string;
    envKeys: readonly string[];
  }
> = {
  lead_created: {
    name: "Nuevo Lead",
    description:
      "Webhook al crear un lead. El workflow n8n actual no incluye este trigger; configura la URL y usa Probar.",
    envKeys: ["N8N_WEBHOOK_LEAD_CREATED", "N8N_WEBHOOK_BUSCAR_LEADS"],
  },
  lead_updated: {
    name: "Lead actualizado",
    description:
      "Webhook al actualizar un lead (estado, notas u otros campos). Triggers pendientes en n8n.",
    envKeys: [
      "N8N_WEBHOOK_LEAD_UPDATED",
      "N8N_WEBHOOK_EJECUTAR",
      "N8N_WEBHOOK_GENERAR_EMAIL",
    ],
  },
  lead_analyzed: {
    name: "Lead analizado",
    description:
      "Webhook tras analizar un lead. La acción de dolores IA no forma parte de esta fase.",
    envKeys: ["N8N_WEBHOOK_LEAD_ANALYZED", "N8N_WEBHOOK_ANALIZAR_LEAD"],
  },
};

/** Legacy n8n action names accepted by the HTTP client and automations API. */
export const LEGACY_ACTION_ALIASES: Record<string, AutomationAction> = {
  buscar_leads: "lead_created",
  analizar_lead: "lead_analyzed",
  generar_email: "lead_updated",
  ejecutar_workflow: "lead_updated",
};

export function resolveAutomationAction(
  value: string,
): AutomationAction | null {
  if (value in AUTOMATION_CATALOG) {
    return value as AutomationAction;
  }
  return LEGACY_ACTION_ALIASES[value] ?? null;
}
