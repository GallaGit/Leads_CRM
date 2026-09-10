import { PAIN_SECTION_LABELS, type PainAnalysis } from "@/lib/ai/pain-analysis";

const SECTION_HINT: Record<keyof PainAnalysis, string> = {
  evidence: "Hechos presentes en el lead. No se inventan datos.",
  inference: "Conclusiones razonables a partir de la evidencia.",
  speculation: "Hipótesis no demostradas; no tratarlas como hechos.",
};

export function PainAnalysisBlocks({ analysis }: { analysis: PainAnalysis }) {
  return (
    <div className="space-y-2">
      {(
        [
          ["evidence", analysis.evidence],
          ["inference", analysis.inference],
          ["speculation", analysis.speculation],
        ] as const
      ).map(([key, items]) => (
        <div
          key={key}
          className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-2"
        >
          <div className="text-[11px] font-semibold tracking-wide text-[var(--fg)]">
            {PAIN_SECTION_LABELS[key]}
          </div>
          <p className="mt-0.5 text-[10px] text-[var(--muted-fg)]">
            {SECTION_HINT[key]}
          </p>
          {items.length > 0 ? (
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[12.5px] text-[var(--fg)]">
              {items.map((item) => (
                <li key={item} className="break-words">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-[12.5px] text-[var(--muted-fg)]">
              Sin ítems.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function PainAnalysisFallback({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap break-words text-[12.5px] text-[var(--fg)]">
      {text}
    </p>
  );
}
