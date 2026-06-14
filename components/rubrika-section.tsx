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

function distinctRefs(body: StorySpan[]): string[] {
  const refs = new Set<string>();
  for (const s of body) if (s.type === "src" && s.ref) refs.add(s.ref);
  return [...refs];
}

function StoryArticle({ story }: { story: Story }) {
  // Jednozdrojová story: badge jednou na konci (ne uprostřed věty).
  // Vícezdrojová: badge u příslušných tvrzení (odlišují, co je odkud).
  const singleSource = distinctRefs(story.body).length <= 1;

  let body;
  if (singleSource) {
    const text = story.body
      .map((s) => (s.type === "text" ? s.text : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .replace(/\s+([.,;:!?])/g, "$1")
      .trim();
    const badge = story.body.find((s) => s.type === "src");
    body = (
      <>
        {text}
        {badge && badge.type === "src" && (
          <span className="whitespace-nowrap">
            {"\u00A0"}
            <SrcBadge source={badge.source} page={badge.page} url={badge.url} />
          </span>
        )}
      </>
    );
  } else {
    body = renderBody(story.body);
  }

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
      <p className="mt-2 font-body text-[15px] leading-7 text-ink-2">{body}</p>
    </article>
  );
}

export function RubrikaSection({ rubrika }: { rubrika: BriefRubrika }) {
  const isNazory = rubrika.id === "nazory";

  return (
    <section className="border-t border-divider pt-6">
      <Rubrika id={rubrika.id} className="text-[13px]" />

      {isNazory ? (
        <div className="mt-6 flex flex-col gap-8">
          {sortStoriesByImportance(rubrika.stories).map((story, i) => (
            <StoryArticle key={i} story={story} />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-12">
          {groupAndSort(rubrika.stories).map((group, gi) => (
            <div key={gi}>
              {group.theme && (
                <div className="mb-5 flex items-center gap-3">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-4">
                    {group.theme}
                  </span>
                  <span className="h-px flex-1 bg-divider-soft" aria-hidden />
                </div>
              )}
              <div className="flex flex-col gap-8">
                {group.stories.map((story, i) => (
                  <StoryArticle key={i} story={story} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}