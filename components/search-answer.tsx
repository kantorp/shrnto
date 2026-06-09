import type { SearchItem } from "@/lib/search";
import { SrcBadge } from "@/components/src-badge";

export function SearchAnswerBody({ items }: { items: SearchItem[] }) {
  return (
    <p className="font-body text-[15px] leading-7 text-ink-2">
      {items.map((item, i) => {
        const words = item.text.split(" ");
        const last = words.pop();
        const head = words.join(" ");
        return (
          <span key={i}>
            {head}{" "}
            <span className="whitespace-nowrap">
              {last}
              {item.source && (
                <SrcBadge
                  source={item.source}
                  page={item.page}
                  className="ml-1"
                />
              )}
            </span>{" "}
          </span>
        );
      })}
    </p>
  );
}