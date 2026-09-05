/** City normalization for Valencia metro ~30 km (aligned with n8n). */

function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** canonical display name -> aliases */
const CITY_ALIASES: Record<string, string[]> = {
  Valencia: ["valencia", "valència"],
  Castellón: ["castellon", "castello", "castellón", "castelló"],
  Sagunto: ["sagunto", "sagunt"],
  Mislata: ["mislata"],
  Xirivella: ["xirivella"],
  Torrent: ["torrent"],
  Paterna: ["paterna"],
  Manises: ["manises"],
  Burjassot: ["burjassot"],
  Alboraya: ["alboraya", "alboraia"],
  Catarroja: ["catarroja"],
  Silla: ["silla"],
  Aldaia: ["aldaia", "aldaya"],
  Paiporta: ["paiporta"],
  Godella: ["godella"],
  Moncada: ["moncada", "montcada"],
  Picassent: ["picassent"],
  "El Puig": ["el puig", "puig"],
};

const ALIAS_TO_CANONICAL = new Map<string, string>();
for (const [canonical, aliases] of Object.entries(CITY_ALIASES)) {
  ALIAS_TO_CANONICAL.set(fold(canonical), canonical);
  for (const a of aliases) {
    ALIAS_TO_CANONICAL.set(fold(a), canonical);
  }
}

export const CANONICAL_CITIES = Object.keys(CITY_ALIASES).sort((a, b) =>
  a.localeCompare(b, "es"),
);

export function canonicalizeCity(
  raw: string | null | undefined,
): string | null {
  if (!raw?.trim()) return null;
  const key = fold(raw);
  const exact = ALIAS_TO_CANONICAL.get(key);
  if (exact) return exact;
  for (const [alias, canonical] of ALIAS_TO_CANONICAL) {
    if (key.includes(alias) || alias.includes(key)) return canonical;
  }
  return raw.trim();
}

export function citiesEqual(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const ca = canonicalizeCity(a);
  const cb = canonicalizeCity(b);
  if (!ca || !cb) return false;
  return fold(ca) === fold(cb);
}
