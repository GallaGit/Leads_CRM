import { Button } from "@/components/ui/button";
import {
  PainAnalysisBlocks,
  PainAnalysisSkeletons,
} from "@/components/leads/pain-analysis-section";
import type { PainAnalysis } from "@/lib/ai/pain-analysis";

export function AiAnalysisPanel({
  analyzing,
  error,
  empty,
  analysis,
  onRetry,
}: {
  analyzing: boolean;
  error: string | null;
  empty: boolean;
  analysis: PainAnalysis | null;
  onRetry: () => void;
}) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
        Dolores
      </h3>
      <div className="space-y-1.5">
        {analyzing ? <PainAnalysisSkeletons /> : null}

        {!analyzing && error ? (
          <div className="rounded-md border border-[var(--border)] px-2.5 py-2">
            <p className="text-[12px] text-[var(--fg)]">
              No se pudo detectar dolores. {error}
            </p>
            <Button
              className="mt-2"
              variant="outline"
              size="sm"
              onClick={onRetry}
            >
              Reintentar
            </Button>
          </div>
        ) : null}

        {!analyzing && !error && empty ? (
          <div>
            <p className="text-[12px] text-[var(--muted-fg)]">
              No hay señales suficientes en este lead.
            </p>
            <p className="mt-1 text-[11px] text-[var(--muted-fg)]">
              Añade web, servicios o notas y vuelve a intentar.
            </p>
          </div>
        ) : null}

        {!analyzing && !error && !empty && !analysis ? (
          <p className="text-[12px] text-[var(--muted-fg)]">
            Aún no hay análisis. Pulsa Detectar dolores.
          </p>
        ) : null}

        {!analyzing && !empty && analysis ? (
          <PainAnalysisBlocks analysis={analysis} />
        ) : null}
      </div>
    </section>
  );
}
