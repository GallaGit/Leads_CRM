"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import {
  CONFIDENCE_LEVELS,
  PROVINCES,
  SERVICES,
  type Lead,
  type LeadCreateInput,
} from "@/lib/domain/lead";
import {
  findLocalDuplicates,
  validateLeadCreate,
  type LeadCreateErrors,
} from "@/lib/leads/validate-lead";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { toastAutomationDispatch } from "@/components/automations/toast-dispatch";

const emptyForm: LeadCreateInput = {
  companyName: "",
  website: "",
  email: "",
  emailCommercial: "",
  emailManager: "",
  phone: "",
  address: "",
  postalCode: "",
  city: "",
  province: null,
  employees: null,
  linkedin: "",
  services: [],
  manager: "",
  role: "",
  confidence: null,
  software: "",
  notes: "",
  favorite: false,
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-0.5 text-[11px] text-red-400">{message}</p>;
}

function Label({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-[11px] font-medium text-[var(--muted-fg)]"
    >
      {children}
      {required ? <span className="text-red-400"> *</span> : null}
    </label>
  );
}

export function CreateLeadDialog() {
  const { leads, upsertLead, setSelectedLeadId } = useUiStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LeadCreateInput>(emptyForm);
  const [errors, setErrors] = useState<LeadCreateErrors>({});
  const [saving, setSaving] = useState(false);
  const [forceDuplicate, setForceDuplicate] = useState(false);

  const duplicates = useMemo(
    () =>
      findLocalDuplicates(
        {
          email: form.email || null,
          phone: form.phone || null,
          website: form.website || null,
        },
        leads,
      ),
    [form.email, form.phone, form.website, leads],
  );

  function setField<K extends keyof LeadCreateInput>(
    key: K,
    value: LeadCreateInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      delete next._form;
      return next;
    });
    setForceDuplicate(false);
  }

  function toggleService(name: string) {
    const cur = form.services ?? [];
    setField(
      "services",
      cur.includes(name) ? cur.filter((s) => s !== name) : [...cur, name],
    );
  }

  function reset() {
    setForm(emptyForm);
    setErrors({});
    setSaving(false);
    setForceDuplicate(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = validateLeadCreate(form);
    if (!result.ok || !result.value) {
      setErrors(result.errors);
      toast.error("Revisa los campos del formulario");
      return;
    }

    if (duplicates.length > 0 && !forceDuplicate) {
      setErrors({
        _form: `Posible duplicado: ${duplicates
          .map((d) => `${d.companyName} (${d.reason})`)
          .join("; ")}. Confirma para crear igual.`,
      });
      setForceDuplicate(true);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.value),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        throw new Error(data.error || "No se pudo crear el lead");
      }
      const lead = data.lead as Lead;
      upsertLead(lead);
      setSelectedLeadId(lead.id);
      toast.success(`Lead creado: ${lead.companyName}`);
      toastAutomationDispatch(data.automation);
      setOpen(false);
      reset();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al crear el lead";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" />
          Nuevo lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogTitle>Nuevo lead</DialogTitle>
        <DialogDescription>
          Alta manual en Notion. Estado inicial: Nuevo · Origen: Manual.
        </DialogDescription>

        <form onSubmit={onSubmit} className="mt-3 space-y-4" noValidate>
          {errors._form ? (
            <div
              className={cn(
                "rounded-md border px-3 py-2 text-xs",
                forceDuplicate
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                  : "border-red-500/40 bg-red-500/10 text-red-300",
              )}
            >
              {errors._form}
              {forceDuplicate ? (
                <p className="mt-1 text-[11px] opacity-80">
                  Pulsa otra vez «Crear lead» para confirmar.
                </p>
              ) : null}
            </div>
          ) : null}

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
              Empresa
            </h3>
            <div>
              <Label htmlFor="companyName" required>
                Empresa
              </Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => setField("companyName", e.target.value)}
                aria-invalid={Boolean(errors.companyName)}
              />
              <FieldError message={errors.companyName} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="website">Web</Label>
                <Input
                  id="website"
                  placeholder="ejemplo.es"
                  value={form.website ?? ""}
                  onChange={(e) => setField("website", e.target.value)}
                />
                <FieldError message={errors.website} />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={form.linkedin ?? ""}
                  onChange={(e) => setField("linkedin", e.target.value)}
                />
                <FieldError message={errors.linkedin} />
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
              Contacto
            </h3>
            <p className="text-[11px] text-[var(--muted-fg)]">
              Obligatorio: correo general, teléfono o web.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="email">Correo general</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => setField("email", e.target.value)}
                />
                <FieldError message={errors.email} />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={form.phone ?? ""}
                  onChange={(e) => setField("phone", e.target.value)}
                />
                <FieldError message={errors.phone} />
              </div>
              <div>
                <Label htmlFor="emailCommercial">Correo comercial</Label>
                <Input
                  id="emailCommercial"
                  type="email"
                  value={form.emailCommercial ?? ""}
                  onChange={(e) => setField("emailCommercial", e.target.value)}
                />
                <FieldError message={errors.emailCommercial} />
              </div>
              <div>
                <Label htmlFor="emailManager">Correo gerente</Label>
                <Input
                  id="emailManager"
                  type="email"
                  value={form.emailManager ?? ""}
                  onChange={(e) => setField("emailManager", e.target.value)}
                />
                <FieldError message={errors.emailManager} />
              </div>
              <div>
                <Label htmlFor="manager">Gerente</Label>
                <Input
                  id="manager"
                  value={form.manager ?? ""}
                  onChange={(e) => setField("manager", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="role">Cargo</Label>
                <Input
                  id="role"
                  value={form.role ?? ""}
                  onChange={(e) => setField("role", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
              Ubicación
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="province">Provincia</Label>
                <select
                  id="province"
                  className="flex h-8 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 text-sm"
                  value={form.province ?? ""}
                  onChange={(e) =>
                    setField("province", e.target.value || null)
                  }
                >
                  <option value="">—</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.province} />
              </div>
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={form.city ?? ""}
                  onChange={(e) => setField("city", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="postalCode">CP</Label>
                <Input
                  id="postalCode"
                  value={form.postalCode ?? ""}
                  onChange={(e) => setField("postalCode", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="employees">Empleados</Label>
                <Input
                  id="employees"
                  type="number"
                  min={0}
                  step={1}
                  value={form.employees ?? ""}
                  onChange={(e) =>
                    setField(
                      "employees",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                />
                <FieldError message={errors.employees} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={form.address ?? ""}
                onChange={(e) => setField("address", e.target.value)}
              />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
              CRM
            </h3>
            <div>
              <Label>Servicios</Label>
              <div className="flex flex-wrap gap-1.5">
                {SERVICES.map((s) => {
                  const active = form.services?.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px]",
                        active
                          ? "border-[var(--accent)] bg-[var(--accent)]/15"
                          : "border-[var(--border)] text-[var(--muted-fg)]",
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <FieldError message={errors.services} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="confidence">Confianza</Label>
                <select
                  id="confidence"
                  className="flex h-8 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 text-sm"
                  value={form.confidence ?? ""}
                  onChange={(e) =>
                    setField("confidence", e.target.value || null)
                  }
                >
                  <option value="">—</option>
                  {CONFIDENCE_LEVELS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.confidence} />
              </div>
              <div>
                <Label htmlFor="software">Software</Label>
                <Input
                  id="software"
                  value={form.software ?? ""}
                  onChange={(e) => setField("software", e.target.value)}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form.favorite)}
                onChange={(e) => setField("favorite", e.target.checked)}
              />
              Favorito
            </label>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
              Notas
            </h3>
            <Textarea
              id="notes"
              value={form.notes ?? ""}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Observaciones…"
            />
          </section>

          <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-3">
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Creando…"
                : forceDuplicate
                  ? "Crear de todos modos"
                  : "Crear lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
