"use client";

import { ResearchCard, Competitor } from "@/lib/types";

export function ViralCards({ cards }: { cards: ResearchCard[] }) {
  return (
    <div className="px-4 py-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
        Verified Viral Content ({cards.length} results)
      </h3>
      {cards.length === 0 && (
        <div className="rounded-lg border border-neutral-800 p-3">
          <p className="text-xs leading-relaxed text-neutral-500">
            No direct posts or videos with clear viral signals were found. Generic
            search, discover, channel, and results pages were filtered out.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {cards.map((card, i) => (
          <a
            key={i}
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 rounded-lg border border-neutral-800 p-3 hover:border-neutral-600 transition-colors"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-neutral-800 text-xs font-bold text-neutral-400 group-hover:text-white transition-colors">
              {card.source === "TikTok"
                ? "TT"
                : card.source === "YouTube"
                  ? "YT"
                  : "X"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-neutral-200 leading-snug line-clamp-2">
                {card.title}
              </p>
              <p className="text-[10px] text-neutral-500 mt-1">
                {card.source}
                {card.viralitySignal ? ` · ${card.viralitySignal}` : ""}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export function CompetitorList({
  competitors,
}: {
  competitors: Competitor[];
}) {
  return (
    <div className="px-4 py-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
        Top Competitors ({competitors.length})
      </h3>
      <div className="space-y-2">
        {competitors.map((c, i) => (
          <div
            key={i}
            className="rounded-lg border border-neutral-800 p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-white">
                {c.name}
              </span>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-neutral-500 hover:text-neutral-300"
              >
                Visit &rarr;
              </a>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {c.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
