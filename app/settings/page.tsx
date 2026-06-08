"use client";

import Link from "next/link";
import { usePreferences } from "@/lib/preferences";
import { SegControl } from "@/components/seg-control";
import { SourceChips } from "@/components/source-chips";

export default function SettingsPage() {
  const { prefs, update, loaded } = usePreferences();
  if (!loaded) return null;

  return (
    <main className="min-h-screen bg-bg py-12">
      <div className="mx-auto flex max-w-xl flex-col gap-10 px-6">
        <Link
          href="/brief"
          className="inline-flex w-fit items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3 transition-colors hover:text-brand"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Zpět na brief
        </Link>

        <div>
          <h1 className="font-display text-3xl font-medium tracking-[-0.01em] text-ink">
            Nastavení
          </h1>
          <p className="mt-1 font-sans text-[15px] text-ink-3">
            Změny se ukládají automaticky.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
              Jazyk shrnutí
            </div>
            <div className="mt-1 font-sans text-sm text-ink-4">
              Originální články zůstávají v jazyce zdroje.
            </div>
          </div>
          <SegControl
            value={prefs.language}
            onChange={(v) => update({ language: v })}
            options={[
              { value: "cs", label: "Čeština" },
              { value: "sk", label: "Slovenčina" },
              { value: "en", label: "English" },
            ]}
          />
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
              Zdrojové země
            </div>
            <div className="mt-1 font-sans text-sm text-ink-4">
              Z jakého tisku má brief čerpat?
            </div>
          </div>
          <SourceChips value={prefs.sources} onChange={(v) => update({ sources: v })} />
        </section>

        <section className="flex flex-col gap-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
            Délka shrnutí
          </div>
          <SegControl
            value={prefs.length}
            onChange={(v) => update({ length: v })}
            options={[
              { value: "short", label: "Krátký" },
              { value: "long", label: "Delší" },
            ]}
          />
        </section>
      </div>
    </main>
  );
}