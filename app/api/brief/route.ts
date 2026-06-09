import Anthropic from "@anthropic-ai/sdk";
import articlesData from "@/data/articles.json";
import type { Brief } from "@/lib/brief";
import type { Region } from "@/lib/preferences";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic();

type RawArticle = {
  source: string;
  page: number | null;
  headline: string;
  summary_cz: string;
  category: string;
  author: string | null;
};

const ARTICLES = (articlesData as { articles: RawArticle[] }).articles;

function regionOf(source: string): Region {
  if (source === "HN") return "cz";
  if (source === "DenikN_sk") return "sk";
  return "svet";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sources = (url.searchParams.get("sources") ?? "cz,sk,svet").split(",") as Region[];
    const language = url.searchParams.get("language") ?? "cs";

    const filtered = ARTICLES.filter((a) => sources.includes(regionOf(a.source)));

    const articleLines = filtered
      .map(
        (a) =>
          `- [${a.source}${a.page ? "/" + a.page : ""}] (${a.category}${a.author ? ", autor: " + a.author : ""}) ${a.headline} — ${a.summary_cz}`,
      )
      .join("\n");

    const system = `Jsi šéfeditor české press intelligence služby shrn.to (ve stylu Fleet Sheet od Erika Besta).
Z dodaných článků napíšeš denní brief složený z TOP STORIES — ne výpis, ale redakčně zpracované příběhy.

ZÁSADY:
- Tři rubriky v pořadí: ekonomika, politika, nazory. V každé 5–7 top stories (vyber to nejdůležitější). Raději více úzce zaměřených samostatných stories než málo přeplácaných — jedna story = jedna konkrétní událost/téma.
- Každá story: výstižný český titulek + tělo 125–175 slov plynulého textu.
- KONSOLIDACE (úzká definice): slij do JEDNÉ story POUZE články o TÉŽE konkrétní události, kauze nebo aktérovi (např. tentýž summit, tatáž firma, tentýž konflikt). Tehdy atribuuj fakta ke zdrojům přímo v textu a kde má některý deník unikátní úhel, řekni to ("FAZ jako jediný uvádí…", "FT k tomu dodává…").
- NIKDY neslévej do jedné story nesouvisející příběhy jen proto, že spadají do stejné rubriky nebo obecné oblasti (např. dvě různé soudní kauzy, dvě různé firmy). Každá samostatná událost = samostatná story.
- ZAKÁZÁNO: vykonstruované zobecňující dovětky, které mají uměle spojit nesouvisející témata ("justice na obou stranách Atlantiku", "trhy po celém světě v pohybu"). Pokud příběhy nesdílejí konkrétní událost, prostě je nech jako oddělené story.
- Singletony (událost jen v jednom zdroji) zpracuj jako samostatnou story s jedním zdrojem — to je naprosto v pořádku a běžné.
- U rubriky "nazory" (komentáře): pokud má komentář v datech uvedeného autora, vyplň u story pole "author" jménem autora a začni tělo přirozeně ("Podle Karla Nedvěda…" apod.). U zpravodajských stories (ekonomika, politika) nech "author" prázdné. Autora ber jen z dat, nikdy nevymýšlej.
- Veď českým/CEE děním, mezinárodní zdroje (FT/NYT/FAZ) přidávej jako kontext.
- NIKDY si nevymýšlej fakta ani zdroje. Cituj jen to, co je v dodaných článcích.
- Jazyk výstupu: ${language === "sk" ? "slovenština" : language === "en" ? "angličtina" : "čeština"}.

FORMÁT TĚLA: tělo je pole útržků, které se střídají:
- { "type": "text", "text": "část věty nebo věta" }
- { "type": "src", "source": "HN", "page": 1 }   ← badge hned ZA tvrzením, které ze zdroje pochází
Použij PŘESNÉ kódy zdroje (HN, FT_online, FT_print, NYT, FAZ, DenikN_sk). page = číslo jen pokud ho článek má, jinak null.

"spotlight" = 2–3 věty o tom nejdůležitějším pro dnešek (bez zdrojů).

Vrať POUZE validní JSON, bez markdownu.`;

    const user = `Datum: pátek 15. května 2026.

Články:
${articleLines}

Vrať JSON přesně v tomto tvaru:
{
  "spotlight": "string",
  "rubriky": [
    {
      "id": "ekonomika",
      "stories": [
        {
          "title": "string",
          "author": null,
          "body": [
            { "type": "text", "text": "Vláda zvažuje úlevy na ceně elektřiny" },
            { "type": "src", "source": "HN", "page": 1 },
            { "type": "text", "text": ". FT k tomu dodává, že IEA varuje před růstem cen ropy" },
            { "type": "src", "source": "FT_online", "page": null }
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

    const text = resp.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");

    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    const brief: Brief = {
      avatar: "PK",
      greeting: "Dobré ráno, Pavle.",
      dateline: "Pátek 15. května 2026 · brief 07:42",
      spotlightLabel: "Dnes sledujte",
      spotlight: parsed.spotlight,
      rubriky: parsed.rubriky,
    };

    return new Response(JSON.stringify(brief), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (err) {
    console.error("brief error:", err);
    return Response.json({ error: "Generování briefu selhalo." }, { status: 500 });
  }
}