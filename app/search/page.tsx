"use client";

import { useState } from "react";
import Link from "next/link";
import type { SearchAnswer } from "@/lib/search";
import { Wordmark } from "@/components/wordmark";
import { SearchAnswerBody } from "@/components/search-answer";

const SUGGESTED = [
  "Co je nového u Schillerové a státních dluhopisů?",
  "Jak dopadly výsledky bank (Erste, KB, Moneta)?",
  "Co se děje kolem Tchaj-wanu?",
  "Vlna propouštění v Německu?",
];

const RECENT = [
  { q: "Jaký dopad měla emise CSG na pražskou burzu?", time: "včera" },
  { q: "Co řekla ČNB k inflaci?", time: "3 dny" },
  { q: "Jak se vyvíjely výnosy státních dluhopisů?", time: "tento týden" },
];

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState<SearchAnswer | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask(q: string) {
    const query = q.trim();
    if (!query) return;
    setInput(query);
    setLoading(true);
    setAnswer(null);
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await r.json();
      setAnswer(data.error ? null : data);
    } catch {
      setAnswer(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <Wordmark className="text-base" />
          <Link href="/brief" className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3 transition-colors hover:text-brand">
            Brief
          </Link>
        </div>

        {/* input */}
        <div className="flex items-center gap-2 rounded-full border border-divider bg-surface-elevated px-4 py-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-ink-4">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(input)}
            placeholder="Zeptej se na firmu, sektor nebo vývoj…"
            className="flex-1 bg-transparent font-sans text-[15px] text-ink outline-none placeholder:text-ink-4"
          />
        </div>

        {/* loading */}
        {loading && (
          <p className="mt-8 font-sans text-sm text-ink-3">Hledám v korpusu…</p>
        )}

        {/* result */}
        {answer && !loading && (
          <div className="mt-8">
            <h1 className="font-display text-xl font-medium text-ink">{answer.question}</h1>
            {answer.meta && (
              <p className="mt-1 font-mono text-[11px] tracking-[0.04em] text-ink-4">
                Syntéza · {answer.meta}
              </p>
            )}
            <div className="mt-4">
              <SearchAnswerBody items={answer.items} />
            </div>

            {answer.followups.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
                  Pokračovat
                </p>
                <div className="flex flex-col gap-2">
                  {answer.followups.map((f, i) => (
                    <button
                      key={i}
                      onClick={() => ask(f)}
                      className="rounded-lg border border-divider bg-surface px-4 py-3 text-left font-sans text-[14px] text-ink-2 transition-colors hover:border-brand hover:text-brand"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* empty stav */}
        {!answer && !loading && (
          <div className="mt-10">
            <p className="font-display text-lg font-medium text-ink">Co tě dnes zajímá?</p>
            <p className="mt-1 font-sans text-sm text-ink-3">
              Brief odpoví ze syntézy CZ, SK i světového tisku.
            </p>

            <p className="mb-3 mt-8 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
              Zkus začít
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTED.map((q, i) => (
                <button
                  key={i}
                  onClick={() => ask(q)}
                  className="rounded-lg border border-divider bg-surface px-4 py-3 text-left font-sans text-[14px] text-ink-2 transition-colors hover:border-brand hover:text-brand"
                >
                  {q}
                </button>
              ))}
            </div>

            <p className="mb-3 mt-8 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
              Nedávné dotazy
            </p>
            <div className="flex flex-col gap-1">
              {RECENT.map((r, i) => (
                <button
                  key={i}
                  onClick={() => ask(r.q)}
                  className="flex items-center justify-between gap-4 py-2 text-left font-sans text-[14px] text-ink-3 transition-colors hover:text-ink"
                >
                  <span>{r.q}</span>
                  <span className="font-mono text-[10px] text-ink-4">{r.time}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}