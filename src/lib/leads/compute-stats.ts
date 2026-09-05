import {
  LEAD_STATUSES,
  PROVINCES,
  type Lead,
  type LeadStatus,
} from "@/lib/domain/lead";

export type CountRow = {
  key: string;
  label: string;
  count: number;
  percent: number;
};

export type FunnelRate = {
  key: string;
  label: string;
  count: number;
  percent: number;
};

export type LeadStats = {
  total: number;
  byStatus: CountRow[];
  byProvince: CountRow[];
  byCity: CountRow[];
  byEmployees: CountRow[];
  funnel: CountRow[];
  rates: FunnelRate[];
};

/** Pipeline order used for "reached or beyond" rates (excludes Descartado). */
const PROGRESS_STATUSES: LeadStatus[] = LEAD_STATUSES.filter(
  (s) => s !== "Descartado",
);

export const EMPLOYEE_BUCKETS = [
  { key: "unknown", label: "Sin dato", match: (n: number | null) => n == null },
  {
    key: "1-4",
    label: "1–4",
    match: (n: number | null) => n != null && n >= 1 && n <= 4,
  },
  {
    key: "5-30",
    label: "5–30 (ICP)",
    match: (n: number | null) => n != null && n >= 5 && n <= 30,
  },
  {
    key: "31-50",
    label: "31–50",
    match: (n: number | null) => n != null && n >= 31 && n <= 50,
  },
  {
    key: "51+",
    label: "51+",
    match: (n: number | null) => n != null && n >= 51,
  },
  {
    key: "0",
    label: "0",
    match: (n: number | null) => n === 0,
  },
] as const;

function pct(count: number, total: number): number {
  if (!total) return 0;
  return Math.round((count / total) * 1000) / 10;
}

function toRows(
  entries: Array<{ key: string; label: string; count: number }>,
  total: number,
  options?: { sortByCount?: boolean; hideZero?: boolean },
): CountRow[] {
  let rows = entries.map((e) => ({
    ...e,
    percent: pct(e.count, total),
  }));
  if (options?.hideZero) {
    rows = rows.filter((r) => r.count > 0);
  }
  if (options?.sortByCount) {
    rows = [...rows].sort(
      (a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"),
    );
  }
  return rows;
}

function progressIndex(status: LeadStatus): number {
  return PROGRESS_STATUSES.indexOf(status);
}

/** Count leads that reached `minStatus` or a later pipeline stage. */
function reachedOrBeyond(leads: Lead[], minStatus: LeadStatus): number {
  const minIdx = progressIndex(minStatus);
  if (minIdx < 0) return 0;
  return leads.filter((l) => {
    if (l.status === "Descartado") return false;
    const idx = progressIndex(l.status);
    return idx >= minIdx;
  }).length;
}

export function computeLeadStats(leads: Lead[]): LeadStats {
  const total = leads.length;

  const statusCounts = Object.fromEntries(
    LEAD_STATUSES.map((s) => [s, 0]),
  ) as Record<LeadStatus, number>;
  for (const lead of leads) {
    statusCounts[lead.status] = (statusCounts[lead.status] ?? 0) + 1;
  }
  const byStatus = toRows(
    LEAD_STATUSES.map((s) => ({
      key: s,
      label: s,
      count: statusCounts[s],
    })),
    total,
  );

  const provinceMap = new Map<string, number>();
  for (const lead of leads) {
    const raw = (lead.province ?? "").toString().trim();
    const key = raw || "Sin provincia";
    provinceMap.set(key, (provinceMap.get(key) ?? 0) + 1);
  }
  const provinceOrder = [...PROVINCES, "Sin provincia"];
  const provinceEntries = [...provinceMap.entries()].map(([key, count]) => ({
    key,
    label: key,
    count,
  }));
  provinceEntries.sort((a, b) => {
    const ai = provinceOrder.indexOf(a.key as (typeof PROVINCES)[number]);
    const bi = provinceOrder.indexOf(b.key as (typeof PROVINCES)[number]);
    const aRank = ai === -1 ? 999 : ai;
    const bRank = bi === -1 ? 999 : bi;
    if (aRank !== bRank) return aRank - bRank;
    return b.count - a.count || a.label.localeCompare(b.label, "es");
  });
  const byProvince = toRows(provinceEntries, total);

  const cityMap = new Map<string, number>();
  for (const lead of leads) {
    const raw =
      (lead.cityCanonical ?? "").trim() || (lead.city ?? "").trim() || "";
    const key = raw || "Sin ciudad";
    cityMap.set(key, (cityMap.get(key) ?? 0) + 1);
  }
  const byCity = toRows(
    [...cityMap.entries()].map(([key, count]) => ({
      key,
      label: key,
      count,
    })),
    total,
    { sortByCount: true },
  );

  const empCounts = EMPLOYEE_BUCKETS.map((b) => ({
    key: b.key,
    label: b.label,
    count: leads.filter((l) => b.match(l.employees)).length,
  }));
  const byEmployees = toRows(empCounts, total);

  const funnel = byStatus;

  const rateDefs: Array<{ key: string; label: string; status: LeadStatus }> = [
    { key: "validation", label: "Tasa de validación", status: "Validado" },
    {
      key: "email_prepared",
      label: "Tasa email preparado",
      status: "Email preparado",
    },
    { key: "response", label: "Tasa de respuesta", status: "Respondió" },
    { key: "meeting", label: "Tasa de reunión", status: "Reunión" },
    { key: "client", label: "Tasa de cliente", status: "Cliente" },
  ];

  const rates: FunnelRate[] = rateDefs.map((r) => {
    const count = reachedOrBeyond(leads, r.status);
    return {
      key: r.key,
      label: r.label,
      count,
      percent: pct(count, total),
    };
  });

  return {
    total,
    byStatus,
    byProvince,
    byCity,
    byEmployees,
    funnel,
    rates,
  };
}
