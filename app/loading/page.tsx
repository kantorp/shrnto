"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import { Wordmark } from "@/components/wordmark";

export default function LoadingPage() {
  const router = useRouter();
  const t = useT();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1800),
      setTimeout(() => setStep(2), 3800),
      setTimeout(() => router.push("/brief"), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6">
      <Wordmark className="text-2xl" />
      <h1 className="mt-10 font-display text-2xl font-medium text-ink">{t.loading.title}</h1>
      <p className="mt-1 font-sans text-[15px] text-ink-3">{t.loading.sub}</p>

      <ul className="mt-10 flex flex-col gap-3">
        {t.loading.steps.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={i} className="flex items-center gap-3">
              <span
                className={
                  "flex h-5 w-5 items-center justify-center rounded-full border transition-all " +
                  (done
                    ? "border-brand bg-brand text-white"
                    : active
                      ? "border-brand text-brand"
                      : "border-divider text-ink-4")
                }
              >
                {done ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : active ? (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                ) : null}
              </span>
              <span className={"font-sans text-[14px] transition-colors " + (done || active ? "text-ink-2" : "text-ink-4")}>
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </main>
  );
}