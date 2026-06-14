import type { BriefRubrika, Story, StorySpan } from "@/lib/brief";
import { Rubrika } from "@/components/rubrika";
import { SrcBadge } from "@/components/src-badge";
import { groupAndSort, sortStoriesByImportance } from "@/lib/sortBrief";

// unikátní zdroje (deníky) ve story, v pořadí prvního výskytu
function uniqueSources(body: StorySpan[]) {
  const seen = new Set<string>();
  const out: Extract<StorySpan, { type: "src" }>[] = [];
  for (const s of body) {
    if (s.type === "src" && !seen.has(s.source)) {
      seen.add(s.source);
      out.push(s);
    }
  }
  return out;
}

function StoryArticle({ story }: { story: Story }) {
  const text = story.body
    .map((s) => (s.type === "text" ? s.text : ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
  const badges = uniqueSources(story.body);

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
        {text}
        {badges.map((b, i) => (
          <span key={i} className="whitespace-nowrap">
            {"\u00A0"}
            <SrcBadge source={b.source} page={b.page} url={b.url} />
          </span>
        ))}
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