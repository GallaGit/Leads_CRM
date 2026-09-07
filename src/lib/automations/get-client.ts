import "server-only";

import { n8nClient, type AutomationClient } from "@/lib/n8n/client";

export type AutomationProviderId = "n8n";

/**
 * Seam for future Make/Zapier clients. Route handlers should use this
 * instead of importing fetch-to-n8n directly.
 */
export function getAutomationClient(
  provider: AutomationProviderId = "n8n",
): AutomationClient {
  if (provider !== "n8n") {
    throw new Error(`Proveedor de automatización no soportado: ${provider}`);
  }
  return n8nClient;
}

export { n8nClient } from "@/lib/n8n/client";
