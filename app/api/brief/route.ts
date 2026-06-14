import Anthropic from "@anthropic-ai/sdk";
import articlesData from "@/data/articles.json";
import type { Brief } from "@/lib/brief";
import type { Region } from "@/lib/preferences";
import { THEMES, THEME_FALLBACK } from "@/lib/themes";

export const runtime = "nodejs";
export const maxDuration = 60;

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
};

type Span = { type: string; text?: string; ref?: string | null; source?: string; url?: string | null; page?: number | null };

const ARTICLES = (articlesData as { articles: RawArticle[] }).articles;

function regionOf(source: string): Region {
  if (source === "HN" || source === "HN_archive") return "cz";
  if (source === "DenikN_sk") return "sk";
  return "svet";
}

function deriveShort(body: Span[]): Span[] {
  const out: Span[] = [];
  let chars = 0;
  for (const s of body) {
    if (s.type === "src") {
      out.push(s);
    } else if (s.type === "text" && chars < 280) {
      out.push(s);
      chars += (s.text ?? "").length;
    }
  }
  return out;
}

// Záchrana useknutého JSONu: ořízni po posledním kompletním story a dozavři strukturu.
function salvageJson(raw: string): string {
  // poslední místo, kde končí kompletní story objekt: `}]}` (konec body pole + story)
  const marker = raw.lastIndexOf("}]}");
  if (marker === -1) throw new Error("nelze zachránit");
  // za tímto story dozavřeme: stories pole, rubrika objekt, rubriky pole, kořen
  return raw.slice(0, marker + 3) + "]}]}";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sources = (url.searchParams.get("sources") ?? "cz,sk,svet").split(",") as Region[];
    const language = url.searchParams.get("language") ?? "cs";
    const mode = url.searchParams.get("mode") === "fleet" ? "fleet" : "consolidated";

    const filtered = ARTICLES.filter((a) => sources.includes(regionOf(a.source)));

    const articleLines = filtered
      .map(
        (a) =>
          `- {${a.id}} [${a.source}${a.page ? "/" + a.page : ""}] (${a.category}${a.author ? ", autor: " + a.author : ""}) ${a.headline} — ${a.summary_cz}`,
      )
      .join("\n");

    const lang = language === "en" ? "angličtina" : "čeština";

    const selectionBlock =
      mode === "fleet"
        ? `VÝBĚR — FLEET REŽIM: zpracuj KAŽDÝ relevantní článek z ekonomiky a politiky jako vlastní story. Vynech jen čistý balast (lokální drobnosti, lifestyle/supplementy).`
        : `VÝBĚR (consolidated): zahrň každou samostatnou událost s jasným významem pro středoevropské čtenáře nebo investory — domácí i mezinárodní s dopadem na ČR/CEE, trhy, firmy, ekonomiku či politiku. Typicky 6–9 nejrelevantnějších story na rubriku, řiď se RELEVANCÍ, ne počtem. VYNECH: lokální/regionální drobnosti, lifestyle a supplementy (cestování, jazyky, koníčky), ryze zahraniční domácí kauzy bez vazby na CEE a duplicity.`;

    const consolidationBlock =
      mode === "fleet"
        ? `KONSOLIDACE — FLEET REŽIM: NEslučuj. Jeden článek = jedna samostatná story. "sourceCount" je vždy 1.`
        : `KONSOLIDACE (úzká definice): slij do JEDNÉ story POUZE články o TÉŽE konkrétní události, kauze nebo aktérovi (tentýž summit, tatáž firma, tentýž konflikt). Tehdy atribuuj fakta ke zdrojům přímo v textu a kde má některý deník unikátní úhel, řekni to ("FAZ jako jediný uvádí…", "FT k tomu dodává…").
- NIKDY neslévej nesouvisející příběhy jen proto, že spadají do stejné rubriky nebo obecného tématu.
- PŘÍKLAD CHYBY (NEDĚLEJ): pod titulek o rozhodnutí vlády o ceně elektřiny NEpatří věta, že se Německo obává energetických přídělů, ani že IEA varuje před růstem cen ropy. To jsou JINÉ události — patří do téhož tématu (Energetika), ale jako SAMOSTATNÉ story.
- Singletony (událost jen v jednom zdroji) zpracuj jako samostatnou story s jedním zdrojem — to je v pořádku a běžné.`;

    const system = `Jsi šéfeditor české press intelligence služby shrn.to (ve stylu Fleet Sheet od Erika Besta).
Z dodaných článků napíšeš denní brief složený z TOP STORIES — ne výpis, ale redakčně zpracované příběhy. Tvým úkolem je REFEROVAT fakta, ne je komentovat.

ZÁSADY:
- Tři rubriky v pořadí: ekonomika, politika, nazory. Jedna story = jedna konkrétní událost.
- DÉLKA TĚLA: každá story má tělo 100–150 slov plynulého textu (NIKDY přes 150 slov), tak úplné, aby čtenář nemusel číst původní článek. Platí i pro jednozdrojové a méně důležité story — vytěž z článku konkrétní detaily (čísla, jména, částky, podmínky, termíny). Krátké dvouvětné shrnutí je CHYBA. Když je zdroj opravdu chudý, NIKDY nevymýšlej fakta, jen napiš méně — i tak souvislý odstavec.

${selectionBlock}

${consolidationBlock}

ZÁKAZ HODNOCENÍ (platí pro ekonomika a politika): referuj, neinterpretuj. NEPIŠ věty, které spojují fakta do závěru, soudu nebo implikace.
Zakázané vzory (přesně takovým se vyhni):
  "Stát tak na jedné straně shání peníze od domácností a na druhé rozjíždí rozsáhlé infrastrukturní výdaje."
  "Kombinace rostoucích investic a sporné efektivity dotací ukazuje, jak křehká je disciplína obecních rozpočtů."
Fakta uveď, závěr ať si udělá čtenář sám. (V rubrice nazory je hodnocení obsahem — viz níže.)

TÉMATA — u rubrik ekonomika a politika přiřaď KAŽDÉ story právě jedno téma (pole "theme"). Vyber NEJBLIŽŠÍ z níže uvedených, NEVYMÝŠLEJ nová. Když opravdu nic nesedí, použij "${THEME_FALLBACK}".
- ekonomika: ${THEMES.ekonomika.join(", ")}
- politika: ${THEMES.politika.join(", ")}
U rubriky nazory téma nepřiřazuj — nech "theme": "".

ŘAZENÍ — u KAŽDÉ story vyplň dvě číselná pole (řazení dělá až aplikace, ty jen vyplň signály):
- "sourceCount": počet RŮZNÝCH zdrojů (deníků), které tutéž událost pokryly (ve fleet režimu vždy 1).
- "importance": 1–3, jak zásadní událost to je (3 = vede dni, 1 = okrajové). INTERNÍ signál, NIKDY ho nepiš do textu.

NÁZORY (rubrika nazory): každý komentář = jedna story, NIKDY neslučuj. Pokud má komentář v datech autora, vyplň pole "author" a názor VŽDY připiš autorovi ("Podle Karla Nedvěda…"), nikdy ho neuváděj v našem hlase. U zpravodajských stories (ekonomika, politika) nech "author" prázdné. Autora ber jen z dat, nikdy nevymýšlej.

DALŠÍ:
- Veď českým/CEE děním, mezinárodní zdroje (FT/NYT/FAZ) přidávej jako kontext.
- NIKDY si nevymýšlej fakta ani zdroje. Cituj jen to, co je v dodaných článcích.
- Jazyk výstupu: ${lang}.

FORMÁT TĚLA: tělo je pole útržků, které se střídají:
- { "type": "text", "text": "část věty nebo věta" }
- { "type": "src", "source": "HN", "ref": "art_012" }   ← badge hned ZA tvrzením; "ref" je ID článku ve složených závorkách {…} z dodaného seznamu, ze kterého tvrzení pochází
PRAVIDLO ATRIBUCE: každý zdrojový článek (ref) uveď v rámci JEDNÉ story nejvýše JEDNOU — badge umísti za nejdůležitější tvrzení z toho článku. NEOPAKUJ tentýž ref víckrát ve stejné story. Když story konsoliduje více článků, každý z nich dostane svůj jeden badge.
Použij PŘESNÉ kódy zdroje (HN, FT_online, FT_print, NYT, FAZ, DenikN_sk) a PŘESNÉ ref ID z dodaných článků (nikdy si ref nevymýšlej).

ÚDAJ DNE: pole "spotlight" = JEDEN výrazný fakt nebo číslo z dnešního korpusu, který přiláká pozornost. NESMÍ to být událost ani číslo, které je zároveň některou ze story v briefu. Vyber samostatný, jinde v briefu nezmíněný fakt nebo číslo. Jedna věta. Bez zdrojů.

KRITICKÉ PRAVIDLO VÝSTUPU: každý story objekt má POUZE pole "title", "author", "theme", "sourceCount", "importance", "body". POLE "shortBody" NEGENERUJ — nikdy ho do výstupu nepiš. Generování "shortBody" je chyba a zbytečně plýtvá místem; krátkou verzi si vytvoří aplikace sama z "body".

Vrať POUZE validní JSON, bez markdownu.`;

    const user = `Datum: pátek 15. května 2026.

Články:
${articleLines}

Vrať JSON přesně v tomto tvaru (BEZ pole shortBody):
{
  "spotlight": "string",
  "rubriky": [
    {
      "id": "ekonomika",
      "stories": [
        {
          "title": "string",
          "author": null,
          "theme": "Energetika",
          "sourceCount": 2,
          "importance": 3,
          "body": [
            { "type": "text", "text": "Vláda zvažuje úlevy na ceně elektřiny" },
            { "type": "src", "source": "HN", "ref": "art_031" }
          ]
        }
      ]
    },
    { "id": "politika", "stories": [] },
    { "id": "nazory", "stories": [] }
  ]
}`;

    const resp = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 16000,
      system,
      messages: [{ role: "user", content: user }],
    });

    let text = resp.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    let parsed: { spotlight?: string; rubriky?: { id: string; stories: { body: Span[]; shortBody?: Span[] }[] }[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = JSON.parse(salvageJson(text));
    }

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
    for (const r of parsed.rubriky ?? []) {
      for (const s of r.stories ?? []) {
        resolveSpans(s.body);
        s.shortBody = deriveShort(s.body);
        resolveSpans(s.shortBody);
      }
    }

    const brief: Brief = {
      avatar: "PK",
      greeting: language === "en" ? "Good morning, Pavel." : "Dobré ráno, Pavle.",
      dateline:
        language === "en"
          ? "Friday, 15 May 2026 · brief 07:42"
          : "Pátek 15. května 2026 · brief 07:42",
      spotlightLabel: language === "en" ? "Figure of the day" : "Údaj dne",
      spotlight: parsed.spotlight ?? "",
      rubriky: (parsed.rubriky ?? []) as Brief["rubriky"],
    };

    return new Response(JSON.stringify(brief), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("brief error:", msg);
    return Response.json({ error: "Generování briefu selhalo.", detail: msg }, { status: 500 });
  }
}