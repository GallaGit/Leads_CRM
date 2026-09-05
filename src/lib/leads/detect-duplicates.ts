import type { Lead, LeadStatus } from "@/lib/domain/lead";
import { domainFromUrl } from "@/lib/utils/email-plain";

export const DUPLICATE_REASON_CODES = [
  "email",
  "phone",
  "domain",
  "name",
  "address",
] as const;

export type DuplicateReasonCode = (typeof DUPLICATE_REASON_CODES)[number];

export const DUPLICATE_REASON_LABELS: Record<DuplicateReasonCode, string> = {
  email: "mismo email",
  phone: "mismo teléfono",
  domain: "mismo dominio web",
  name: "nombre similar",
  address: "dirección similar",
};

export interface DuplicateReason {
  code: DuplicateReasonCode;
  label: string;
  value: string;
}

export interface DuplicateLeadRef {
  id: string;
  companyName: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  status: LeadStatus;
  archived: boolean;
}

export interface DuplicateGroup {
  id: string;
  reasons: DuplicateReason[];
  leads: DuplicateLeadRef[];
}

const PUBLIC_WEB_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "outlook.com",
  "outlook.es",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.es",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "linkedin.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
]);

const LEGAL_NAME_TOKENS = new Set([
  "sl",
  "slu",
  "sa",
  "sc",
  "cb",
  "scp",
  "slne",
  "slp",
  "coop",
  "cooperativa",
  "ltd",
  "ltda",
  "llc",
  "inc",
  "gmbh",
  "sociedad",
  "limitada",
  "anonima",
]);

const GENERIC_COMPANY_NAMES = new Set([
  "asesoria",
  "gestoria",
  "consultoria",
  "empresa",
  "negocio",
  "autonomo",
  "autonomos",
]);

const STREET_STOP_TOKENS = new Set([
  "calle",
  "c",
  "av",
  "avda",
  "avenida",
  "plaza",
  "pl",
  "plza",
  "paseo",
  "pso",
  "carretera",
  "ctra",
  "camino",
  "urb",
  "urbanizacion",
  "ronda",
  "barrio",
  "numero",
  "num",
  "n",
  "no",
  "sn",
]);

export function foldText(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['"`´]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Lowercase, trim, strip +alias. Empty → null. */
export function normalizeEmail(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed.includes("@")) return null;
  const at = trimmed.lastIndexOf("@");
  let local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (!local || !domain) return null;
  const plus = local.indexOf("+");
  if (plus >= 0) local = local.slice(0, plus);
  if (!local) return null;
  return `${local}@${domain}`;
}

/** Digits only; strip ES country code 34 / 0034. Min 7 digits. */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("34") && digits.length >= 11) {
    digits = digits.slice(2);
  }
  if (digits.length < 7) return null;
  return digits;
}

/** Hostname without www; skip empty and public webmail/social hosts. */
export function normalizeDomain(raw: string | null | undefined): string | null {
  const domain = domainFromUrl(raw);
  if (!domain) return null;
  if (PUBLIC_WEB_DOMAINS.has(domain)) return null;
  return domain;
}

/** Fold accents/punctuation and drop Spanish legal-form tokens. */
export function normalizeCompanyName(
  raw: string | null | undefined,
): string | null {
  const folded = foldText(raw);
  if (!folded) return null;
  const tokens = folded
    .split(" ")
    .filter((t) => t && !LEGAL_NAME_TOKENS.has(t));
  const name = tokens.join(" ").trim();
  if (name.length < 5) return null;
  if (GENERIC_COMPANY_NAMES.has(name)) return null;
  return name;
}

function normalizeAddressCore(raw: string | null | undefined): string | null {
  const folded = foldText(raw);
  if (!folded) return null;
  const tokens = folded
    .split(" ")
    .filter((t) => t && !STREET_STOP_TOKENS.has(t));
  const addr = tokens.join(" ").trim();
  if (addr.length < 8) return null;
  return addr;
}

/**
 * Address key: normalized street + CP or city, to avoid matching a lone city.
 */
export function normalizeAddressKey(lead: {
  address: string | null;
  postalCode: string | null;
  city: string | null;
  cityCanonical: string | null;
}): string | null {
  const addr = normalizeAddressCore(lead.address);
  if (!addr) return null;
  const cp = (lead.postalCode ?? "").replace(/\D/g, "").slice(0, 5);
  if (cp.length === 5) return `${addr}|${cp}`;
  const city = foldText(lead.cityCanonical ?? lead.city ?? "");
  if (city.length >= 3) return `${addr}|${city}`;
  return addr.length >= 12 ? addr : null;
}

function emailsOf(lead: Lead): string[] {
  const out: string[] = [];
  for (const raw of [lead.email, lead.emailCommercial, lead.emailManager]) {
    const n = normalizeEmail(raw);
    if (n && !out.includes(n)) out.push(n);
  }
  return out;
}

function toRef(lead: Lead): DuplicateLeadRef {
  return {
    id: lead.id,
    companyName: lead.companyName,
    website: lead.website,
    email: lead.email,
    phone: lead.phone,
    address: lead.address,
    city: lead.cityCanonical ?? lead.city,
    status: lead.status,
    archived: lead.archived,
  };
}

