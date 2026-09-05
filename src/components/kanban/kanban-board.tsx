"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { useEnsureLeadsSynced } from "@/hooks/use-ensure-leads-synced";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/domain/lead";
import { statusColor, useUiStore } from "@/store/ui-store";

async function patchStatus(id: string, status: LeadStatus): Promise<Lead> {
  const res = await fetch(`/api/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al actualizar estado");
  return data.lead as Lead;
}

export function KanbanBoard() {
  useEnsureLeadsSynced();
  const router = useRouter();
  const leads = useUiStore((s) => s.leads);
  const upsertLead = useUiStore((s) => s.upsertLead);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<LeadStatus | null>(null);

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(
      LEAD_STATUSES.map((s) => [s, [] as Lead[]]),
    ) as Record<LeadStatus, Lead[]>;
    for (const lead of leads) {
      map[lead.status]?.push(lead);
    }
    return map;
  }, [leads]);

  async function moveLead(leadId: string, status: LeadStatus) {
    const current = leads.find((l) => l.id === leadId);
    if (!current || current.status === status) return;
    const previous = { ...current };
    upsertLead({ ...current, status });
    try {
      const updated = await patchStatus(leadId, status);
      upsertLead(updated);
    } catch (e) {
      upsertLead(previous);
      toast.error(e instanceof Error ? e.message : "Error al mover");
    }
  }

  return (
    <>
      <Topbar title="Kanban" />
      <div className="min-h-0 flex-1 overflow-x-auto p-4">
        <div className="flex h-full min-w-max gap-3">
          {LEAD_STATUSES.map((status) => (
            <div
              key={status}
              className={`flex w-64 shrink-0 flex-col rounded-lg border bg-[var(--panel)] ${
                overStatus === status
                  ? "border-[var(--accent)]"
                  : "border-[var(--border)]"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setOverStatus(status);
              }}
              onDragLeave={() => {
                if (overStatus === status) setOverStatus(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id =
                  e.dataTransfer.getData("text/lead-id") || draggingId;
                setOverStatus(null);
                setDraggingId(null);
                if (id) void moveLead(id, status);
              }}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${statusColor(status)}`}
                >
                  {status}
                </span>
                <span className="text-[11px] tabular-nums text-[var(--muted-fg)]">
                  {byStatus[status].length}
                </span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
                {byStatus[status].map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggingId(lead.id);
                      e.dataTransfer.setData("text/lead-id", lead.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverStatus(null);
                    }}
                    onClick={() => router.push(`/leads?lead=${lead.id}`)}
                    className={`cursor-grab rounded-md border border-[var(--border)] bg-[var(--bg)] p-2 text-left active:cursor-grabbing ${
                      draggingId === lead.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-1">
                      <span className="line-clamp-2 flex-1 text-[12px] font-medium leading-snug">
                        {lead.companyName}
                      </span>
                      {lead.favorite ? (
                        <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                      ) : null}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--muted-fg)]">
                      <span className="truncate">
                        {lead.cityCanonical ?? lead.city ?? "—"}
                      </span>
                      <span className="tabular-nums">
                        {lead.score != null ? lead.score : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
