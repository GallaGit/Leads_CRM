import "server-only";

import { createGroqCompletion } from "@/lib/ai/groq-client";
import {
  type PainAnalysis,
  buildLeadFacts,
  isPainAnalysisEmpty,
  parsePainAnalysis,
} from "@/lib/ai/pain-analysis";
import type { Lead } from "@/lib/domain/lead";
import { getSettingsService } from "@/lib/settings/service";

export const PAIN_ANALYSIS_PROMPT_VERSION = "pain-analysis-v1-reconstructed";

const SYSTEM_PROMPT = `Eres un analista comercial para una agencia que vende automatización e IA a asesorías y gestorías (Valencia y alrededores). Tu trabajo es detectar posibles dolores de negocio a partir SOLO de los datos del lead.

Debes separar SIEMPRE tres secciones:

1. Evidencia: hechos que aparecen literalmente en los datos (nombre, web, empleados, servicios, software, ciudad, notas del usuario, etc.). Si falta un dato, puedes constatar la ausencia ("No hay web registrada"). NUNCA inventes webs, cifras, software, citas ni procesos como si estuvieran observados.
2. Inferencia: conclusiones razonables derivadas de esa evidencia (tamaño, nicho, madurez digital aparente).
3. Especulación: hipótesis no demostradas. Los dolores típicos del sector (entrada manual de datos, facturas, documentos, recordatorios, herramientas sin integrar) van aquí o en Inferencia, NUNCA en Evidencia, salvo que las notas del lead los mencionen.

Responde ÚNICAMENTE con JSON válido, sin markdown:
{"evidence":["..."],"inference":["..."],"speculation":["..."]}

Reglas de forma:
- Español.
- 2 a 5 ítems cortos por sección.
- Texto total breve (cabe en ~1800 caracteres).
- Si hay muy pocos datos, dilo en Evidencia y sé conservador en Inferencia/Especulación.
- El borrador de email NO es evidencia: es texto generado, no un hecho de la empresa.`;

export class PainAnalysisError extends Error {
  readonly code: "not_configured" | "empty" | "invalid" | "provider";

  constructor(
    message: string,
    code: PainAnalysisError["code"],
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "PainAnalysisError";
    this.code = code;
  }
}

export function assertGroqConfigured(): void {
  const apiKey = getSettingsService().getRaw().ai.apiKey.value;
  if (!apiKey) {
    throw new PainAnalysisError(
      "GROQ_API_KEY no configurado. Añádela en Settings.",
      "not_configured",
    );
  }
}

export async function analyzeBusinessPains(lead: Lead): Promise<PainAnalysis> {
  assertGroqConfigured();

  let content: string;
  try {
    const completion = await createGroqCompletion(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(lead) },
      ],
      {
        temperature: 0.3,
        max_completion_tokens: 1200,
      },
    );
    content = completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (error) {
    if (error instanceof PainAnalysisError) throw error;
    const message =
      error instanceof Error ? error.message : "Error al llamar a Groq";
    throw new PainAnalysisError(message, "provider", { cause: error });
  }

  if (!content) {
    throw new PainAnalysisError("Groq no devolvió contenido", "empty");
  }

  const analysis = parsePainAnalysis(content);
  if (isPainAnalysisEmpty(analysis)) {
    throw new PainAnalysisError(
      "El análisis IA no se pudo interpretar",
      "invalid",
    );
  }
  return analysis;
}

/** @deprecated Use analyzeBusinessPains */
export const analyzeLeadPains = analyzeBusinessPains;

function buildUserPrompt(lead: Lead): string {
  const facts = buildLeadFacts(lead);
  const emailDraft = [lead.emailSubject, lead.emailBody]
    .filter((part) => part?.trim())
    .join("\n\n");

  const parts = [
    "Datos observados del lead (únicos hechos permitidos en Evidencia):",
    facts,
  ];
  if (emailDraft) {
    parts.push(
      "",
      "Borrador de email (texto generado, no evidencia):",
      emailDraft.slice(0, 800),
    );
  }
  return parts.join("\n");
}
