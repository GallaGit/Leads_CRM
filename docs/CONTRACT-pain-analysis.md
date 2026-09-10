# Contrato — Detectar dolores (análisis IA)

**Rama:** `feat/detectar-dolores-ia`  
**Prompt:** `pain-analysis-v1-reconstructed`

## Endpoint canónico (Front)

`POST /api/leads/:id/analyze`

Body opcional:

```json
{ "force": false }
```

`force: true` omite el cortocircuito de “sin señales” (web / servicios / software / notas) y llama a Groq igual.

### 200

```json
{
  "leadId": "notion-page-id",
  "analysis": {
    "evidencia": ["…"],
    "inferencia": ["…"],
    "especulacion": ["…"],
    "summary": "…",
    "model": "openai/gpt-oss-120b",
    "analyzedAt": "2026-09-10T12:00:00.000Z"
  },
  "notionUpdated": true,
  "notified": false,
  "lead": {},
  "activity": [],
  "automation": { "status": "skipped", "reason": "inactive" }
}
```

Si no hay señal útil: `empty: true`, arrays vacíos, `notionUpdated: false`, `notified: false`. No se inventan bullets ni se escribe Notion.

### Errores

| Status | Cuerpo |
|--------|--------|
| 404 | `{ "error": "Lead no encontrado" }` |
| 502 | `{ "error": { "code": "ai_error", "message": "…" } }` — Groq / clave. El lead no se corrompe. |
| 500 | Error al leer o persistir Notion (después de Groq OK). |

## Alias

`POST /api/leads/pain-analysis` con `{ "id": "<leadId>", "force?": true }` delega en el mismo handler.

## Servicio

- Parser / formato / hechos: `src/lib/ai/pain-analysis.ts` (usable en cliente).
- Llamada Groq: `analyzeBusinessPains` en `src/lib/ai/analyze-lead-pains.ts` via `createGroqCompletion`.
- Orquestación: `runLeadAnalyze` (`src/lib/ai/run-lead-analyze.ts`).

**Evidencia** solo admite hechos del lead. Inferencia y especulación no se presentan como evidencia.

Persistencia: propiedad Notion `Análisis IA` (`aiAnalysis`).  
Automatización: `dispatchLeadAnalyzed` → webhook `lead_analyzed` (best-effort).
