"use client";

import { usePreferences, type Language } from "@/lib/preferences";

const cs = {
  common: { enter: "Vstoupit", resetDemo: "Resetovat demo", back: "Zpět na brief", settings: "Nastavení", search: "Hledat", brief: "Brief" },
  login: { tagline: "Tichý ranní brief.", subtitle: "Z českého, slovenského i světového tisku. Každé ráno v 7:00.", footer: "Demo verze · 15.05.2026 · shrn.to" },
  onboarding: { welcome: "Vítej.", intro: "Nastav si svůj denní brief. Změnit to můžeš kdykoli.", langLabel: "Jazyk shrnutí", langHint: "Originální články zůstávají v jazyce zdroje.", sourcesLabel: "Zdrojové země", sourcesHint: "Z jakého tisku má brief čerpat? Vyber jednu nebo více.", lengthLabel: "Délka shrnutí", cta: "Vytvořit můj brief" },
  settings: { title: "Nastavení", subtitle: "Změny se ukládají automaticky.", langLabel: "Jazyk shrnutí", langHint: "Originální články zůstávají v jazyce zdroje.", sourcesLabel: "Zdrojové země", sourcesHint: "Z jakého tisku má brief čerpat?", lengthLabel: "Délka shrnutí" },
  loading: { title: "Připravuji tvůj brief.", sub: "Obvykle 15–20 sekund", steps: ["Načítám články z 12 zdrojů", "Píšu tvé první shrnutí", "Připravuji rozhraní"] },
  brief: { generating: "Generuji tvůj brief…", spotlightLabel: "Dnes sledujte" },
  search: { placeholder: "Zeptej se na firmu, sektor nebo vývoj…", searching: "Hledám v korpusu…", emptyTitle: "Co tě dnes zajímá?", emptySub: "Brief odpoví ze syntézy CZ, SK i světového tisku.", tryStart: "Zkus začít", recent: "Nedávné dotazy", continue: "Pokračovat", synthesis: "Syntéza", suggested: ["Co je nového u Schillerové a státních dluhopisů?", "Jak dopadly výsledky bank (Erste, KB, Moneta)?", "Co se děje kolem Tchaj-wanu?", "Vlna propouštění v Německu?"], recentList: [{ q: "Jaký dopad měla emise CSG na pražskou burzu?", time: "včera" }, { q: "Co řekla ČNB k inflaci?", time: "3 dny" }, { q: "Jak se vyvíjely výnosy státních dluhopisů?", time: "tento týden" }] },
  controls: { langCs: "Čeština", langEn: "English", short: "Krátký", longer: "Delší" },
  regions: { cz: "Český tisk", sk: "Slovenský tisk", svet: "Svět" },
  rubriky: { ekonomika: "Ekonomika", politika: "Politika", nazory: "Názory" },
};

type Dict = typeof cs;

const en: Dict = {
  common: { enter: "Enter", resetDemo: "Reset demo", back: "Back to brief", settings: "Settings", search: "Search", brief: "Brief" },
  login: { tagline: "Your quiet morning brief.", subtitle: "From Czech, Slovak and global press. Every morning at 7:00.", footer: "Demo · 15 May 2026 · shrn.to" },
  onboarding: { welcome: "Welcome.", intro: "Set up your daily brief. You can change this anytime.", langLabel: "Summary language", langHint: "Original articles stay in their source language.", sourcesLabel: "Source regions", sourcesHint: "Which press should the brief draw from? Pick one or more.", lengthLabel: "Summary length", cta: "Create my brief" },
  settings: { title: "Settings", subtitle: "Changes are saved automatically.", langLabel: "Summary language", langHint: "Original articles stay in their source language.", sourcesLabel: "Source regions", sourcesHint: "Which press should the brief draw from?", lengthLabel: "Summary length" },
  loading: { title: "Preparing your brief.", sub: "Usually 15–20 seconds", steps: ["Loading articles from 12 sources", "Writing your first summary", "Preparing the interface"] },
  brief: { generating: "Generating your brief…", spotlightLabel: "Today's focus" },
  search: { placeholder: "Ask about a company, sector or trend…", searching: "Searching the corpus…", emptyTitle: "What are you curious about today?", emptySub: "The brief answers from a synthesis of Czech, Slovak and global press.", tryStart: "Try starting with", recent: "Recent queries", continue: "Continue", synthesis: "Synthesis", suggested: ["What's new with Schillerová and government bonds?", "How did the banks' results turn out (Erste, KB, Moneta)?", "What's happening around Taiwan?", "The wave of layoffs in Germany?"], recentList: [{ q: "What impact did the CSG issue have on the Prague exchange?", time: "yesterday" }, { q: "What did the Czech National Bank say about inflation?", time: "3 days" }, { q: "How did Czech government bond yields develop?", time: "this week" }] },
  controls: { langCs: "Czech", langEn: "English", short: "Short", longer: "Longer" },
  regions: { cz: "Czech press", sk: "Slovak press", svet: "World" },
  rubriky: { ekonomika: "Economy", politika: "Politics", nazory: "Opinion" },
};

const DICT: Record<Language, Dict> = { cs, en };

export function useT(): Dict {
  const { prefs } = usePreferences();
  return DICT[prefs.language] ?? cs;
}

export function getDict(lang: Language): Dict {
  return DICT[lang] ?? cs;
}