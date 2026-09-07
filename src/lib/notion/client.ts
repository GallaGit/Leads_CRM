import { Client } from "@notionhq/client";
import { getSettingsService } from "@/lib/settings/service";

let client: Client | null = null;
let cachedToken: string | null = null;

function notionToken(): string {
  return getSettingsService().getRaw().notion.token.value;
}

export function getNotionClient(): Client {
  const token = notionToken();
  if (!token) {
    throw new Error("NOTION_TOKEN no configurado");
  }
  if (!client || cachedToken !== token) {
    client = new Client({ auth: token });
    cachedToken = token;
  }
  return client;
}

/** Database ID (parent). Prefer data source for queries in Notion API 2025+. */
export function getNotionDatabaseId(): string {
  const id = getSettingsService().getRaw().notion.databaseId.value;
  return id.replace(/-/g, "");
}

/** Data source collection ID for Leads Asesorías Valencia */
export function getNotionDataSourceId(): string {
  const id = getSettingsService().getRaw().notion.dataSourceId.value;
  return id.replace(/-/g, "");
}
