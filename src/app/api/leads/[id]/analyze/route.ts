import { NextResponse } from "next/server";
import {
  PainAnalysisError,
  analyzeLeadPains,
} from "@/lib/ai/analyze-lead-pains";
import {
  formatPainAnalysis,
  painAnalysisToWebhookPayload,
} from "@/lib/ai/pain-analysis";
import { dispatchLeadAnalyzed } from "@/lib/automations/dispatch";
import { getLeadRepository } from "@/lib/notion/notion-lead-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const repo = getLeadRepository();

  let lead;
  try {
    lead = await repo.get(id);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al obtener lead";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!lead) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  let analysis;
  try {
    analysis = await analyzeLeadPains(lead);
  } catch (e) {
    if (e instanceof PainAnalysisError) {
      const status =
        e.code === "not_configured" ? 503 : e.code === "provider" ? 502 : 502;
      return NextResponse.json({ error: e.message, code: e.code }, { status });
    }
    const message =
      e instanceof Error ? e.message : "Error al analizar el lead";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const text = formatPainAnalysis(analysis);

  try {
    const saved = await repo.update(id, { aiAnalysis: text });
    const activity = await repo.getActivity(id);
    const automation = dispatchLeadAnalyzed(
      saved,
      painAnalysisToWebhookPayload(analysis, text),
    );
    return NextResponse.json({
      lead: saved,
      activity,
      analysis: {
        evidence: analysis.evidence,
        inference: analysis.inference,
        speculation: analysis.speculation,
        text,
      },
      automation,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Error al guardar el análisis";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
