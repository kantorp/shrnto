import type { Story } from "@/lib/brief";

// Řazení: čtenářská důležitost (importance) vede, sourceCount rozhoduje při shodě.
const bySalience = (a: Story, b: Story) =>
  (b.importance ?? 1) - (a.importance ?? 1) ||
  (b.sourceCount ?? 1) - (a.sourceCount ?? 1);

export type ThemeGroup = { theme: string; stories: Story[] };

// Rubrika → témata (dle nejsilnějšího Story) → Story (dle salience).
// Když story nemá theme (staré bundly), spadne do skupiny "" a render ji vykreslí ploše.
export function groupAndSort(stories: Story[]): ThemeGroup[] {
  const groups = new Map<string, Story[]>();
  for (const s of stories) {
    const key = s.theme ?? "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }
  for (const list of groups.values()) list.sort(bySalience);

  return [...groups.entries()]
    .map(([theme, list]) => ({ theme, stories: list }))
    .sort((a, b) => bySalience(a.stories[0], b.stories[0]));
}

// Názory: bez seskupování, jen dle importance.
export function sortStoriesByImportance(stories: Story[]): Story[] {
  return [...stories].sort((a, b) => (b.importance ?? 1) - (a.importance ?? 1));
}