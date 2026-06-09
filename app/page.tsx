"use client";

import { useRouter } from "next/navigation";
import { usePreferences, type Language } from "@/lib/preferences";
import { Wordmark } from "@/components/wordmark";

const LANGS: { value: Language; label: string }[] = [
  { value: "cs", label: "CS" },
  { value: "sk", label: "SK" },
  { value: "en", label: "EN" },
];

export default function LoginPage() {
  const router = useRouter();
  const { prefs, update, reset, loaded } = usePreferences();
  if (!loaded) return null;

  return (
    <main className="flex min-h-screen flex-col bg-bg">
      <div className="flex justify-end p-6">
        <div className="flex items-center gap-1 font-mono text-[11px] tracking-[0.04em]">
          {LANGS.map((l, i) => (
            <span key={l.value} className="flex items-center gap-1">
              <button
                onClick={() => update({ language: l.value })}
                className={
                  prefs.language === l.value
                    ? "text-brand"
                    : "text-ink-4 hover:text-ink-2"
                }
              >
                {l.label}
              </button>
              {i < LANGS.length - 1 && <span className="text-ink-4">/</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <Wordmark className="text-5xl" />
        <h1 className="mt-8 font-display text-2xl font-medium text-ink">
          Tichý ranní brief.
        </h1>
        <p className="mt-2 font-sans text-[15px] text-ink-3">
          Z českého, slovenského i světového tisku. Každé ráno v 7:00.
        </p>

        <button
          onClick={() => router.push(prefs.completed ? "/brief" : "/onboarding")}
          className="mt-10 rounded-full bg-brand px-8 py-3 font-sans text-[15px] font-medium text-white transition-opacity hover:opacity-90"
        >
          Vstoupit
        </button>

        <button
          onClick={() => reset()}
          className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-4 transition-colors hover:text-ink-2"
        >
          Resetovat demo
        </button>
      </div>

      <div className="p-6 text-center font-mono text-[10px] tracking-[0.06em] text-ink-4">
        Demo verze · 15.05.2026 · shrn.to
      </div>
    </main>
  );
}