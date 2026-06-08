"use client";

import { useState, useEffect, useCallback } from "react";
import type { Source } from "@/components/src-badge";

export type Region = "cz" | "sk" | "svet";
export type Language = "cs" | "sk" | "en";
export type Length = "short" | "long";

export type Preferences = {
  language: Language;
  sources: Region[];
  length: Length;
};

export const DEFAULT_PREFERENCES: Preferences = {
  language: "cs",
  sources: ["cz", "sk", "svet"],
  length: "long",
};

export const REGION_LABELS: Record<Region, string> = {
  cz: "Český tisk",
  sk: "Slovenský tisk",
  svet: "Svět",
};

// zdroj článku → region (pro filtr briefu podle preferencí)
export function sourceRegion(source: Source): Region {
  if (source === "HN") return "cz";
  if (source === "DenikN_sk") return "sk";
  return "svet"; // FT_online, FT_print, NYT, FAZ
}

const KEY = "shrnto.preferences";

export function loadPreferences(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw
      ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) }
      : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: Preferences) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {}
}

// hook pro čtení + ukládání preferencí (auto-persist do localStorage)
export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPrefs(loadPreferences());
    setLoaded(true);
  }, []);

  const update = useCallback((patch: Partial<Preferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      savePreferences(next);
      return next;
    });
  }, []);

  return { prefs, update, loaded };
}