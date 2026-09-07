"use client";

import { useEffect, useState } from "react";
import {
  X,
  ExternalLink,
  Link2,
  MapPin,
  Mail,
  Phone,
  Copy,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmailEditor } from "@/components/leads/email-editor";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/domain/lead";
import {
  OBSERVACIONES_SOFT_LIMIT,
  combineNotes,
} from "@/lib/utils/email-plain";
import { pickLeadEmail } from "@/lib/utils/gmail-compose";
import { statusColor, useUiStore } from "@/store/ui-store";
import { toastAutomationDispatch } from "@/components/automations/toast-dispatch";

function copy(text: string, label: string) {
  void navigator.clipboard.writeText(text);
  toast.success(`${label} copiado`);
}

export function LeadDrawer() {
  const {
    selectedLeadId,
    setSelectedLeadId,
    leads,
    upsertLead,
    removeLead,
  } = useUiStore();

  if (!selectedLeadId) return null;

  return (
    <LeadDrawerBody
      key={selectedLeadId}
      selectedLeadId={selectedLeadId}
      setSelectedLeadId={setSelectedLeadId}
      leads={leads}
      upsertLead={upsertLead}
      removeLead={removeLead}
    />
  );
}

function LeadDrawerBody({
  selectedLeadId,
  setSelectedLeadId,
  leads,
  upsertLead,
  removeLead,
}: {
  selectedLeadId: string;
  setSelectedLeadId: (id: string | null) => void;
  leads: Lead[];
  upsertLead: (lead: Lead) => void;
  removeLead: (id: string) => void;
}) {
  const base = leads.find((l) => l.id === selectedLeadId) ?? null;
  const [lead, setLead] = useState<Lead | null>(base);
  const [notes, setNotes] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [activity, setActivity] = useState<
    { at: string; type: string; message: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/leads/${selectedLeadId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error");
        if (cancelled) return;
        setLead(data.lead);
        setNotes(
          combineNotes(data.lead.notes, data.lead.notesOverflow),
        );
        setEmailSubject(data.lead.emailSubject ?? "");
        setEmailBody(data.lead.emailBody ?? "");
        setActivity(data.activity ?? []);
        upsertLead(data.lead);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedLeadId, upsertLead]);

  async function savePatch(patch: Partial<Lead>) {
    if (!lead) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setLead(data.lead);
      upsertLead(data.lead);
      toast.success("Guardado");
      toastAutomationDispatch(data.automation);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    if (!lead) return;
    try {
      const res = await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al archivar");
      removeLead(lead.id);
      setConfirmArchive(false);
      toast.success("Lead archivado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  const mapsUrl = lead?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}`
    : null;

  return (
    <>
      <aside className="flex h-full w-[420px] shrink-0 flex-col border-l border-[var(--border)] bg-[var(--panel)]">
        <div className="flex h-12 items-center justify-between border-b border-[var(--border)] px-3">
          <span className="truncate text-sm font-semibold">
            {lead?.companyName ?? "Lead"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedLeadId(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading && !lead ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded bg-[var(--muted)]"
              />
            ))}
          </div>
        ) : lead ? (
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
            <div className="flex flex-wrap gap-1">
              {lead.website && (
                <Action
                  href={lead.website}
                  icon={ExternalLink}
                  tip="Web"
                />
              )}
              {lead.linkedin && (
                <Action href={lead.linkedin} icon={Link2} tip="LinkedIn" />
              )}
              {mapsUrl && (
                <Action href={mapsUrl} icon={MapPin} tip="Google Maps" />
              )}
              {lead.email && (
                <Action
                  href={`mailto:${lead.email}`}
                  icon={Mail}
                  tip="Email"
                />
              )}
              {lead.email && (
                <Button
                  variant="outline"
                  size="icon"
                  title="Copiar email"
                  onClick={() => copy(lead.email!, "Email")}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              )}
              {lead.phone && (
                <Button
                  variant="outline"
                  size="icon"
                  title="Copiar teléfono"
                  onClick={() => copy(lead.phone!, "Teléfono")}
                >
                  <Phone className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                title="Favorito"
                onClick={() => savePatch({ favorite: !lead.favorite })}
              >
                <Star
                  className={`h-3.5 w-3.5 ${lead.favorite ? "fill-amber-400 text-amber-400" : ""}`}
                />
              </Button>
              <Button
                variant="outline"
                size="icon"
                title="Archivar"
                onClick={() => setConfirmArchive(true)}
              >
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
              </Button>
            </div>

            <Section title="Empresa">
              <Field label="Nombre" value={lead.companyName} />
              <Field label="Web" value={lead.website} />
              <Field label="Dirección" value={lead.address} />
              <Field
                label="Ciudad"
                value={lead.cityCanonical ?? lead.city}
              />
              <Field label="Provincia" value={lead.province} />
              <Field label="CP" value={lead.postalCode} />
              <Field label="Empleados" value={lead.employees?.toString()} />
              <Field label="Servicios" value={lead.services.join(", ")} />
              <Field label="Software" value={lead.software} />
            </Section>

            <Section title="Contacto">
              <Field label="Email" value={lead.email} />
              <Field label="Comercial" value={lead.emailCommercial} />
              <Field label="Gerente email" value={lead.emailManager} />
              <Field label="Teléfono" value={lead.phone} />
              <Field label="LinkedIn" value={lead.linkedin} />
              <Field label="Gerente" value={lead.manager} />
              <Field label="Cargo" value={lead.role} />
            </Section>

            <Section title="CRM">
              <label className="block text-[11px] text-[var(--muted-fg)]">
                Estado
              </label>
              <select
                className={`mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-sm ${statusColor(lead.status)}`}
                value={lead.status}
                disabled={saving}
                onChange={(e) =>
                  savePatch({ status: e.target.value as LeadStatus })
                }
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Field label="Score" value={lead.score?.toString()} />
              <Field label="Confianza" value={lead.confidence} />
              <Field label="Origen" value={lead.source} />
              <Field
                label="Creación"
                value={lead.createdAt?.slice(0, 10)}
              />
              <Field
                label="Última actividad"
                value={lead.lastActivity?.slice(0, 10)}
              />
              <Field
                label="Próximo seguimiento"
                value={lead.nextFollowUp?.slice(0, 10)}
              />
            </Section>

            <Section title="Notas">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
              />
              {notes.length >= OBSERVACIONES_SOFT_LIMIT && (
                <p className="mt-1 text-[11px] text-amber-400">
                  Cerca del límite Notion (~2000). El excedente se guarda en el
                  cuerpo de la página.
                </p>
              )}
              <Button
                className="mt-2"
                size="sm"
                disabled={saving}
                onClick={() => savePatch({ notes })}
              >
                Guardar notas
              </Button>
            </Section>

            <Section title="Email preparado">
              <EmailEditor
                subject={emailSubject}
                body={emailBody}
                to={pickLeadEmail(lead)}
                onSubjectChange={setEmailSubject}
                onBodyChange={setEmailBody}
                saving={saving}
                onSave={() =>
                  void savePatch({
                    emailSubject,
                    emailBody,
                  })
                }
                onCopy={() =>
                  copy(`${emailSubject}\n\n${emailBody}`, "Email")
                }
                onMarkPrepared={() =>
                  void savePatch({
                    emailSubject,
                    emailBody,
                    status: "Email preparado",
                  })
                }
              />
            </Section>

            {lead.aiAnalysis && (
              <Section title="Análisis IA">
                <pre className="whitespace-pre-wrap text-[12px] text-[var(--muted-fg)]">
                  {lead.aiAnalysis}
                </pre>
              </Section>
            )}

            <Section title="Actividad">
              {activity.length === 0 ? (
                <p className="text-[12px] text-[var(--muted-fg)]">
                  Sin eventos todavía.
                </p>
              ) : (
                <ul className="space-y-2">
                  {activity.map((a, i) => (
                    <li
                      key={`${a.at}-${i}`}
                      className="border-l-2 border-[var(--border)] pl-2 text-[12px]"
                    >
                      <div className="text-[10px] text-[var(--muted-fg)]">
                        {a.at ? new Date(a.at).toLocaleString("es-ES") : ""} ·{" "}
                        {a.type}
                      </div>
                      <div>{a.message}</div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        ) : (
          <p className="p-4 text-[var(--muted-fg)]">Lead no encontrado</p>
        )}
      </aside>

      <Dialog open={confirmArchive} onOpenChange={setConfirmArchive}>
        <DialogContent>
          <DialogTitle>Archivar lead</DialogTitle>
          <DialogDescription>
            Se archivará en Notion (no se elimina). Podrás usarlo para control
            de duplicados.
          </DialogDescription>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmArchive(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={archive}>
              Archivar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2 text-[12.5px]">
      <span className="text-[var(--muted-fg)]">{label}</span>
      <span className="break-words text-[var(--fg)]">{value || "—"}</span>
    </div>
  );
}

function Action({
  href,
  icon: Icon,
  tip,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tip: string;
}) {
  return (
    <Button variant="outline" size="icon" asChild title={tip}>
      <a href={href} target="_blank" rel="noreferrer">
        <Icon className="h-3.5 w-3.5" />
      </a>
    </Button>
  );
}
