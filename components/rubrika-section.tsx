import type { BriefRubrika, Story, StorySpan } from "@/lib/brief";
import { Rubrika } from "@/components/rubrika";
import { SrcBadge } from "@/components/src-badge";
import { groupAndSort, sortStoriesByImportance } from "@/lib/sortBrief";

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

function StoryArticle({ story }: { story: Story }) {
  return (
    <article>
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
  );
}

export function RubrikaSection({ rubrika }: { rubrika: BriefRubrika }) {
  const isNazory = rubrika.id === "nazory";

  return (
    <section className="border-t border-divider pt-6">
      <Rubrika id={rubrika.id} className="text-[13px]" />

      {isNazory ? (
        // Názory: bez seskupování, jeden komentář = jeden odstavec, řazeno dle importance
        <div className="mt-6 flex flex-col gap-8">
          {sortStoriesByImportance(rubrika.stories).map((story, i) => (
            <StoryArticle key={i} story={story} />
          ))}
        </div>
      ) : (
        // Ekonomika / Politika: seskupení podle tématu, uvnitř dle salience
        <div className="mt-6 flex flex-col gap-10">
          {groupAndSort(rubrika.stories).map((group, gi) => (
            <div key={gi} className="flex flex-col gap-8">
              {group.theme && (
                <div className="flex justify-end">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-4">
                    {group.theme}
                  </span>
                </div>
              )}
              {group.stories.map((story, i) => (
                <StoryArticle key={i} story={story} />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}