import type { Source } from "@/components/src-badge";
import type { RubrikaId } from "@/components/rubrika";

export type StorySpan =
  | { type: "text"; text: string }
  | { type: "src"; source: Source; ref?: string | null; page?: number | null; url?: string | null };

export type Story = {
  title: string;
  author?: string | null;
  body: StorySpan[];
  shortBody?: StorySpan[];
};

export type BriefRubrika = {
  id: RubrikaId;
  stories: Story[];
};

export type Brief = {
  avatar: string;
  greeting: string;
  dateline: string;
  spotlightLabel: string;
  spotlight: string;
  rubriky: BriefRubrika[];
};