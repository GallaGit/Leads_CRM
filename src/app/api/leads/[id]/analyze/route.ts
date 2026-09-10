import { NextResponse } from "next/server";
import {
  PainAnalysisError,
  analyzeLeadPains,
} from "@/lib/ai/analyze-lead-pains";
import {
  formatPainAnalysis,
  hasPainAnalysisSignal,
  isPainAnalysisEmpty,
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

  if (!hasPainAnalysisSignal(lead)) {
    return NextResponse.json({
      lead,
      empty: true,
      analysis: { evidence: [], inference: [], speculation: [], text: "" },
    });
  }

  let analysis;
  try {
    analysis = await analyzeLeadPains(lead);
  } catch (e) {
    if (e instanceof PainAnalysisError) {
      if (e.code === "empty" || e.code === "invalid") {
        return NextResponse.json({
          lead,
          empty: true,
          analysis: { evidence: [], inference: [], speculation: [], text: "" },
        });
      }
      const status = e.code === "not_configured" ? 503 : 502;
      return NextResponse.json({ error: e.message, code: e.code }, { status });
    }
    const message =
      e instanceof Error ? e.message : "Error al analizar el lead";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (isPainAnalysisEmpty(analysis)) {
    return NextResponse.json({
      lead,
      empty: true,
      analysis: { evidence: [], inference: [], speculation: [], text: "" },
    });
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
