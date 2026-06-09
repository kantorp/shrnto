"use client";

import { useRouter } from "next/navigation";
import { usePreferences } from "@/lib/preferences";
import { Wordmark } from "@/components/wordmark";
import { SegControl } from "@/components/seg-control";
import { SourceChips } from "@/components/source-chips";

export default function OnboardingPage() {
  const router = useRouter();
  const { prefs, update, loaded } = usePreferences();
  if (!loaded) return null;

  return (
    <main className="min-h-screen bg-bg py-12">
      <div className="mx-auto flex max-w-xl flex-col gap-10 px-6">
        <Wordmark className="text-base" />

        <div>
          <h1 className="font-display text-3xl font-medium tracking-[-0.01em] text-ink">
            Vítej.
          </h1>
          <p className="mt-1 font-body text-[15px] text-ink-3">
            Nastav si svůj denní brief. Změnit to můžeš kdykoli.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
              Jazyk shrnutí
            </div>
            <div className="mt-1 font-body text-sm text-ink-4">
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
            <div className="mt-1 font-body text-sm text-ink-4">
              Z jakého tisku má brief čerpat? Vyber jednu nebo více.
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

        <button
          onClick={() => {
            update({ completed: true });
            router.push("/loading");
          }}
          className="mt-2 w-fit rounded-full bg-brand px-6 py-3 font-body text-[15px] font-medium text-white transition-opacity hover:opacity-90"
        >
          Vytvořit můj brief
        </button>
      </div>
    </main>
  );
}