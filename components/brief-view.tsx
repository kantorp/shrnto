"use client";

import { useState } from "react";
import type { Brief } from "@/lib/brief";
import { BriefHero } from "@/components/brief-hero";
import { RubrikaSection } from "@/components/rubrika-section";

type Length = "short" | "long";

export function BriefView({ brief }: { brief: Brief }) {
  const [length, setLength] = useState<Length>("long");

  const rubriky = brief.rubriky.map((r) => ({
    ...r,
    items: length === "short" ? r.items.slice(0, 1) : r.items,
  }));

  return (
    <>
      <BriefHero brief={brief} />

      <div className="mt-8 flex items-center gap-1 rounded-full border border-divider bg-surface p-1 w-fit">
        {(["short", "long"] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setLength(opt)}
            className={
              "rounded-full px-3 py-1 font-mono text-[11px] tracking-[0.04em] transition-colors " +
              (length === opt
                ? "bg-brand text-white"
                : "text-ink-3 hover:text-ink")
            }
          >
            {opt === "short" ? "Krátký" : "Delší"}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-8">
        {rubriky.map((r) => (
          <RubrikaSection key={r.id} rubrika={r} />
        ))}
      </div>
    </>
  );
}