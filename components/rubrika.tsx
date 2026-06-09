"use client";

import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export type RubrikaId = "ekonomika" | "politika" | "nazory";

export function Rubrika({ id, className }: { id: RubrikaId; className?: string }) {
  const t = useT();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
      {t.rubriky[id]}
    </span>
  );
}