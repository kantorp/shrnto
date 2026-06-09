import Anthropic from "@anthropic-ai/sdk";
import articlesData from "@/data/articles.json";
import type { Brief } from "@/lib/brief";
import type { Region } from "@/lib/preferences";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic(); // čte ANTHROPIC_API_KEY z prostředí

type RawArticle = {
  source: string;
  page: number | null;
  headline: string;
  summary_cz: string;
  category: string;
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
    const length = url.searchParams.get("length") ?? "long";
    const language = url.searchParams.get("language") ?? "cs";

    const filtered = ARTICLES.filter((a) => sources.includes(regionOf(a.source)));

    const articleLines = filtered
      .map(
        (a) =>
          `- [${a.source}${a.page ? "/" + a.page : ""}] (${a.category}) ${a.headline} — ${a.summary_cz}`,
      )
      .join("\n");

    const perRubrika = length === "short" ? "1–2" : "4–6";

    const system = `Jsi zkušený editor české press intelligence služby shrn.to (ve stylu Fleet Sheet).
Z dodaných článků napíšeš denní brief: destilát, NE výpis článků.
Pravidla:
- Tři rubriky v tomto pořadí: ekonomika, politika, nazory.
- Každá rubrika: ${perRubrika} hutných vět, které syntetizují klíčové dění. Žádná vata, žádné fráze.
- Veď českým/CEE děním (HN, DenikN), mezinárodní zdroje (FT/NYT/FAZ) přidávej jako globální kontext.
- Každá věta musí citovat reálný zdroj z dodaných článků: použij PŘESNÝ kód zdroje (HN, FT_online, FT_print, NYT, FAZ, DenikN_sk) a page (číslo) jen pokud ho článek má, jinak null.
- "spotlight" = 1–2 věty o tom nejdůležitějším pro dnešek (bez zdroje).
- "meta" každé rubriky = "N zdrojů" (počet zdrojů, ze kterých rubrika čerpá).
- Jazyk výstupu: ${language === "sk" ? "slovenština" : language === "en" ? "angličtina" : "čeština"}.
Vrať POUZE validní JSON, bez markdownu, bez jakéhokoli textu navíc.`;

    const user = `Datum: pátek 15. května 2026.

Články:
${articleLines}

Vrať JSON přesně v tomto tvaru:
{
  "spotlight": "string",
  "rubriky": [
    { "id": "ekonomika", "meta": "string", "items": [ { "text": "string", "source": "HN", "page": 12 } ] },
    { "id": "politika",  "meta": "string", "items": [ { "text": "string", "source": "FT_online", "page": null } ] },
    { "id": "nazory",    "meta": "string", "items": [ { "text": "string", "source": "HN", "page": 14 } ] }
  ]
}`;

    const resp = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4000,
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