export type OutreachContext = {
  empresa: string;
  gerente?: string | null;
  ciudad?: string | null;
};

export const OUTREACH_V1_ID = "outreach-v1" as const;

export function buildSubject(ctx: OutreachContext): string {
  return `Automatización e IA para ${ctx.empresa}`;
}

export function buildBody(ctx: OutreachContext): string {
  const name = ctx.gerente?.trim() || "equipo";
  const place = ctx.ciudad?.trim()
    ? ` en ${ctx.ciudad.trim()}`
    : "";
  return [
    `Hola ${name},`,
    "",
    `He visto ${ctx.empresa}${place} y creo que podéis ganar tiempo en tareas repetitivas (documentos, seguimiento y atención) con automatización e IA, sin sustituir vuestro software fiscal.`,
    "",
    "¿Te vendría bien una llamada breve de 15 minutos para ver un caso concreto?",
    "",
    "Saludos,",
    "Ociel Gallardo",
  ].join("\n");
}

export const outreachV1 = {
  id: OUTREACH_V1_ID,
  buildSubject,
  buildBody,
};
