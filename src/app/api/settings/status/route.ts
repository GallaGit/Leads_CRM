import { NextResponse } from "next/server";
import { isAuthDisabled } from "@/lib/auth";
import { n8nClient } from "@/lib/n8n/client";

export async function GET() {
  const notionOk = Boolean(
    process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID,
  );
  return NextResponse.json({
    authDisabled: isAuthDisabled(),
    notionConfigured: notionOk,
    serpapiConfigured: Boolean(process.env.SERPAPI_API_KEY),
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    n8n: n8nClient.listConfigured(),
  });
}