class DisjointSet {
  private parent: number[];
  private rank: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = Array(n).fill(0);
  }

  find(i: number): number {
    let cur = i;
    while (this.parent[cur] !== cur) {
      this.parent[cur] = this.parent[this.parent[cur]];
      cur = this.parent[cur];
    }
    return cur;
  }

  union(a: number, b: number): void {
    let ra = this.find(a);
    let rb = this.find(b);
    if (ra === rb) return;
    if (this.rank[ra] < this.rank[rb]) {
      const tmp = ra;
      ra = rb;
      rb = tmp;
    }
    this.parent[rb] = ra;
    if (this.rank[ra] === this.rank[rb]) this.rank[ra] += 1;
  }
}

interface Bucket {
  key: string;
  code: DuplicateReasonCode;
  indices: number[];
}

function pushIndex(map: Map<string, number[]>, key: string, index: number) {
  const arr = map.get(key);
  if (arr) arr.push(index);
  else map.set(key, [index]);
}

/**
 * Group leads that share email, phone or website domain (solid),
 * or the same normalized company name / address (optional weak signals).
 * Transitive matches form a single group.
 */
export function detectDuplicateGroups(leads: Lead[]): DuplicateGroup[] {
  if (leads.length < 2) return [];

  const byEmail = new Map<string, number[]>();
  const byPhone = new Map<string, number[]>();
  const byDomain = new Map<string, number[]>();
  const byName = new Map<string, number[]>();
  const byAddress = new Map<string, number[]>();

  leads.forEach((lead, index) => {
    for (const email of emailsOf(lead)) {
      pushIndex(byEmail, email, index);
    }
    const phone = normalizePhone(lead.phone);
    if (phone) pushIndex(byPhone, phone, index);
    const domain = normalizeDomain(lead.website);
    if (domain) pushIndex(byDomain, domain, index);
    const name = normalizeCompanyName(lead.companyName);
    if (name) pushIndex(byName, name, index);
    const address = normalizeAddressKey(lead);
    if (address) pushIndex(byAddress, address, index);
  });

  const buckets: Bucket[] = [];
  const collect = (
    map: Map<string, number[]>,
    code: DuplicateReasonCode,
  ) => {
    for (const [key, indices] of map) {
      const unique = [...new Set(indices)];
      if (unique.length > 1) {
        buckets.push({ key, code, indices: unique });
      }
    }
  };
  collect(byEmail, "email");
  collect(byPhone, "phone");
  collect(byDomain, "domain");
  collect(byName, "name");
  collect(byAddress, "address");

  const ds = new DisjointSet(leads.length);
  for (const bucket of buckets) {
    const first = bucket.indices[0];
    for (let i = 1; i < bucket.indices.length; i++) {
      ds.union(first, bucket.indices[i]);
    }
  }

  const memberSets = new Map<number, Set<number>>();
  const reasonMaps = new Map<number, Map<string, DuplicateReason>>();

  const ensure = (root: number) => {
    if (!memberSets.has(root)) memberSets.set(root, new Set());
    if (!reasonMaps.has(root)) reasonMaps.set(root, new Map());
  };

  for (const bucket of buckets) {
    const root = ds.find(bucket.indices[0]);
    ensure(root);
    const members = memberSets.get(root)!;
    for (const idx of bucket.indices) members.add(idx);
    const reasonKey = `${bucket.code}:${bucket.key}`;
    reasonMaps.get(root)!.set(reasonKey, {
      code: bucket.code,
      label: DUPLICATE_REASON_LABELS[bucket.code],
      value: bucket.key,
    });
  }

  const groups: DuplicateGroup[] = [];
  for (const [root, members] of memberSets) {
    if (members.size < 2) continue;
    const ordered = [...members]
      .map((i) => leads[i])
      .sort((a, b) => {
        if (a.archived !== b.archived) return a.archived ? 1 : -1;
        return a.companyName.localeCompare(b.companyName, "es");
      });
    const reasons = [...(reasonMaps.get(root)?.values() ?? [])].sort((a, b) => {
      const order = DUPLICATE_REASON_CODES.indexOf(a.code) - DUPLICATE_REASON_CODES.indexOf(b.code);
      if (order !== 0) return order;
      return a.value.localeCompare(b.value, "es");
    });
    groups.push({
      id: ordered
        .map((l) => l.id)
        .sort()
        .join("|"),
      reasons,
      leads: ordered.map(toRef),
    });
  }

  groups.sort((a, b) => {
    if (b.leads.length !== a.leads.length) return b.leads.length - a.leads.length;
    return (a.leads[0]?.companyName ?? "").localeCompare(
      b.leads[0]?.companyName ?? "",
      "es",
    );
  });

  return groups;
}

export function getDuplicateLeadIds(leads: Lead[]): Set<string> {
  const ids = new Set<string>();
  for (const group of detectDuplicateGroups(leads)) {
    for (const lead of group.leads) ids.add(lead.id);
  }
  return ids;
}