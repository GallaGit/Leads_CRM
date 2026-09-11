import type { Lead, LeadStatus } from "@/lib/domain/lead";
import { LEAD_STATUSES } from "@/lib/domain/lead";
import { CANONICAL_CITIES } from "@/lib/geo/cities";

/**
 * Modular lead scoring (0–100). Weights sum to 100.
 *
 * | Factor            | Weight | Rule |
 * |-------------------|-------:|------|
 * | hasEmail          |     20 | Any of Correo General / Comercial / Gerente |
 * | hasPhone          |     15 | Teléfono presente |
 * | hasWeb            |     10 | Web presente |
 * | hasLinkedIn       |     10 | LinkedIn presente |
 * | employeeRangeFit  |     20 | Ideal 5–30 (ICP); parcial 3–4 o 31–50 |
 * | cityKnown         |     10 | Ciudad canónica del área Valencia ~30 km |
 * | statusProgress    |     15 | Avance en pipeline (Descartado = 0) |
 */

export const SCORE_WEIGHTS = {
  hasEmail: 20,
  hasPhone: 15,
  hasWeb: 10,
  hasLinkedIn: 10,
  employeeRangeFit: 20,
  cityKnown: 10,
  statusProgress: 15,
} as const;

export type ScoreFactor = keyof typeof SCORE_WEIGHTS;

export type ScoreBreakdown = Record<ScoreFactor, number>;

export interface LeadScoreResult {
  total: number;
  breakdown: ScoreBreakdown;
}

type Scorer = (lead: Lead) => number;

const KNOWN_CITY_SET = new Set(CANONICAL_CITIES);

/** Pipeline order excluding Descartado for progress scoring. */
const PROGRESS_STATUSES: LeadStatus[] = LEAD_STATUSES.filter(
  (s) => s !== "Descartado",
);

function hasAnyEmail(lead: Lead): boolean {
  return Boolean(
    lead.email?.trim() ||
      lead.emailCommercial?.trim() ||
      lead.emailManager?.trim(),
  );
}

export const scorers: Record<ScoreFactor, Scorer> = {
  hasEmail: (lead) => (hasAnyEmail(lead) ? SCORE_WEIGHTS.hasEmail : 0),

  hasPhone: (lead) =>
    lead.phone?.trim() ? SCORE_WEIGHTS.hasPhone : 0,

  hasWeb: (lead) => (lead.website?.trim() ? SCORE_WEIGHTS.hasWeb : 0),

  hasLinkedIn: (lead) =>
    lead.linkedin?.trim() ? SCORE_WEIGHTS.hasLinkedIn : 0,

  employeeRangeFit: (lead) => {
    const n = lead.employees;
    if (n == null || Number.isNaN(n) || n < 0) return 0;
    // Ideal ICP band (strategic notes: 5–30)
    if (n >= 5 && n <= 30) return SCORE_WEIGHTS.employeeRangeFit;
    // Near band (n8n 3–10 lower edge / slightly larger firms)
    if ((n >= 3 && n <= 4) || (n >= 31 && n <= 50)) {
      return Math.round(SCORE_WEIGHTS.employeeRangeFit / 2);
    }
    return 0;
  },

  cityKnown: (lead) => {
    const city = lead.cityCanonical?.trim();
    if (!city) return 0;
    return KNOWN_CITY_SET.has(city) ? SCORE_WEIGHTS.cityKnown : 0;
  },

  statusProgress: (lead) => {
    if (lead.status === "Descartado") return 0;
    const idx = PROGRESS_STATUSES.indexOf(lead.status);
    if (idx < 0) return 0;
    const maxIdx = PROGRESS_STATUSES.length - 1;
    // Nuevo → fraction; Cliente → full weight
    return Math.round((idx / maxIdx) * SCORE_WEIGHTS.statusProgress);
  },
};

export function scoreLead(lead: Lead): LeadScoreResult {
  const breakdown = {} as ScoreBreakdown;
  let total = 0;
  for (const key of Object.keys(SCORE_WEIGHTS) as ScoreFactor[]) {
    const points = scorers[key](lead);
    breakdown[key] = points;
    total += points;
  }
  // Clamp for safety (weights already sum to 100)
  total = Math.max(0, Math.min(100, total));
  return { total, breakdown };
}

/** Sum of declared weights (should be 100). */
export function scoreWeightsTotal(): number {
  return (Object.values(SCORE_WEIGHTS) as number[]).reduce((a, b) => a + b, 0);
}
