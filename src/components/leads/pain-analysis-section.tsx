import { PAIN_SECTION_LABELS, type PainAnalysis } from "@/lib/ai/pain-analysis";

const SECTION_ORDER = [
  "evidence",
  "inference",
  "speculation",
] as const satisfies ReadonlyArray<keyof PainAnalysis>;

export function PainAnalysisBlocks({ analysis }: { analysis: PainAnalysis }) {
  return (
    <div className="divide-y divide-[var(--border)]">
      {SECTION_ORDER.map((key) => {
        const items = analysis[key].slice(0, 5);
        return (
          <div
            key={key}
            className={
              key === "inference"
                ? "border-l-2 border-l-[var(--accent)] py-2 pl-2.5"
                : "py-2"
            }
          >
            <div className="flex items-center gap-1.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
                {PAIN_SECTION_LABELS[key]}
              </h4>
              {key === "speculation" ? (
                <span className="text-[10px] text-[var(--muted-fg)]">
                  hipótesis
                </span>
              ) : null}
            </div>
            {items.length > 0 ? (
              <ul className="mt-1 space-y-1 text-[12.5px] text-[var(--fg)]">
                {items.map((item) => (
                  <li key={item} className="break-words">
                    • {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-[12.5px] text-[var(--muted-fg)]">—</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PainAnalysisSkeletons() {
  return (
    <div className="divide-y divide-[var(--border)]">
      {SECTION_ORDER.map((key) => (
        <div key={key} className="py-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-fg)] opacity-60">
            {PAIN_SECTION_LABELS[key]}
          </h4>
          <div className="mt-2 h-12 animate-pulse rounded bg-[var(--muted)]" />
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
