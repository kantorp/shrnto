import { cn } from "@/lib/utils";

export type Source = "HN" | "FT_online" | "FT_print" | "NYT" | "FAZ" | "DenikN_sk";

const SOURCE_LABELS: Record<Source, string> = {
  HN: "HN",
  FT_online: "FT",
  FT_print: "FT",
  NYT: "NYT",
  FAZ: "FAZ",
  DenikN_sk: "DN",
};

export function SrcBadge({
  source,
  page,
  url,
  className,
}: {
  source: Source;
  page?: number | null;
  url?: string | null;
  className?: string;
}) {
  const label = SOURCE_LABELS[source] ?? source;
  const text = page != null ? `${label}/${page}` : label;

  const classes = cn(
    "relative -top-px inline-flex items-center rounded-[3px] border border-divider bg-surface",
    "px-1.5 py-px font-mono text-[9.5px] font-medium leading-tight tracking-[0.04em]",
    "whitespace-nowrap text-ink-2 no-underline transition-colors",
    "hover:border-brand hover:text-brand",
    className,
  );

  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className={classes}>
      {text}
    </a>
  ) : (
    <span className={classes}>{text}</span>
  );
}