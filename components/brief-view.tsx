"use client";

import type { Brief } from "@/lib/brief";
import { usePreferences } from "@/lib/preferences";
import { BriefHero } from "@/components/brief-hero";
import { RubrikaSection } from "@/components/rubrika-section";
import { SegControl } from "@/components/seg-control";

export function BriefView({ brief }: { brief: Brief }) {
  const { prefs, update, loaded } = usePreferences();
  if (!loaded) return null;

  const length = prefs.length;

  const rubriky = brief.rubriky.map((r) => ({
    ...r,
    items: length === "short" ? r.items.slice(0, 1) : r.items,
  }));

  return (
    <>
      <BriefHero brief={brief} />

      <div className="mt-8">
        <SegControl
          value={length}
          onChange={(v) => update({ length: v })}
          options={[
            { value: "short", label: "Krátký" },
            { value: "long", label: "Delší" },
          ]}
        />
      </div>

      <div className="mt-8 flex flex-col gap-8">
        {rubriky.map((r) => (
          <RubrikaSection key={r.id} rubrika={r} />
        ))}
      </div>
    </>
  );
}