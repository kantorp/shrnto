"use client";

import { cn } from "@/lib/utils";

export function SegControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex w-fit rounded-[7px] border border-divider bg-surface p-[3px]">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-w-[96px] rounded-[5px] px-[18px] py-2 text-center font-sans text-[13.5px] font-medium transition-all duration-150",
            value === o.value
              ? "bg-surface-elevated text-ink shadow-sm"
              : "text-ink-3 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}