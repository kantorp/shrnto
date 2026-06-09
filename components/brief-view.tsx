"use client";

import { useState, useEffect } from "react";
import type { Brief } from "@/lib/brief";
import { usePreferences } from "@/lib/preferences";
import { BriefHero } from "@/components/brief-hero";
import { RubrikaSection } from "@/components/rubrika-section";

const CACHE_PREFIX = "shrnto.brief.";

export function BriefView({ fallback }: { fallback: Brief }) {
  const { prefs, loaded } = usePreferences();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loaded) return;

    const sourcesKey = [...prefs.sources].sort().join(",");

    if (sourcesKey === "cz,sk,svet" && prefs.language === "cs") {
      setBrief(fallback);
      return;
    }

    const cacheKey = `${CACHE_PREFIX}${sourcesKey}.${prefs.language}`;
    try {
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) {
        setBrief(JSON.parse(cached));
        return;
      }
    } catch {}

    setLoading(true);
    fetch(`/api/brief?sources=${sourcesKey}&language=${prefs.language}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Brief) => {
        setBrief(data);
        try {
          window.localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch {}
      })
      .catch(() => setBrief(fallback))
      .finally(() => setLoading(false));
  }, [loaded, prefs.sources, prefs.language, fallback]);

  if (!loaded || (loading && !brief)) {
    return (
      <div className="flex flex-col gap-4 py-12">
        <div className="h-7 w-2/3 animate-pulse rounded bg-divider-soft" />
        <div className="h-4 w-full animate-pulse rounded bg-divider-soft" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-divider-soft" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-divider-soft" />
        <p className="mt-3 font-sans text-sm text-ink-3">Generuji tvůj brief…</p>
      </div>
    );
  }

  const active = brief ?? fallback;
  const rubriky = active.rubriky.map((r) => ({
    ...r,
    stories: prefs.length === "short" ? r.stories.slice(0, 3) : r.stories,
  }));

  return (
    <>
      <BriefHero brief={active} />
      <div className="mt-10 flex flex-col gap-10">
        {rubriky.map((r) => (
          <RubrikaSection key={r.id} rubrika={r} />
        ))}
      </div>
    </>
  );
}