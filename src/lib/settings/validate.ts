import { AUTOMATION_ACTION_IDS, type FieldErrors, type SettingsPatch } from "./types";

const HTTP_URL = /^https?:\/\/.+/i;
const NOTION_ID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
const AI_PROVIDERS = new Set(["groq"]);

function optionalUrl(path: string, value: string | undefined, errors: FieldErrors) {
  if (value === undefined) return;
  const trimmed = value.trim();
  if (!trimmed) return;
  if (!HTTP_URL.test(trimmed)) {
    errors[path] = "Debe ser una URL http(s) válida";
  }
}

function optionalNotionId(
  path: string,
  value: string | undefined,
  errors: FieldErrors,
) {
  if (value === undefined) return;
  const trimmed = value.trim();
  if (!trimmed) return;
  if (!NOTION_ID.test(trimmed)) {
    errors[path] = "El ID de Notion no tiene un formato válido";
  }
}

export function validateSettingsPatch(patch: SettingsPatch): FieldErrors {
  const errors: FieldErrors = {};

  optionalNotionId("notion.databaseId", patch.notion?.databaseId, errors);
  optionalNotionId("notion.dataSourceId", patch.notion?.dataSourceId, errors);
  optionalUrl("n8n.baseUrl", patch.n8n?.baseUrl, errors);

  if (patch.n8n?.webhooks) {
    for (const action of AUTOMATION_ACTION_IDS) {
      optionalUrl(`n8n.webhooks.${action}`, patch.n8n.webhooks[action], errors);
    }
  }

  if (patch.automations) {
    for (const action of AUTOMATION_ACTION_IDS) {
      const item = patch.automations[action];
      optionalUrl(`automations.${action}.webhookUrl`, item?.webhookUrl, errors);
    }
  }

  if (patch.ai?.provider !== undefined) {
    const provider = patch.ai.provider.trim().toLowerCase();
    if (provider && !AI_PROVIDERS.has(provider)) {
      errors["ai.provider"] = "Proveedor no soportado. Usa groq.";
    }
  }

  if (patch.ai?.model !== undefined && patch.ai.model.trim().length > 120) {
    errors["ai.model"] = "El nombre del modelo es demasiado largo";
  }

  return errors;
}

export function isHttpUrl(value: string): boolean {
  return HTTP_URL.test(value.trim());
}
