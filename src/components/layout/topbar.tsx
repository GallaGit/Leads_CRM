"use client";

import { Moon, Sun, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { syncLeadsFromApi } from "@/hooks/use-ensure-leads-synced";
import { useUiStore } from "@/store/ui-store";

export function Topbar({ title }: { title: string }) {
  const { theme, setTheme, mounted } = useTheme();
  const syncState = useUiStore((s) => s.syncState);
  const lastSyncAt = useUiStore((s) => s.lastSyncAt);
  const syncError = useUiStore((s) => s.syncError);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--panel)] px-4">
      <h1 className="text-sm font-semibold text-[var(--fg)]">{title}</h1>
      <div className="flex items-center gap-2">
        <div className="hidden text-[11px] text-[var(--muted-fg)] sm:block">
          {syncState === "syncing" && "Sincronizando…"}
          {syncState === "error" && (
            <span className="text-red-400">Error: {syncError}</span>
          )}
          {syncState === "idle" && lastSyncAt && (
            <span>
              Última sync:{" "}
              {new Date(lastSyncAt).toLocaleString("es-ES", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void syncLeadsFromApi({ force: true, notifySuccess: true })}
          disabled={syncState === "syncing"}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${syncState === "syncing" ? "animate-spin" : ""}`}
          />
          Sincronizar
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Cambiar tema"
        >
          {!mounted ? (
            <span className="h-4 w-4" />
          ) : theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
