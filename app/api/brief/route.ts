import Anthropic from "@anthropic-ai/sdk";
import articlesData from "@/data/articles.json";
import type { Brief } from "@/lib/brief";
import type { Region } from "@/lib/preferences";
import { THEMES, THEME_FALLBACK } from "@/lib/themes";

export const runtime = "nodejs";
export const maxDuration = 120;

const anthropic = new Anthropic();

type RawArticle = {
  id: string;
  source: string;
  page: number | null;
  headline: string;
  summary_cz: string;
  category: string;
  author: string | null;
  url: string | null;
  body?: string;
};

type Span = { type: string; text?: string; ref?: string | null; source?: string; url?: string | null; page?: number | null };
type Story = { title: string; author?: string | null; theme?: string; sourceCount?: number; importance?: number; body: Span[]; shortBody?: Span[] };
type Rubrika = "ekonomika" | "politika" | "nazory";

const ARTICLES = (articlesData as { articles: RawArticle[] }).articles;
const BATCH = 5;

function regionOf(source: string): Region {
  if (source === "HN" || source === "HN_archive") return "cz";
  if (source === "DenikN_sk") return "sk";
  return "svet";
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function deriveShort(body: Span[]): Span[] {
  const out: Span[] = [];
  let chars = 0;
  for (const s of body) {
    if (s.type === "src") out.push(s);
    else if (s.type === "text" && chars < 280) {
      out.push(s);
      chars += (s.text ?? "").length;
    }
  }
  return out;
}

function parseJsonLoose<T>(raw: string, fallback: T): T {
  const t = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(t) as T;
  } catch {
    const marker = t.lastIndexOf("]");
    if (marker > 0) {
      try {
        return JSON.parse(t.slice(0, marker + 1)) as T;
      } catch {}
    }
    return fallback;
  }
}

// FÁZE 1: rozhodni, které články patří k téže konkrétní události. Vrať skupiny ID.
async function groupArticles(articles: RawArticle[]): Promise<string[][]> {
  if (articles.length === 0) return [];
  const list = articles
    .map((a) => `{${a.id}} [${a.source}] ${a.headline} — ${a.summary_cz}`)
    .join("\n");

  const resp = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2000,
    system: `Dostáváš seznam novinových článků (ID, zdroj, titulek, shrnutí). Tvým úkolem je seskupit POUZE články o TÉŽE konkrétní události, kauze nebo aktérovi (tentýž summit, tatáž transakce, tentýž konflikt).
PRAVIDLA:
- Slučuj jen skutečně tutéž událost. Sdílené TÉMA/OBLAST/REGION ("německý průmysl", "energetika", "trhy") NENÍ důvod ke sloučení.
- Většina článků je o své vlastní události → vrať je jako jednoprvkové skupiny. To je normální.
- Každé ID použij PRÁVĚ JEDNOU.
Vrať POUZE JSON pole skupin ID, nic jiného:
[["art_012","art_031"],["art_007"],["art_009"]]`,
    messages: [{ role: "user", content: list }],
  });

  const text = resp.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("");
  const groups = parseJsonLoose<string[][]>(text, []);

  // pojistka: každé existující ID se musí objevit; chybějící doplň jako singleton
  const valid = new Set(articles.map((a) => a.id));
  const seen = new Set<string>();
  const clean: string[][] = [];
  for (const g of groups) {
    const grp = g.filter((id) => valid.has(id) && !seen.has(id));
    grp.forEach((id) => seen.add(id));
    if (grp.length) clean.push(grp);
  }
  for (const a of articles) if (!seen.has(a.id)) clean.push([a.id]);
  return clean;
}

function articleBlock(a: RawArticle): string {
  const text = (a.body ?? a.summary_cz ?? "").slice(0, 2000);
  return `--- {${a.id}} [${a.source}${a.page ? "/" + a.page : ""}]${a.author ? " (autor: " + a.author + ")" : ""}
Titulek: ${a.headline}
Text: ${text}`;
}

function systemFor(rubrika: Rubrika, lang: string): string {
  const isNazory = rubrika === "nazory";
  const themeRule = isNazory
    ? `Téma nepřiřazuj — u každé story nech "theme": "".`
    : `TÉMA — přiřaď KAŽDÉ story právě jedno z: ${THEMES[rubrika as "ekonomika" | "politika"].join(", ")}. NEVYMÝŠLEJ nová; když nic nesedí, "${THEME_FALLBACK}".`;
  const consolidationRule = isNazory
    ? `Každý komentář = jedna story. Má-li v datech autora, vyplň "author" a názor připiš autorovi ("Podle Karla Nedvěda…"), nikdy v našem hlase.`
    : `KONSOLIDACE: skupina označená "SLOUČIT" obsahuje články o TÉŽE události — napiš z nich JEDNU story a atribuuj zdroje v textu ("FAZ jako jediný uvádí…", "FT dodává…"). "author" nech prázdné.`;

  return `Jsi šéfeditor české press intelligence shrn.to (styl Fleet Sheet). Dostáváš skupiny článků z rubriky ${rubrika.toUpperCase()}. Z KAŽDÉ skupiny napiš jednu plnohodnotnou story. Referuj fakta, NEkomentuj.

DÉLKA: tělo každé story je 100–150 slov plynulého textu — piš z pole "Text", vytěž konkrétní detaily (čísla, jména, částky, termíny). Čtenář nemusí číst originál. Dvouvětné shrnutí je CHYBA. Drž se faktů z Textu, NIKDY nevymýšlej.

VÝBĚR: zpracuj každou skupinu. VYNECH skupinu, jen pokud je to: (a) lokální/regionální drobnost bez přesahu (i česká), (b) lifestyle/cestování/koníčky/populárně-vědecké/kuriozita, (c) bulvár, (d) čistě vnitřní lokální záležitost cizí země bez mezinárodního/tržního přesahu — sem patří i VOLBA PRIMÁTORA/STAROSTY/ZASTUPITELSTVA zahraničního města (vyhoď, i když je strana zajímavá). POZOR: velké světové události (geopolitika, globální ekonomika, trhy) ZAŘAĎ i bez vazby na ČR.

${consolidationRule}

${!isNazory ? `ZÁKAZ HODNOCENÍ: referuj, neinterpretuj. Žádné závěry/soudy/implikace. Fakta uveď, závěr nech na čtenáři.` : ""}

${themeRule}

ŘAZENÍ — u KAŽDÉ story vyplň "sourceCount" (počet různých deníků ve skupině) a "importance" (1–3; 3 = vede dni). importance NIKDY nepiš do textu.

FORMÁT TĚLA: pole útržků { "type":"text","text":"…" } a { "type":"src","source":"HN","ref":"art_012" } (badge ZA tvrzením; ref = ID z {…}). Každý článek (ref) uveď ve story nejvýše JEDNOU. PŘESNÉ kódy zdroje (HN, FT_online, FT_print, NYT, FAZ, DenikN_sk) a PŘESNÉ ref. NEgeneruj "shortBody".

Jazyk výstupu: ${lang === "en" ? "angličtina" : "čeština"}.
Vrať POUZE JSON pole story (žádný wrapper, žádný markdown). Vynechané skupiny prostě neuváděj.
[ { "title":"...", "author":null, "theme":"${isNazory ? "" : "Energetika"}", "sourceCount":1, "importance":2, "body":[ {"type":"text","text":"..."}, {"type":"src","source":"HN","ref":"art_001"} ] } ]`;
}

