/** Convert Notion/n8n HTML-ish email drafts to plain text. */
export function htmlEmailToPlain(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/\\\[/g, "[")
    .replace(/\\\]/g, "]")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const OBSERVACIONES_SOFT_LIMIT = 1800;
export const OBSERVACIONES_HARD_LIMIT = 2000;

export function splitNotes(full: string): {
  observaciones: string;
  overflow: string | null;
} {
  if (full.length <= OBSERVACIONES_HARD_LIMIT) {
    return { observaciones: full, overflow: null };
  }
  return {
    observaciones: full.slice(0, OBSERVACIONES_HARD_LIMIT),
    overflow: full.slice(OBSERVACIONES_HARD_LIMIT),
  };
}

export function combineNotes(
  observaciones: string | null,
  overflow: string | null,
): string {
  return [observaciones ?? "", overflow ?? ""].filter(Boolean).join("");
}

export function domainFromUrl(url: string | null | undefined): string {
  if (!url) return "";
  try {
    const u = new URL(url.includes("://") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0].toLowerCase();
  }
}
