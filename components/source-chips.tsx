"use client";

import { cn } from "@/lib/utils";
import { type Region, REGION_LABELS } from "@/lib/preferences";

const REGIONS: Region[] = ["cz", "sk", "svet"];
const CODES: Record<Region, string> = { cz: "CZ", sk: "SK", svet: "INT" };

export function SourceChips({
  value,
  onChange,
}: {
  value: Region[];
  onChange: (v: Region[]) => void;
}) {
  const toggle = (r: Region) => {
    const has = value.includes(r);
    if (has && value.length === 1) return; // aspoň jeden musí zůstat
    onChange(has ? value.filter((x) => x !== r) : [...value, r]);
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      {REGIONS.map((r) => {
        const selected = value.includes(r);
        return (
          <button
            key={r}
            onClick={() => toggle(r)}
            className={cn(
              "inline-flex min-w-[140px] items-center gap-2.5 rounded-[7px] border bg-surface-elevated px-[14px] py-3 text-left font-sans text-[13.5px] font-medium transition-all duration-150",
              selected
                ? "border-brand bg-brand-faint text-brand-deep"
                : "border-divider text-ink-2",
            )}
          >
            <span
              className={cn(
                "flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded border-[1.5px] transition-all",
                selected ? "border-brand bg-brand text-white" : "border-ink-4",
              )}
            >
              {selected && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </span>
            <span className="flex-1">{REGION_LABELS[r]}</span>
            <span className={cn("font-mono text-[11px] tracking-wide", selected ? "text-brand" : "text-ink-4")}>
              {CODES[r]}
            </span>
          </button>
        );
      })}
    </div>
  );
}