"use client";

import { usePreferences } from "@/lib/preferences";
import { SegControl } from "@/components/seg-control";
import { SourceChips } from "@/components/source-chips";

export default function Home() {
  const { prefs, update, loaded } = usePreferences();
  if (!loaded) return null;

  return (
    <main className="min-h-screen bg-bg py-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-ink-3">Jazyk</p>
          <SegControl
            value={prefs.language}
            onChange={(v) => update({ language: v })}
            options={[
              { value: "cs", label: "Čeština" },
              { value: "sk", label: "Slovenčina" },
              { value: "en", label: "English" },
            ]}
          />
        </div>
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-ink-3">Zdrojové země</p>
          <SourceChips value={prefs.sources} onChange={(v) => update({ sources: v })} />
        </div>
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-ink-3">Délka</p>
          <SegControl
            value={prefs.length}
            onChange={(v) => update({ length: v })}
            options={[
              { value: "short", label: "Krátký" },
              { value: "long", label: "Delší" },
            ]}
          />
        </div>
        <pre className="rounded bg-surface p-3 font-mono text-xs text-ink-2">{JSON.stringify(prefs, null, 2)}</pre>
      </div>
    </main>
  );
}