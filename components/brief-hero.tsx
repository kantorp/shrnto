"use client";

import type { Brief } from "@/lib/brief";
import { useT } from "@/lib/i18n";

export function BriefHero({ brief }: { brief: Brief }) {
  const t = useT();
  return (
    <header className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft font-mono text-xs font-medium tracking-wide text-brand-deep">
          {brief.avatar}
        </span>
        <div className="flex flex-col">
          <h1 className="font-display text-2xl font-medium tracking-[-0.01em] text-ink">
            {brief.greeting}
          </h1>
          <p className="font-mono text-[11px] tracking-[0.03em] text-ink-3">
            {brief.dateline}
          </p>
        </div>
      </div>

      <div className="border-l-2 border-brand pl-4">
        <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-brand">
          {t.brief.spotlightLabel}
        </p>
        <p className="font-display text-lg leading-relaxed text-ink-2">
          {brief.spotlight}
        </p>
      </div>
    </header>
  );
}