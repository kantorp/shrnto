"use client";

import { useRouter } from "next/navigation";
import { usePreferences } from "@/lib/preferences";
import { useT } from "@/lib/i18n";
import { Wordmark } from "@/components/wordmark";
import { SegControl } from "@/components/seg-control";
import { SourceChips } from "@/components/source-chips";

export default function OnboardingPage() {
  const router = useRouter();
  const { prefs, update, loaded } = usePreferences();
  const t = useT();
  if (!loaded) return null;

  return (
    <main className="min-h-screen bg-bg py-12">
      <div className="mx-auto flex max-w-xl flex-col gap-10 px-6">
        <Wordmark className="text-base" />

        <div>
          <h1 className="font-display text-3xl font-medium tracking-[-0.01em] text-ink">
            {t.onboarding.welcome}
          </h1>
          <p className="mt-1 font-sans text-[15px] text-ink-3">{t.onboarding.intro}</p>
        </div>

        <section className="flex flex-col gap-3">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">{t.onboarding.langLabel}</div>
            <div className="mt-1 font-sans text-sm text-ink-4">{t.onboarding.langHint}</div>
          </div>
          <SegControl
            value={prefs.language}
            onChange={(v) => update({ language: v })}
            options={[
              { value: "cs", label: t.controls.langCs },
              { value: "en", label: t.controls.langEn },
            ]}
          />
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">{t.onboarding.sourcesLabel}</div>
            <div className="mt-1 font-sans text-sm text-ink-4">{t.onboarding.sourcesHint}</div>
          </div>
          <SourceChips value={prefs.sources} onChange={(v) => update({ sources: v })} />
        </section>

        <section className="flex flex-col gap-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">{t.onboarding.lengthLabel}</div>
          <SegControl
            value={prefs.length}
            onChange={(v) => update({ length: v })}
            options={[
              { value: "short", label: t.controls.short },
              { value: "long", label: t.controls.longer },
            ]}
          />
        </section>

        <button
          onClick={() => {
            update({ completed: true });
            router.push("/loading");
          }}
          className="mt-2 w-fit rounded-full bg-brand px-6 py-3 font-sans text-[15px] font-medium text-white transition-opacity hover:opacity-90"
        >
          {t.onboarding.cta}
        </button>
      </div>
    </main>
  );
}