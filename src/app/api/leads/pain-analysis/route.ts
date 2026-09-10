import { NextResponse } from "next/server";
import { runLeadAnalyze } from "@/lib/ai/run-lead-analyze";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Alias of POST /api/leads/:id/analyze.
 * Canonical Front contract is /api/leads/:id/analyze.
 */
export async function POST(request: Request) {
  let body: { id?: unknown; force?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json(
      { error: "id de lead requerido" },
      { status: 400 },
    );
  }

  const result = await runLeadAnalyze(id, { force: body.force === true });
  return NextResponse.json(result.body, { status: result.status });
}
