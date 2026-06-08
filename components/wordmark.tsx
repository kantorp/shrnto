import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display font-medium tracking-[-0.01em] whitespace-nowrap text-ink",
        className,
      )}
    >
      shrn<span className="italic text-brand">.to</span>
    </span>
  );
}