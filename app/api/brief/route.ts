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

const ARTICLES = (articlesData as { articles: RawArticle[] }).articles;

function regionOf(source: string): Region {
  if (source === "HN" || source === "HN_archive") return "cz";
  if (source === "DenikN_sk") return "sk";
  return "svet";
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

    const themeBlock = `TÉMATA — u rubrik ekonomika a politika přiřaď KAŽDÉ story právě jedno téma (pole "theme"). Vyber NEJBLIŽŠÍ z níže uvedených, NEVYMÝŠLEJ nová. Když opravdu nic nesedí, použij "${THEME_FALLBACK}".
- ekonomika: ${THEMES.ekonomika.join(", ")}
- politika: ${THEMES.politika.join(", ")}
U rubriky nazory téma nepřiřazuj — nech "theme": "".`;

    const consolidationBlock =
      mode === "fleet"
        ? `KONSOLIDACE — FLEET REŽIM: NEslučuj. Jeden článek = jedna samostatná story. "sourceCount" je vždy 1. Každý relevantní článek z ekonomiky a politiky zpracuj jako vlastní story. Témata, řazení i ostatní pravidla platí beze změny.`
        : `KONSOLIDACE (úzká definice): slij do JEDNÉ story POUZE články o TÉŽE konkrétní události, kauze nebo aktérovi (tentýž summit, tatáž firma, tentýž konflikt). Tehdy atribuuj fakta ke zdrojům přímo v textu a kde má některý deník unikátní úhel, řekni to ("FAZ jako jediný uvádí…", "FT k tomu dodává…").
- NIKDY neslévej nesouvisející příběhy jen proto, že spadají do stejné rubriky nebo obecného tématu.
- PŘÍKLAD CHYBY (NEDĚLEJ): pod titulek o rozhodnutí vlády o ceně elektřiny NEpatří věta, že se Německo obává energetických přídělů, ani že IEA varuje před růstem cen ropy. To jsou JINÉ události — patří do téhož tématu (Energetika), ale jako SAMOSTATNÉ story.
- Singletony (událost jen v jednom zdroji) zpracuj jako samostatnou story s jedním zdrojem — to je v pořádku a běžné.`;

    const system = `Jsi šéfeditor české press intelligence služby shrn.to (ve stylu Fleet Sheet od Erika Besta).
Z dodaných článků napíšeš denní brief složený z TOP STORIES — ne výpis, ale redakčně zpracované příběhy. Tvým úkolem je REFEROVAT fakta, ne je komentovat.

ZÁSADY:
- Tři rubriky v pořadí: ekonomika, politika, nazory. V ekonomice a politice ${mode === "fleet" ? "udělej z každého relevantního článku samostatnou story" : "vyber 5–7 nejdůležitějších stories — jedna story = jedna konkrétní událost"}.
- Každá story: výstižný český titulek + tělo 100–150 slov plynulého textu, tak úplné, aby čtenář nemusel číst původní článek.

${consolidationBlock}

ZÁKAZ HODNOCENÍ (platí pro ekonomika a politika): referuj, neinterpretuj. NEPIŠ věty, které spojují fakta do závěru, soudu nebo implikace.
Zakázané vzory (přesně takovým se vyhni):
  "Stát tak na jedné straně shání peníze od domácností a na druhé rozjíždí rozsáhlé infrastrukturní výdaje."
  "Kombinace rostoucích investic a sporné efektivity dotací ukazuje, jak křehká je disciplína obecních rozpočtů."
Fakta uveď, závěr ať si udělá čtenář sám. (V rubrice nazory je hodnocení obsahem — viz níže.)

${themeBlock}

ŘAZENÍ — u KAŽDÉ story vyplň dvě číselná pole (řazení dělá až aplikace, ty jen vyplň signály):
- "sourceCount": počet RŮZNÝCH zdrojů, které tutéž událost pokryly (ve fleet režimu vždy 1).
- "importance": 1–3, jak zásadní událost to je (3 = vede dni, 1 = okrajové). INTERNÍ signál, NIKDY ho nepiš do textu.

NÁZORY (rubrika nazory): každý komentář = jedna story, NIKDY neslučuj. Pokud má komentář v datech autora, vyplň pole "author" a názor VŽDY připiš autorovi ("Podle Karla Nedvěda…"), nikdy ho neuváděj v našem hlase. U zpravodajských stories (ekonomika, politika) nech "author" prázdné. Autora ber jen z dat, nikdy nevymýšlej.

DALŠÍ:
- Veď českým/CEE děním, mezinárodní zdroje (FT/NYT/FAZ) přidávej jako kontext.
- NIKDY si nevymýšlej fakta ani zdroje. Cituj jen to, co je v dodaných článcích.
- Jazyk výstupu: ${lang}.

FORMÁT TĚLA: tělo je pole útržků, které se střídají:
- { "type": "text", "text": "část věty nebo věta" }
- { "type": "src", "source": "HN", "ref": "art_012" }   ← badge hned ZA tvrzením; "ref" je ID článku ve složených závorkách {…} z dodaného seznamu, ze kterého tvrzení pochází
Použij PŘESNÉ kódy zdroje (HN, FT_online, FT_print, NYT, FAZ, DenikN_sk) a PŘESNÉ ref ID z dodaných článků (nikdy si ref nevymýšlej).

KRÁTKÁ VERZE: ke každé story navíc vytvoř pole "shortBody" ve STEJNÉM formátu útržků — zhruba 2 věty na JEDEN zdrojový článek (u konsolidace úměrně rozšiř na cca 2 věty na každý zdroj). Zachovej klíčovou atribuci (src útržky s ref).

ÚDAJ DNE: pole "spotlight" = JEDEN výrazný fakt nebo číslo z dnešního korpusu, který přiláká pozornost. NENÍ to shrnutí toho, co je níž. Jedna věta, klidně s konkrétním číslem. Bez zdrojů.

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
          "theme": "Energetika",
          "sourceCount": 2,
          "importance": 3,
          "body": [
            { "type": "text", "text": "Vláda zvažuje úlevy na ceně elektřiny" },
            { "type": "src", "source": "HN", "ref": "art_031" }
          ],
          "shortBody": [
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

    const text = resp.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");

    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    // dohledej reálnou URL (a doplň page) podle ref ID — v plné i krátké verzi
    const urlById = new Map(ARTICLES.map((a) => [a.id, { url: a.url, page: a.page }]));
    const resolveSpans = (spans: { type: string; ref?: string; url?: string | null; page?: number | null }[] = []) => {
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