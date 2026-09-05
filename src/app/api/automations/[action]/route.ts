import { NextResponse } from "next/server";
import { n8nClient, type N8nAction } from "@/lib/n8n/client";

export async function GET() {
  return NextResponse.json({ actions: n8nClient.listConfigured() });
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ action: string }> },
) {
  try {
    const { action } = await ctx.params;
    const payload = await request.json().catch(() => ({}));
    const result = await n8nClient.trigger(action as N8nAction, payload);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error n8n";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
