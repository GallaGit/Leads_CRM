/**
 * Open Gmail web compose with prefilled recipient, subject and body.
 * Falls back to mailto: if the window cannot be opened.
 */
export function openGmailCompose(opts: {
  to?: string | null;
  subject: string;
  body: string;
}): void {
  const to = (opts.to ?? "").trim();
  const su = opts.subject.trim();
  const body = opts.body.trim();

  const params = new URLSearchParams();
  params.set("view", "cm");
  params.set("fs", "1");
  if (to) params.set("to", to);
  if (su) params.set("su", su);
  if (body) params.set("body", body);

  const gmailUrl = `https://mail.google.com/mail/?${params.toString()}`;
  const opened = window.open(gmailUrl, "_blank", "noopener,noreferrer");
  if (!opened) {
    const mailtoParams = new URLSearchParams();
    if (su) mailtoParams.set("subject", su);
    if (body) mailtoParams.set("body", body);
    const q = mailtoParams.toString();
    window.location.href = `mailto:${to}${q ? `?${q}` : ""}`;
  }
}

/** Prefer gerente → comercial → general */
export function pickLeadEmail(lead: {
  email?: string | null;
  emailCommercial?: string | null;
  emailManager?: string | null;
}): string | null {
  return (
    lead.emailManager?.trim() ||
    lead.emailCommercial?.trim() ||
    lead.email?.trim() ||
    null
  );
}
