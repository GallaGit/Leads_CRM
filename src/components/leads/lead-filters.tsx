"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Calculator, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateLeadDialog } from "@/components/leads/create-lead-dialog";
import { LEAD_STATUSES, type Lead, type LeadFilters, type LeadStatus } from "@/lib/domain/lead";
import { CANONICAL_CITIES } from "@/lib/geo/cities";
import { PROVINCES } from "@/lib/domain/lead";
import { getWorkQueueTitle } from "@/lib/leads/work-queues";
import { useUiStore } from "@/store/ui-store";
import { useRouter } from "next/navigation";

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
        active
          ? "border-(--accent) bg-(--accent)/15 text-(--fg)"
          : "border-(--border) text-(--muted-fg) hover:bg-(--muted)"
      }`}
    >
      {children}
    </button>
  );
}

function toggleInArray<T extends string>(arr: T[] | undefined, value: T): T[] {
  const cur = arr ?? [];
  return cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
}

export function LeadFiltersBar() {
  const {
    filters,
    setFilters,
    resetFilters,
    leads,
    activeQueue,
    setActiveQueue,
    selectedIds,
    upsertLead,
  } = useUiStore();
  const [scoring, setScoring] = useState(false);

  async function recalculateScores() {
    setScoring(true);
    try {
      const body = selectedIds.length > 0 ? { ids: selectedIds } : {};
      const res = await fetch("/api/leads/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al puntuar");
      for (const lead of (data.leads as Lead[]) ?? []) {
        upsertLead(lead);
      }
      const scope =
        selectedIds.length > 0
          ? `${selectedIds.length} seleccionados`
          : "todos los activos";
      toast.success(
        `Scores recalculados (${scope}): ${data.scored}/${data.total}` +
          (data.failed ? ` · fallidos: ${data.failed}` : ""),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al puntuar");
    } finally {
      setScoring(false);
    }
  }

  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const l of leads) {
      if (l.cityCanonical) set.add(l.cityCanonical);
    }
    for (const c of CANONICAL_CITIES) set.add(c);
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [leads]);

  const tri = (
    key: keyof LeadFilters,
    label: string,
  ) => {
    const v = filters[key] as boolean | null | undefined;
    return (
      <Chip
        active={v === true}
        onClick={() =>
          setFilters({
            [key]: v === true ? null : true,
          } as Partial<LeadFilters>)
        }
      >
        {label}
        {v === true ? " ✓" : ""}
      </Chip>
    );
  };

  const hasActive =
    Boolean(filters.search) ||
    (filters.status?.length ?? 0) > 0 ||
    (filters.province?.length ?? 0) > 0 ||
    (filters.city?.length ?? 0) > 0 ||
    filters.employeesMin != null ||
    filters.employeesMax != null ||
    filters.hasEmail != null ||
    filters.hasPhone != null ||
    filters.hasWebsite != null ||
    filters.hasLinkedin != null ||
    filters.favorite != null ||
    filters.createdFrom ||
    filters.createdTo ||
    Boolean(activeQueue);

  const router = useRouter();

  function clearQueue() {
    setActiveQueue(null);
    router.replace("/leads", { scroll: false });
  }

  return (
    <div className="space-y-2 border-b border-(--border) bg-(--panel) px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar empresa, dominio, email, ciudad…"
          className="max-w-sm"
          value={filters.search ?? ""}
          onChange={(e) => setFilters({ search: e.target.value || undefined })}
        />
        {activeQueue && (
          <span className="inline-flex items-center gap-1 rounded-full border border-(--accent) bg-(--accent)/15 px-2 py-0.5 text-[11px]">
            Cola: {getWorkQueueTitle(activeQueue)}
            <button
              type="button"
              className="rounded p-0.5 hover:bg-(--muted)"
              onClick={clearQueue}
              aria-label="Quitar cola"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        {hasActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetFilters();
              setActiveQueue(null);
              router.replace("/leads", { scroll: false });
            }}
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </Button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={scoring}
            onClick={() => void recalculateScores()}
            title={
              selectedIds.length > 0
                ? `Recalcular score de ${selectedIds.length} seleccionados`
                : "Recalcular score de todos los leads activos"
            }
          >
            <Calculator className="h-3.5 w-3.5" />
            {scoring ? "Puntuando…" : "Recalcular scores"}
          </Button>
          <CreateLeadDialog />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="mr-1 self-center text-[11px] text-(--muted-fg)">
          Estado
        </span>
        {LEAD_STATUSES.map((s) => (
          <Chip
            key={s}
            active={filters.status?.includes(s)}
            onClick={() =>
              setFilters({ status: toggleInArray(filters.status, s as LeadStatus) })
            }
          >
            {s}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="mr-1 self-center text-[11px] text-(--muted-fg)">
          Provincia
        </span>
        {PROVINCES.map((p) => (
          <Chip
            key={p}
            active={filters.province?.includes(p)}
            onClick={() =>
              setFilters({ province: toggleInArray(filters.province, p) })
            }
          >
            {p}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="mr-1 self-center text-[11px] text-(--muted-fg)">
          Ciudad
        </span>
        {cities.slice(0, 16).map((c) => (
          <Chip
            key={c}
            active={filters.city?.includes(c)}
            onClick={() => setFilters({ city: toggleInArray(filters.city, c) })}
          >
            {c}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] text-(--muted-fg)">Empleados</span>
        <Input
          type="number"
          placeholder="Min"
          className="h-7 w-16"
          value={filters.employeesMin ?? ""}
          onChange={(e) =>
            setFilters({
              employeesMin: e.target.value ? Number(e.target.value) : null,
            })
          }
        />
        <span className="text-(--muted-fg)">–</span>
        <Input
          type="number"
          placeholder="Max"
          className="h-7 w-16"
          value={filters.employeesMax ?? ""}
          onChange={(e) =>
            setFilters({
              employeesMax: e.target.value ? Number(e.target.value) : null,
            })
          }
        />
        {tri("hasEmail", "Con email")}
        {tri("hasPhone", "Con teléfono")}
        {tri("hasWebsite", "Con web")}
        {tri("hasLinkedin", "Con LinkedIn")}
        {tri("favorite", "Favoritos")}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-(--muted-fg)">Creación</span>
        <Input
          type="date"
          className="h-7 w-auto"
          value={filters.createdFrom ?? ""}
          onChange={(e) =>
            setFilters({ createdFrom: e.target.value || null })
          }
        />
        <Input
          type="date"
          className="h-7 w-auto"
          value={filters.createdTo ?? ""}
          onChange={(e) => setFilters({ createdTo: e.target.value || null })}
        />
        <span className="text-[11px] text-(--muted-fg)">Actividad</span>
        <Input
          type="date"
          className="h-7 w-auto"
          value={filters.activityFrom ?? ""}
          onChange={(e) =>
            setFilters({ activityFrom: e.target.value || null })
          }
        />
        <Input
          type="date"
          className="h-7 w-auto"
          value={filters.activityTo ?? ""}
          onChange={(e) => setFilters({ activityTo: e.target.value || null })}
        />
      </div>
    </div>
  );
}
