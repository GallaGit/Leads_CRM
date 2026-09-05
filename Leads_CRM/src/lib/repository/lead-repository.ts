import type { Lead, LeadCreateInput, LeadPatch } from "@/lib/domain/lead";

export interface LeadRepository {
  list(options?: { includeArchived?: boolean }): Promise<Lead[]>;
  get(id: string): Promise<Lead | null>;
  create(input: LeadCreateInput): Promise<Lead>;
  update(id: string, patch: LeadPatch): Promise<Lead>;
  archive(id: string): Promise<void>;
  appendActivity(
    id: string,
    message: string,
    type?: string,
  ): Promise<void>;
  getActivity(id: string): Promise<{ at: string; type: string; message: string }[]>;
  setNotesOverflow(id: string, overflow: string | null): Promise<void>;
  getNotesOverflow(id: string): Promise<string | null>;
}
