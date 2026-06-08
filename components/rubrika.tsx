import { cn } from "@/lib/utils";

export type RubrikaId = "ekonomika" | "politika" | "nazory";

const LABELS: Record<RubrikaId, string> = {
  ekonomika: "Ekonomika",
  politika: "Politika",
  nazory: "Názory",
};

export function Rubrika({
  id,
  className,
}: {
  id: RubrikaId;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
      {LABELS[id]}
    </span>
  );
}