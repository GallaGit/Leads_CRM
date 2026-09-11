import type { Lead, LeadPatch } from "@/lib/domain/lead";

/** Fields that may be filled from the archived lead into empty slots on the keeper. */
export const MERGEABLE_FIELD_KEYS = [
  "companyName",
  "website",
  "email",
  "emailCommercial",
  "emailManager",
  "phone",
  "address",
  "postalCode",
  "city",
  "province",
  "employees",
  "linkedin",
  "services",
  "notes",
  "emailSubject",
  "emailBody",
  "score",
  "manager",
  "role",
  "confidence",
  "software",
  "source",
  "lastContact",
  "nextFollowUp",
  "aiAnalysis",
] as const satisfies readonly (keyof LeadPatch)[];

export type MergeableFieldKey = (typeof MERGEABLE_FIELD_KEYS)[number];

export const MERGEABLE_FIELD_LABELS: Record<MergeableFieldKey, string> = {
  companyName: "Empresa",
  website: "Web",
  email: "Email",
  emailCommercial: "Email comercial",
  emailManager: "Email gerente",
  phone: "Teléfono",
  address: "Dirección",
  postalCode: "CP",
  city: "Ciudad",
  province: "Provincia",
  employees: "Empleados",
  linkedin: "LinkedIn",
  services: "Servicios",
  notes: "Observaciones",
  emailSubject: "Asunto email",
  emailBody: "Cuerpo email",
  score: "Score",
  manager: "Gerente",
  role: "Cargo",
  confidence: "Confianza",
  software: "Software",
  source: "Origen",
  lastContact: "Último contacto",
  nextFollowUp: "Próximo seguimiento",
  aiAnalysis: "Análisis IA",
};

export function isMergeFieldEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function formatMergeFieldValue(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string") {
    const t = value.trim();
    return t || "—";
  }
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "—";
  }
  return String(value);
}

export interface MergeFieldPreview {
  key: MergeableFieldKey;
  label: string;
  keepValue: string;
  archiveValue: string;
  /** True when the keeper slot is empty and the other lead has a value to copy. */
  willFill: boolean;
}

export interface EmptyFieldMergeResult {
  patch: LeadPatch;
  filledKeys: MergeableFieldKey[];
  preview: MergeFieldPreview[];
}

/**
 * Build a patch that only fills EMPTY fields on `keep` from `from`.
 * Never overwrites existing values (DECISIONES #9).
 */
export function buildEmptyFieldMerge(
  keep: Pick<Lead, MergeableFieldKey>,
  from: Pick<Lead, MergeableFieldKey>,
): EmptyFieldMergeResult {
  const patch: LeadPatch = {};
  const filledKeys: MergeableFieldKey[] = [];
  const preview: MergeFieldPreview[] = [];

  for (const key of MERGEABLE_FIELD_KEYS) {
    const keepRaw = keep[key];
    const fromRaw = from[key];
    const keepEmpty = isMergeFieldEmpty(keepRaw);
    const fromEmpty = isMergeFieldEmpty(fromRaw);
    const willFill = keepEmpty && !fromEmpty;

    preview.push({
      key,
      label: MERGEABLE_FIELD_LABELS[key],
      keepValue: formatMergeFieldValue(keepRaw),
      archiveValue: formatMergeFieldValue(fromRaw),
      willFill,
    });

    if (willFill) {
      (patch as Record<string, unknown>)[key] = fromRaw;
      filledKeys.push(key);
    }
  }

  return { patch, filledKeys, preview };
}

/** Stub for test compatibility - merges leads keeping the first as base. */
export async function mergeLeads(
  keepId: string,
  archiveId: string,
): Promise<{ lead: Lead; filledKeys: MergeableFieldKey[] }> {
  // Implementation would go here
  throw new Error("Not implemented");
}

/** Stub for test compatibility - computes merge preview without applying. */
export function computeMergePreview(
  keep: Pick<Lead, MergeableFieldKey>,
  from: Pick<Lead, MergeableFieldKey>,
): EmptyFieldMergeResult {
  return buildEmptyFieldMerge(keep, from);
}
