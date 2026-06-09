import Anthropic from "@anthropic-ai/sdk";
import articlesData from "@/data/articles.json";
import type { SearchAnswer } from "@/lib/search";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic();

type RawArticle = {
  source: string;
  page: number | null;
  headline: string;
  summary_cz: string;
};

const ARTICLES = (articlesData as { articles: RawArticle[] }).articles;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    if (!q) return Response.json({ error: "Chybí dotaz." }, { status: 400 });

    const articleLines = ARTICLES.map(
      (a) => `- [${a.source}${a.page ? "/" + a.page : ""}] ${a.headline} — ${a.summary_cz}`,
    ).join("\n");

    const system = `Jsi analytik press intelligence shrn.to. Odpovídáš na dotaz uživatele POUZE na základě dodaných článků (syntéza, ne výpis).
Pravidla:
- Odpověz česky, hutně, 2–5 vět.
- Každá věta cituje reálný zdroj: PŘESNÝ kód (HN, FT_online, FT_print, NYT, FAZ, DenikN_sk) a page (číslo) jen pokud ho článek má, jinak null.
- Pokud k tématu v dodaných článcích NENÍ opora, napiš jednu větu, že k tomu v korpusu nemáš podklady (source: null), a nic si nevymýšlej.
- Navrhni 3 krátké navazující dotazy související s tématem.
Vrať POUZE validní JSON, bez markdownu.`;

    const user = `Dotaz: "${q}"

Články:
${articleLines}

Vrať JSON přesně v tomto tvaru:
{
  "items": [ { "text": "string", "source": "HN", "page": 12 } ],
  "followups": ["string", "string", "string"]
}`;

    const resp = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: user }],
    });

    const text = resp.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");

    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    const sources = new Set(
      (parsed.items ?? []).map((i: { source: string | null }) => i.source).filter(Boolean),
    );
    const n = sources.size;
    const meta = n ? `${n} ${n === 1 ? "zdroj" : n < 5 ? "zdroje" : "zdrojů"}` : "";

    const answer: SearchAnswer = {
      question: q,
      meta,
      items: parsed.items ?? [],
      followups: parsed.followups ?? [],
    };

    return new Response(JSON.stringify(answer), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (err) {
    console.error("search error:", err);
    return Response.json({ error: "Vyhledávání selhalo." }, { status: 500 });
  }
}