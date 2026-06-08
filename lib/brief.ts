import type { Source } from "@/components/src-badge";
import type { RubrikaId } from "@/components/rubrika";

export type SynthItem = {
  text: string;
  source: Source;
  page?: number | null;
  url?: string | null;
};

export type BriefRubrika = {
  id: RubrikaId;
  meta: string;
  items: SynthItem[];
};

export type Brief = {
  avatar: string;
  greeting: string;
  dateline: string;
  spotlightLabel: string;
  spotlight: string;
  rubriky: BriefRubrika[];
};

// DOČASNÝ fixture pro Krok 3 — nahradí synthesis z Anthropic API (Krok 5).
export const DEMO_BRIEF: Brief = {
  avatar: "PK",
  greeting: "Dobré ráno, Pavle.",
  dateline: "Pátek 15. května 2026 · brief 07:42",
  spotlightLabel: "Dnes sledujte",
  spotlight:
    "Schillerová dnes spouští novou retailovou emisi státních dluhopisů, trh čeká na reakci po solidních výsledcích bank, a v Německu sílí vlna propouštění (VW, BioNTech).",
  rubriky: [
    {
      id: "ekonomika",
      meta: "4 zdroje · CZ + svět",
      items: [
        {
          text: "Ministryně financí Schillerová představila novou emisi Dluhopisů republiky pro retailové investory.",
          source: "HN",
        },
        {
          text: "Čeští investoři uzavřeli další miliardový obchod v Polsku — získali zavedené obchodní centrum.",
          source: "HN",
        },
        {
          text: "VW, BioNTech a další německé firmy oznamují vlnu propouštění; analytici se obávají, že je to teprve začátek.",
          source: "HN",
        },
        {
          text: "Mezinárodní energetická agentura varuje před dalším růstem cen ropy kvůli rekordnímu úbytku globálních zásob.",
          source: "FT_online",
        },
      ],
    },
    {
      id: "politika",
      meta: "4 zdroje · CZ + svět",
      items: [
        {
          text: "Ministr školství představil reformu vysokých škol — akademické senáty oslabí, posílí pravomoci rektorů.",
          source: "HN",
        },
        {
          text: "NKÚ zjistil, že přes polovinu dotací na opravy obecních cest šla na nevýznamné komunikace.",
          source: "HN",
          page: 2,
        },
        {
          text: "Na ministerstvu Juchelky další otřesy — rezignovala náměstkyně.",
          source: "HN",
        },
        {
          text: "Rusko ani Ukrajina nevěří v obnovení mírových jednání zprostředkovaných USA.",
          source: "FT_online",
        },
      ],
    },
    {
      id: "nazory",
      meta: "3 komentáře · CZ + svět",
      items: [
        {
          text: "Analytik Fio banky komentuje solidní výsledky Erste, Komerční banky a Monety za 4. čtvrtletí.",
          source: "HN",
          page: 13,
        },
        {
          text: "Komentář varuje před rizikem nového inflačního skoku v souvislosti s rostoucími cenami ropy.",
          source: "HN",
          page: 14,
        },
        {
          text: "Nový šéf Fedu Kevin Warsh plánuje zúžit komunikaci centrální banky, včetně zrušení 'dot plots'.",
          source: "FT_online",
        },
      ],
    },
  ],
};