async function generateBatch(rubrika: Rubrika, groups: string[][], byId: Map<string, RawArticle>, lang: string): Promise<Story[]> {
  const content = groups
    .map((g, i) => {
      const tag = g.length > 1 ? `SKUPINA ${i + 1} — SLOUČIT (táž událost):` : `SKUPINA ${i + 1}:`;
      return `${tag}\n${g.map((id) => articleBlock(byId.get(id)!)).join("\n")}`;
    })
    .join("\n\n");

  const resp = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 5000,
    system: systemFor(rubrika, lang),
    messages: [{ role: "user", content: `Datum: pátek 15. května 2026.\n\n${content}` }],
  });

  const text = resp.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("");
  return parseJsonLoose<Story[]>(text, []);
}

async function generateRubrika(rubrika: Rubrika, articles: RawArticle[], lang: string): Promise<Story[]> {
  if (articles.length === 0) return [];
  const byId = new Map(articles.map((a) => [a.id, a]));
  const groups = await groupArticles(articles); // fáze 1
  const out: Story[] = [];
  for (const batch of chunk(groups, BATCH)) {
    out.push(...(await generateBatch(rubrika, batch, byId, lang))); // fáze 2, sekvenčně
  }
  return out;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sources = (url.searchParams.get("sources") ?? "cz,sk,svet").split(",") as Region[];
    const language = url.searchParams.get("language") ?? "cs";

    const filtered = ARTICLES.filter((a) => sources.includes(regionOf(a.source)));
    const byCat = (c: string) => filtered.filter((a) => a.category === c);

    const [ekonomika, politika, nazory] = await Promise.all([
      generateRubrika("ekonomika", byCat("ekonomika"), language),
      generateRubrika("politika", byCat("politika"), language),
      generateRubrika("nazory", byCat("nazory"), language),
    ]);

    const spotlightResp = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 300,
      system: `Z dodaných článků vyber JEDEN výrazný KONKRÉTNÍ ÚDAJ. MUSÍ obsahovat konkrétní číslo s jednotkou (Kč/mld., %, počet, objem). NESMÍ to být převyprávění události bez čísla ani lokální/kuriozní zpráva. Jazyk: ${language === "en" ? "angličtina" : "čeština"}. Vrať POUZE jednu větu.`,
      messages: [{ role: "user", content: filtered.filter((a) => a.category !== "nazory").map((a) => `${a.headline} — ${a.summary_cz}`).join("\n") }],
    });
    const spotlight = spotlightResp.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("").trim();

    const rubriky = [
      { id: "ekonomika", stories: ekonomika },
      { id: "politika", stories: politika },
      { id: "nazory", stories: nazory },
    ];

    const urlById = new Map(ARTICLES.map((a) => [a.id, { url: a.url, page: a.page }]));
    const resolveSpans = (spans: Span[] = []) => {
      for (const span of spans) {
        if (span.type === "src" && span.ref) {
          const hit = urlById.get(span.ref);
          if (hit) {
            span.url = hit.url;
            if (span.page == null) span.page = hit.page;
          }
        }
      }
    };
    for (const r of rubriky) {
      for (const s of r.stories ?? []) {
        resolveSpans(s.body);
        s.shortBody = deriveShort(s.body);
        resolveSpans(s.shortBody);
      }
    }

    const brief: Brief = {
      avatar: "PK",
      greeting: language === "en" ? "Good morning, Pavel." : "Dobré ráno, Pavle.",
      dateline: language === "en" ? "Friday, 15 May 2026 · brief 07:42" : "Pátek 15. května 2026 · brief 07:42",
      spotlightLabel: language === "en" ? "Figure of the day" : "Údaj dne",
      spotlight,
      rubriky: rubriky as Brief["rubriky"],
    };

    return new Response(JSON.stringify(brief), { headers: { "content-type": "application/json; charset=utf-8" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("brief error:", msg);
    return Response.json({ error: "Generování briefu selhalo.", detail: msg }, { status: 500 });
  }
}