import type { AutomationAction } from "@/lib/settings/types";

/** @deprecated Prefer AutomationAction. Kept so existing imports compile. */
export type N8nAction =
  | AutomationAction
  | "buscar_leads"
  | "analizar_lead"
  | "generar_email"
  | "ejecutar_workflow";
