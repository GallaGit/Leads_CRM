import { Client } from "@notionhq/client";

let client: Client | null = null;

export function getNotionClient(): Client {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error("NOTION_TOKEN no configurado");
  }
  if (!client) {
    client = new Client({ auth: token });
  }
  return client;
}

/** Database ID (parent). Prefer data source for queries in Notion API 2025+. */
export function getNotionDatabaseId(): string {
  const id =
    process.env.NOTION_DATABASE_ID ?? "ed07cdd4c5424f9a8b8ebd73e358c6cd";
  return id.replace(/-/g, "");
}

/** Data source collection ID for Leads Asesorías Valencia */
export function getNotionDataSourceId(): string {
  const id =
    process.env.NOTION_DATA_SOURCE_ID ?? "27fefc60-8dfd-4356-9465-582d3c49d99f";
  return id.replace(/-/g, "");
}
