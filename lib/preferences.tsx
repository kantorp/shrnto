"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Source } from "@/components/src-badge";

export type Region = "cz" | "sk" | "svet";
export type Language = "cs" | "en";
export type Length = "short" | "long";

export type Preferences = {
  language: Language;
  sources: Region[];
  length: Length;
  completed: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  language: "cs",
  sources: ["cz", "sk", "svet"],
  length: "long",
  completed: false,
};

export const REGION_LABELS: Record<Region, string> = {
  cz: "Český tisk",
  sk: "Slovenský tisk",
  svet: "Svět",
};

export function sourceRegion(source: Source): Region {
  if (source === "HN") return "cz";
  if (source === "DenikN_sk") return "sk";
  return "svet";
}

const KEY = "shrnto.preferences";

function load(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
    if (parsed.language !== "cs" && parsed.language !== "en") parsed.language = "cs";
    return parsed;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

type Ctx = {
  prefs: Preferences;
  update: (patch: Partial<Preferences>) => void;
  reset: () => void;
  loaded: boolean;
};

const PreferencesContext = createContext<Ctx | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPrefs(load());
    setLoaded(true);
  }, []);

  const update = useCallback((patch: Partial<Preferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {}
    setPrefs(DEFAULT_PREFERENCES);
  }, []);

  return (
    <PreferencesContext.Provider value={{ prefs, update, reset, loaded }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): Ctx {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}