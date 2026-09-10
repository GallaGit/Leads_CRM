import "server-only";

import {
  PAIN_ANALYSIS_PROMPT_VERSION,
  PainAnalysisError,
  analyzeBusinessPains,
} from "@/lib/ai/analyze-lead-pains";
import {
  formatPainAnalysis,
  hasPainAnalysisSignal,
  isPainAnalysisEmpty,
  painAnalysisToWebhookPayload,
} from "@/lib/ai/pain-analysis";
import {
  type ApiPainAnalysis,
  analyzeSuccessPayload,
  emptyApiPainAnalysis,
  toApiPainAnalysis,
} from "@/lib/ai/pain-analysis-api";
import { dispatchLeadAnalyzed } from "@/lib/automations/dispatch";
import type { Lead } from "@/lib/domain/lead";
import { getLeadRepository } from "@/lib/notion/notion-lead-repository";
import { getSettingsService } from "@/lib/settings/service";

export type AnalyzeLeadResult =
  | { ok: true; status: 200; body: ReturnType<typeof analyzeSuccessPayload> }
  | { ok: false; status: 404 | 500 | 502; body: Record<string, unknown> };

function currentModel(): string {
  return (
    getSettingsService().getRaw().ai.model.value || "openai/gpt-oss-120b"
  );
}

function emptyBody(lead: Lead) {
  const analysis: ApiPainAnalysis = emptyApiPainAnalysis({
    model: currentModel(),
    promptVersion: PAIN_ANALYSIS_PROMPT_VERSION,
  });
  return analyzeSuccessPayload({
    lead,
    analysis,
    notionUpdated: false,
    notified: false,
    empty: true,
  });
}

export async function runLeadAnalyze(
  id: string,
  options: { force?: boolean } = {},
): Promise<AnalyzeLeadResult> {
  const repo = getLeadRepository();
  const force = options.force === true;

  let lead: Lead | null;
  try {
    lead = await repo.get(id);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al obtener lead";
    return { ok: false, status: 500, body: { error: message } };
  }

  if (!lead) {
    return { ok: false, status: 404, body: { error: "Lead no encontrado" } };
  }

  if (!force && !hasPainAnalysisSignal(lead)) {
    return { ok: true, status: 200, body: emptyBody(lead) };
  }

  let analysis;
  try {
    analysis = await analyzeBusinessPains(lead);
  } catch (e) {
    if (e instanceof PainAnalysisError && (e.code === "empty" || e.code === "invalid")) {
      return { ok: true, status: 200, body: emptyBody(lead) };
    }
    const message =
      e instanceof Error ? e.message : "Error al analizar el lead";
    return {
      ok: false,
      status: 502,
      body: { error: { code: "ai_error", message } },
    };
  }

  if (isPainAnalysisEmpty(analysis)) {
    return { ok: true, status: 200, body: emptyBody(lead) };
  }

  const text = formatPainAnalysis(analysis);
  const apiAnalysis = toApiPainAnalysis(analysis, {
    model: currentModel(),
    promptVersion: PAIN_ANALYSIS_PROMPT_VERSION,
  });

  try {
    const saved = await repo.update(id, { aiAnalysis: text });
    const activity = await repo.getActivity(id);
    const automation = dispatchLeadAnalyzed(
      saved,
      painAnalysisToWebhookPayload(analysis, text),
    );
    return {
      ok: true,
      status: 200,
      body: analyzeSuccessPayload({
        lead: saved,
        analysis: apiAnalysis,
        notionUpdated: true,
        notified: automation.status === "dispatched",
        activity,
        automation,
      }),
    };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Error al guardar el análisis";
    return { ok: false, status: 500, body: { error: message } };
  }
}
