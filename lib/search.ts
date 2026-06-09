import type { Source } from "@/components/src-badge";

export type SearchItem = {
  text: string;
  source: Source | null; // null = bez opory v korpusu
  page?: number | null;
};

export type SearchAnswer = {
  question: string;
  meta: string;
  items: SearchItem[];
  followups: string[];
};