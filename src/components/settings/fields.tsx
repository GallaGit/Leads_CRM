"use client";

import { Input } from "@/components/ui/input";
import { sourceLabel } from "@/lib/settings/catalog";
import type { MaskedField } from "@/lib/settings/types";

export function SecretField({
  id,
  label,
  hint,
  field,
  value,
  onChange,
  placeholder = "Nuevo valor (opcional)",
}: {
  id: string;
  label: string;
  hint?: string;
  field: MaskedField;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-[11px] font-medium text-[var(--muted-fg)]"
      >
        {label}
      </label>
      {field.configured ? (
        <p className="mb-1 text-[11px] text-[var(--muted-fg)]">
          Configurado {field.preview} · origen: {sourceLabel(field.source)}
        </p>
      ) : (
        <p className="mb-1 text-[11px] text-[var(--muted-fg)]">Sin configurar</p>
      )}
      <Input
        id={id}
        type="password"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <p className="mt-1 text-[11px] text-[var(--muted-fg)]">
        {hint ?? "Vacío = no cambiar el secreto actual."}
      </p>
    </div>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-[11px] font-medium text-[var(--muted-fg)]"
      >
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {hint ? (
        <p className="mt-1 text-[11px] text-[var(--muted-fg)]">{hint}</p>
      ) : null}
    </div>
  );
}
