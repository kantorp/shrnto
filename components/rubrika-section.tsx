import type { BriefRubrika, StorySpan } from "@/lib/brief";
import { Rubrika } from "@/components/rubrika";
import { SrcBadge } from "@/components/src-badge";

function renderBody(spans: StorySpan[]) {
  return spans.map((s, i) =>
    s.type === "text" ? (
      <span key={i}>{s.text}</span>
    ) : (
      <span key={i} className="whitespace-nowrap">
        {"\u00A0"}
        <SrcBadge source={s.source} page={s.page} url={s.url} />
      </span>
    ),
  );
}

export function RubrikaSection({ rubrika }: { rubrika: BriefRubrika }) {
  return (
    <section className="border-t border-divider pt-6">
      <Rubrika id={rubrika.id} className="text-[13px]" />

      <div className="mt-6 flex flex-col gap-8">
        {rubrika.stories.map((story, i) => (
          <article key={i}>
            <h3 className="font-display text-lg font-medium leading-snug text-ink">
              {story.title}
            </h3>
            {story.author && (
              <p className="mt-1 font-mono text-[11px] tracking-[0.04em] text-ink-3">
                {story.author}
              </p>
            )}
            <p className="mt-2 font-body text-[15px] leading-7 text-ink-2">
              {renderBody(story.body)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}