"use client";

import { Stage } from "@/lib/types";

const STAGES = [
  { key: "ideation", label: "Ideation", stages: ["ideation_cmo", "ideation_cto", "ideation_ceo"] },
  { key: "research", label: "Research", stages: ["market_research"] },
  { key: "prototype", label: "Prototype", stages: ["prototyping_build", "prototyping_review", "complete"] },
] as const;

export default function StageIndicator({ current }: { current: Stage }) {
  const activeIdx = STAGES.findIndex((s) =>
    (s.stages as readonly string[]).includes(current)
  );

  return (
    <div className="flex items-center gap-2 px-4 py-3">
      {STAGES.map((s, i) => {
        const isActive = i === activeIdx;
        const isDone = i < activeIdx || current === "complete";
        return (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`h-px w-6 ${isDone ? "bg-white" : "bg-neutral-800"}`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`h-2 w-2 rounded-full transition-colors ${
                  isDone
                    ? "bg-white"
                    : isActive
                      ? "bg-white animate-pulse"
                      : "bg-neutral-800"
                }`}
              />
              <span
                className={`text-xs font-medium tracking-wide uppercase ${
                  isDone || isActive ? "text-white" : "text-neutral-600"
                }`}
              >
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
