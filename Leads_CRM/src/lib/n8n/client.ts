/**
 * n8n webhook client — ready for configured URLs.
 * Do not add triggers to the n8n workflow in this phase.
 */

export type N8nAction =
  | "buscar_leads"
  | "analizar_lead"
  | "generar_email"
  | "ejecutar_workflow";

const ENV_MAP: Record<N8nAction, string> = {
  buscar_leads: "N8N_WEBHOOK_BUSCAR_LEADS",
  analizar_lead: "N8N_WEBHOOK_ANALIZAR_LEAD",
  generar_email: "N8N_WEBHOOK_GENERAR_EMAIL",
  ejecutar_workflow: "N8N_WEBHOOK_EJECUTAR",
};

export class N8nClient {
  getWebhookUrl(action: N8nAction): string | null {
    const url = process.env[ENV_MAP[action]];
    return url?.trim() || null;
  }

  listConfigured(): { action: N8nAction; configured: boolean }[] {
    return (Object.keys(ENV_MAP) as N8nAction[]).map((action) => ({
      action,
      configured: Boolean(this.getWebhookUrl(action)),
    }));
  }

  async trigger(
    action: N8nAction,
    payload: Record<string, unknown> = {},
  ): Promise<{ ok: boolean; status: number; body: unknown }> {
    const url = this.getWebhookUrl(action);
    if (!url) {
      throw new Error(`Webhook n8n no configurado para ${action}`);
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    return { ok: res.ok, status: res.status, body };
  }
}

export const n8nClient = new N8nClient();
