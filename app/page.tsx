import { DEMO_BRIEF } from "@/lib/brief";
import { Wordmark } from "@/components/wordmark";
import { BriefView } from "@/components/brief-view";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-10 flex items-center justify-between">
          <Wordmark className="text-base" />
          <span className="font-mono text-[11px] text-ink-4">demo</span>
        </div>

        <BriefView brief={DEMO_BRIEF} />
      </div>
    </main>
  );
}