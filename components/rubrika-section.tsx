import type { BriefRubrika } from "@/lib/brief";
import { Rubrika } from "@/components/rubrika";
import { SrcBadge } from "@/components/src-badge";

export function RubrikaSection({ rubrika }: { rubrika: BriefRubrika }) {
  return (
    <section className="border-t border-divider pt-6">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <Rubrika id={rubrika.id} className="text-[13px]" />
        <span className="font-mono text-[10px] tracking-[0.04em] text-ink-4">
          {rubrika.meta}
        </span>
      </div>

      <p className="font-body text-[15px] leading-7 text-ink-2">
        {rubrika.items.map((item, i) => {
          const words = item.text.split(" ");
          const last = words.pop();
          const head = words.join(" ");
          return (
            <span key={i}>
              {head}{" "}
              <span className="whitespace-nowrap">
                {last}
                <SrcBadge
                  source={item.source}
                  page={item.page}
                  url={item.url}
                  className="ml-1"
                />
              </span>{" "}
            </span>
          );
        })}
      </p>
    </section>
  );
}